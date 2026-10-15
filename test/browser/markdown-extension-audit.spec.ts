import { test, expect } from '@playwright/test';
import { routeApplicationAssets } from './helpers/application';
import { Jimp } from 'jimp';
import { writeFile } from 'node:fs/promises';

const failures = (events: any[]) =>
    events.filter((event) => (event.type !== 'console' || event.level === 'error') && !(event.type === 'requestfailed' && event.error?.errorText === 'net::ERR_ABORTED'));

test('audits the manual extension document', async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const events: unknown[] = [];
    page.on('console', (message) => events.push({ type: 'console', level: message.type(), text: message.text() }));
    page.on('pageerror', (error) => events.push({ type: 'pageerror', message: error.message }));
    page.on('requestfailed', (request) => events.push({ type: 'requestfailed', url: request.url(), error: request.failure() }));
    page.on('response', (response) => {
        if (response.status() >= 400) events.push({ type: 'http', status: response.status(), url: response.url() });
    });
    await page.goto(
        '/test/browser/fixtures/extensions.html?features=mermaid,smiles,abc,verovio,graphviz,vega-lite,maps,molecule-3d,model-3d&src=/test/browser/fixtures/extension-showcase.md',
    );
    await expect(page.locator('markdown-document')).toHaveAttribute('state', 'ready', { timeout: 150_000 });
    const viewer = page.locator('markdown-document');
    await expect(viewer.locator('[role="alert"]')).toHaveCount(0);
    for (const language of ['mei', 'musicxml']) await expect(viewer.locator(`[data-markdown-language="${language}"] .note use`)).toHaveCount(1);
    await expect(viewer.locator('.leaflet-interactive')).toHaveCount(3);
    const colors = await viewer.locator('code.language-javascript').evaluate((code) => ({
        keyword: getComputedStyle(code.querySelector('.hljs-keyword')!).color,
        number: getComputedStyle(code.querySelector('.hljs-number')!).color,
        base: getComputedStyle(code).color,
    }));
    expect(colors.keyword).not.toBe(colors.base);
    expect(colors.number).not.toBe(colors.keyword);
    const headings = viewer.locator('h3[id^="repeated-example-heading"]');
    await expect(headings).toHaveCount(2);
    expect(await headings.nth(0).getAttribute('id')).not.toBe(await headings.nth(1).getAttribute('id'));
    await expect(viewer.locator('a[data-markdown-source-href="extension-showcase-notes.md"]')).toHaveAttribute(
        'href',
        'http://127.0.0.1:4173/test/browser/fixtures/extension-showcase-notes.md',
    );
    const blocks = await page.evaluate(() => {
        const root = document.querySelector('markdown-document')!.shadowRoot!;
        return Array.from(root.querySelectorAll('[data-markdown-extension]'), (block) => ({
            extension: block.getAttribute('data-markdown-extension'),
            language: block.getAttribute('data-markdown-language'),
            error: block.querySelector('[role="alert"]')?.textContent,
            state: block.querySelector('[role="alert"]') ? 'error' : block.querySelector('.markdown-extension-source') ? 'pending' : 'rendered',
            text: block.textContent?.slice(0, 250),
            width: block.getBoundingClientRect().width,
            height: block.getBoundingClientRect().height,
            svg: block.querySelectorAll('svg').length,
            notes: block.querySelectorAll('.note use').length,
            uses: Array.from(block.querySelectorAll('use'), (node) => ({ href: node.getAttribute('href'), xlink: node.getAttribute('xlink:href') })),
            canvas: block.querySelectorAll('canvas').length,
        }));
    });
    await writeFile(testInfo.outputPath('audit.json'), JSON.stringify({ events, blocks }, null, 2));
    await testInfo.attach('audit.json', { path: testInfo.outputPath('audit.json'), contentType: 'application/json' });
    await page.screenshot({ path: testInfo.outputPath('extensions.png'), fullPage: true });
    for (const language of ['mei', 'musicxml', 'geojson', 'topojson', 'pdb', 'xyz', 'stl', 'obj']) {
        const block = page.locator(`markdown-document [data-markdown-language="${language}"]`);
        await block.scrollIntoViewIfNeeded();
        const screenshot = await block.screenshot({ path: testInfo.outputPath(`${language}.png`) });
        if (['pdb', 'xyz', 'stl', 'obj'].includes(language)) {
            const bitmap = (await Jimp.read(screenshot)).bitmap;
            let colored = 0;
            for (let index = 0; index < bitmap.data.length; index += 4) {
                if (Math.min(bitmap.data[index]!, bitmap.data[index + 1]!, bitmap.data[index + 2]!) < 220) colored++;
            }
            expect(colored, `${language} must contain rendered geometry`).toBeGreaterThan(30);
        }
    }
    expect(failures(events)).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    const map = viewer.locator('[data-markdown-language="geojson"]');
    await map.scrollIntoViewIfNeeded();
    await expect(map.locator('.leaflet-interactive')).toHaveCount(2);
    expect(await map.evaluate((element) => element.getBoundingClientRect().width)).toBeLessThanOrEqual(390);
    await map.screenshot({ path: testInfo.outputPath('map-mobile.png') });
    expect(failures(events)).toEqual([]);
});

test('reports an exact missing resource without blocking a neighboring extension', async ({ page }) => {
    await page.goto('/test/browser/fixtures/extensions.html?features=vega-lite,graphviz&src=/test/browser/fixtures/extension-showcase.md');
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 90_000 });
    await viewer.evaluate((element) => {
        (element as any).context = { sourceUrl: new URL('/test/browser/fixtures/extension-showcase.md', location.href), resourcePolicy: { allowedOrigins: [location.origin] } };
        (element as any).markdown = '```vega-lite\n{"data":{"url":"missing-audit.json"},"mark":"point"}\n```\n\n```dot\ndigraph {a -> b}\n```';
    });
    await expect(viewer.locator('[role="alert"]')).toContainText('Vega-Lite (vega-lite): 404');
    await expect(viewer.locator('[role="alert"]')).toContainText('http://127.0.0.1:4173/test/browser/fixtures/missing-audit.json');
    await expect(viewer.locator('[data-markdown-extension="graphviz"] svg')).toBeVisible();
});

test('audits markdown() in the application', async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    // Network-independent coverage of the app's online map defaults.
    const tile = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#d8e7cb"/></svg>';
    await page.route('https://tile.openstreetmap.org/**', (route) => route.fulfill({ contentType: 'image/svg+xml', body: tile }));
    await page.route('https://basemaps.cartocdn.com/**', (route) => route.fulfill({ contentType: 'image/svg+xml', body: tile }));
    const events: unknown[] = [];
    page.on('console', (message) => events.push({ type: 'console', level: message.type(), text: message.text() }));
    page.on('pageerror', (error) => events.push({ type: 'pageerror', message: error.message }));
    page.on('requestfailed', (request) => events.push({ type: 'requestfailed', url: request.url(), error: request.failure() }));
    page.on('response', (response) => {
        if (response.status() >= 400) events.push({ type: 'http', status: response.status(), url: response.url() });
    });
    await routeApplicationAssets(page);
    await page.goto('/dist/en/index.html');
    // App startup opens its README separately; settle that session before
    // monitoring the manual document. External badges remain in the capture.
    await expect(page.locator('markdown-document').first()).toHaveAttribute('state', 'ready', { timeout: 30_000 });
    await page
        .locator('markdown-document')
        .first()
        .locator('img')
        .evaluateAll((images) =>
            Promise.all(
                images.map((image) => {
                    if ((image as HTMLImageElement).complete) return Promise.resolve();
                    return new Promise<void>((resolve) => {
                        image.addEventListener('load', () => resolve(), { once: true });
                        image.addEventListener('error', () => resolve(), { once: true });
                    });
                }),
            ),
        );
    const startupEvents = events.splice(0);
    const prompt = page.locator('command-prompt').last();
    await expect(prompt.locator('textarea')).toBeVisible({ timeout: 30_000 });
    await prompt.locator('textarea').fill('markdown("../test/browser/fixtures/extension-showcase.md")');
    await prompt.locator('textarea').press('Enter');
    const viewer = page.locator('markdown-document[src$="/test/browser/fixtures/extension-showcase.md"]');
    await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 150_000 });
    await expect(viewer.locator('[role="alert"]')).toHaveCount(0);
    await expect(viewer.locator('[data-markdown-extension="mathjslab"] .js-plotly-plot')).toHaveCount(2);
    const blocks = await viewer.evaluate((element) =>
        Array.from(element.shadowRoot!.querySelectorAll('[data-markdown-extension]'), (block) => ({
            extension: block.getAttribute('data-markdown-extension'),
            language: block.getAttribute('data-markdown-language'),
            error: block.querySelector('[role="alert"]')?.textContent,
            state: block.querySelector('[role="alert"]') ? 'error' : block.querySelector('.markdown-extension-source') ? 'pending' : 'rendered',
            text: block.textContent?.slice(0, 300),
            width: block.getBoundingClientRect().width,
            height: block.getBoundingClientRect().height,
            svg: block.querySelectorAll('svg').length,
            canvas: block.querySelectorAll('canvas').length,
        })),
    );
    await writeFile(testInfo.outputPath('application-audit.json'), JSON.stringify({ startupEvents, events, blocks }, null, 2));
    await testInfo.attach('application-audit.json', { path: testInfo.outputPath('application-audit.json'), contentType: 'application/json' });
    await page.screenshot({ path: testInfo.outputPath('application-extensions.png'), fullPage: true });
    expect(failures(events)).toEqual([]);
});
