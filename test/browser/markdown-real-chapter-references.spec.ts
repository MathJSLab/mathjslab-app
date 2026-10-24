import { expect, test } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { routeApplicationAssets } from './helpers/application';

const base = 'https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/digital-electronics/pt/';
const chapter = 'introduction-to-digital-electronics.md';
const directory = `${process.env.MARKDOWN_EXAMPLE_SOURCE_ROOT ?? 'node_modules/mathjslab-markdown/example'}/digital-electronics/pt/`;
const labels = [
    'fig-analog-digital',
    'fig-digitization-flow',
    'fig-logic-interface',
    'fig-digital-timing',
    'fig-sequential-system',
    'fig-abstraction-levels',
    'fig-temperature-controller',
    'fig-illumination-logic',
];

for (const locale of ['pt', 'en', 'es']) {
    test(`real Digital Electronics chapter through the ${locale} menu`, async ({ page }, testInfo) => {
        test.setTimeout(180_000);
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.addInitScript(() => {
            (window as any).chapterDiagnostics = [];
            document.addEventListener('markdown-diagnostic', (event) => (window as any).chapterDiagnostics.push((event as CustomEvent).detail));
        });
        await routeApplicationAssets(page);
        const received: { url: string; sha256: string }[] = [];
        await page.route(`${base}*`, async (route) => {
            if (process.env.MARKDOWN_CHAPTER_USE_PUBLIC === '1') return route.fallback();
            const filename = new URL(route.request().url()).pathname.split('/').at(-1)!;
            expect(['README.md', chapter]).toContain(filename);
            const body = await readFile(directory + filename);
            received.push({ url: route.request().url(), sha256: createHash('sha256').update(body).digest('hex') });
            await route.fulfill({ contentType: 'text/markdown; charset=utf-8', body });
        });
        const manifest = JSON.parse(await readFile('example/example.json', 'utf8'));
        await page.goto(`/dist/${locale}/index.html?lang=${locale}`);
        await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 60_000 });
        await page.locator('#examples label').click();
        await page.locator('#example-markdown').click();
        const menu = page.locator('.example-menu');
        await menu.getByRole('button', { name: manifest.markdown.children.electronics.caption[locale] }).click();
        await menu.getByRole('button', { name: manifest.markdown.children.electronics.children['digital-electronics'].caption[locale], exact: true }).click();
        await expect(page.locator('batch-code-editor textarea')).toHaveValue(new RegExp('digital-electronics/pt/README\\.md'));
        await page.locator('#mathjslab-shell-run').click();
        const viewer = page.locator('markdown-document').last();
        await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 90_000 });
        const chapterResponse = page.waitForResponse((response) => response.url() === base + chapter);
        await viewer.getByRole('link', { name: 'Ler o Capítulo 1 — Introdução à Eletrônica Digital', exact: true }).click();
        const response = await chapterResponse;
        expect(response.ok()).toBe(true);
        const delivered = await response.body();
        expect(delivered.equals(await readFile(directory + chapter))).toBe(true);
        received.push({ url: response.url(), sha256: createHash('sha256').update(delivered).digest('hex') });
        await expect(viewer).toContainText('Objetivos de aprendizagem', { timeout: 90_000 });
        await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 90_000 });
        const effectiveLocale = await viewer.evaluate((element: any) => element.getAttribute('locale') ?? element.context.locale ?? 'en');
        const word = String(effectiveLocale).startsWith('en') ? 'Figure' : 'Figura';
        await expect(viewer.locator('[data-markdown-block="figure"] [data-markdown-block-label]')).toHaveText(labels.map((_, i) => `${word} ${i + 1}`));
        for (const label of labels) await expect(viewer.locator(`[data-markdown-block="figure"][data-markdown-label="${label}"]`)).toHaveCount(1);
        await expect(viewer.locator('[data-markdown-label="ex-combinational-or-sequential"]')).toHaveCount(1);
        const refs = viewer.locator('[data-markdown-reference]');
        const section = locale === 'pt' ? 'Seção' : locale === 'es' ? 'Sección' : 'Section';
        const table = locale === 'pt' ? 'Tabela' : locale === 'es' ? 'Tabla' : 'Table';
        await expect(refs).toHaveCount(9);
        await expect(refs.locator('a')).toHaveText([`${word} 1`, `${section} 1.1`, `${word} 2`, `${section} 1.1`, `${table} 1`, `${word} 3`, `${word} 4`, `${word} 6`, `${word} 8`]);
        expect(await viewer.evaluate((element) => element.shadowRoot?.textContent ?? '')).not.toMatch(/\{@ref\s|\{#(?:fig-|ex-|tab-|sec-)/);
        const navigations = [];
        for (const label of [
            'fig-analog-digital',
            'sec-analog-and-digital-quantities',
            'fig-digitization-flow',
            'tab-logic-thresholds',
            'fig-logic-interface',
            'fig-digital-timing',
            'fig-abstraction-levels',
            'fig-illumination-logic',
        ]) {
            const link = viewer.locator(`[data-markdown-reference="${label}"] a`).first();
            const target = viewer.locator(`[data-markdown-label="${label}"], [data-markdown-heading="${label}"]`);
            await expect(link).toHaveAttribute('href', `#${await target.getAttribute('id')}`);
            const pageUrl = page.url();
            await link.click();
            const caption = label.startsWith('sec-') ? target : target.locator('.markdown-block-heading');
            const geometry = await caption.evaluate(async (element, headingText) => {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const samples = [];
                for (let i = 0; i < 3; i++) {
                    // Native scrolling can round a heading's border box past the
                    // viewport by a fraction of a pixel. Require its complete
                    // text range, rather than accepting clipped heading text.
                    const range = window.document.createRange();
                    range.selectNodeContents(element);
                    const r = headingText ? range.getBoundingClientRect() : element.getBoundingClientRect();
                    samples.push({ top: r.top, bottom: r.bottom, height: innerHeight });
                    await new Promise((resolve) => setTimeout(resolve, 150));
                }
                return samples;
            }, label.startsWith('sec-'));
            expect(geometry).toHaveLength(3);
            const firstSample = geometry[0];
            if (!firstSample) throw new Error('No final geometry samples');
            for (const sample of geometry) {
                expect(sample.top).toBeGreaterThanOrEqual(0);
                expect(sample.bottom).toBeLessThanOrEqual(sample.height);
                expect(Math.abs(sample.top - firstSample.top)).toBeLessThan(1);
            }
            await expect(caption).toBeInViewport({ ratio: label.startsWith('sec-') ? 0 : 1 });
            expect(page.url()).toBe(pageUrl);
            navigations.push({ label, geometry });
        }
        const diagnostics = await page.evaluate(() => (window as any).chapterDiagnostics);
        expect(diagnostics.filter((d: any) => ['cross-reference-missing', 'cross-reference-duplicate'].includes(d.code))).toEqual([]);
        expect(errors).toEqual([]);
        expect(received.map((r) => r.url)).toContain(base + chapter);
        await testInfo.attach('chapter-evidence', { body: JSON.stringify({ locale, effectiveLocale, received, diagnostics, navigations }, null, 2), contentType: 'application/json' });
        await mkdir('report', { recursive: true });
        await writeFile(
            `report/${process.env.MARKDOWN_CHAPTER_REPORT_PREFIX ?? 'chapter'}-${testInfo.project.name}-${locale}${process.env.MARKDOWN_CHAPTER_USE_PUBLIC === '1' ? '-public' : ''}.json`,
            JSON.stringify({ locale, effectiveLocale, received, diagnostics, navigations }, null, 2),
        );
    });
}
