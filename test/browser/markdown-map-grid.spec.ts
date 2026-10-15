import { test, expect } from '@playwright/test';
import { routeApplicationAssets } from './helpers/application';
import { writeFile } from 'node:fs/promises';

test('diagnoses the complete manual document map tile grid', async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const events: unknown[] = [];
    page.on('requestfailed', (request) => events.push({ type: 'failed', url: request.url(), failure: request.failure() }));
    page.on('response', (response) => {
        if (response.url().includes('tile.openstreetmap.org')) events.push({ type: 'response', url: response.url(), status: response.status() });
    });
    page.on('pageerror', (error) => events.push({ type: 'error', message: error.message }));
    if (process.env.MARKDOWN_LIVE_MAPS !== '1') {
        const tile =
            '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#dae8cc"/><path d="M0 128H256M128 0V256" stroke="#fff" stroke-width="8"/></svg>';
        await page.route('https://tile.openstreetmap.org/**', (route) => route.fulfill({ contentType: 'image/svg+xml', body: tile }));
    }
    // Exercise the consumer webpack build by default; the standalone component
    // has a different stylesheet pipeline and did not reproduce this regression.
    const inApp = process.env.MARKDOWN_MAP_GRID_APP !== '0';
    if (inApp) {
        await routeApplicationAssets(page);
        await page.goto('/dist/en/index.html');
        await expect(page.locator('markdown-document').first()).toHaveAttribute('state', 'ready', { timeout: 30_000 });
        const prompt = page.locator('command-prompt').last();
        await prompt.locator('textarea').fill('markdown("../test/browser/fixtures/extension-showcase.md")');
        await prompt.locator('textarea').press('Enter');
    } else await page.goto('/test/browser/fixtures/extensions.html?features=maps&maps=online&src=/test/browser/fixtures/extension-showcase.md');
    const viewer = page.locator('markdown-document[src$="/test/browser/fixtures/extension-showcase.md"]');
    await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 90_000 });
    const collect = async () =>
        viewer.locator('[data-markdown-extension="maps"]').evaluateAll((maps) =>
            maps.map((map) => ({
                viewport: map.querySelector('.leaflet-container')!.getBoundingClientRect().toJSON(),
                warning: map.querySelector('.markdown-map-status')?.textContent,
                tiles: Array.from(map.querySelectorAll('img.leaflet-tile'), (tile) => {
                    const image = tile as HTMLImageElement;
                    const style = getComputedStyle(image);
                    return {
                        url: image.src,
                        complete: image.complete,
                        naturalWidth: image.naturalWidth,
                        class: image.className,
                        rect: image.getBoundingClientRect().toJSON(),
                        width: style.width,
                        height: style.height,
                        transform: style.transform,
                        opacity: style.opacity,
                        display: style.display,
                        position: style.position,
                    };
                }),
            })),
        );
    const covered = async () =>
        (await collect()).every((map) => {
            for (let row = 0; row < 9; row++)
                for (let column = 0; column < 9; column++) {
                    const x = map.viewport.left + ((column + 0.5) * map.viewport.width) / 9;
                    const y = map.viewport.top + ((row + 0.5) * map.viewport.height) / 9;
                    if (!map.tiles.some((tile) => tile.complete && tile.naturalWidth === 256 && tile.rect.left <= x && tile.rect.right >= x && tile.rect.top <= y && tile.rect.bottom >= y))
                        return false;
                }
            return true;
        });
    try {
        await expect
            .poll(async () => (await collect()).every((map) => map.tiles.length > 0 && map.tiles.every((tile) => tile.complete && tile.naturalWidth === 256)), { timeout: 45_000 })
            .toBe(true);
        expect((await collect()).every((map) => map.tiles.every((tile) => tile.position === 'absolute'))).toBe(true);
        await expect.poll(covered, { timeout: 15_000 }).toBe(true);
        for (const map of await viewer.locator('[data-markdown-extension="maps"]').all()) {
            await map.scrollIntoViewIfNeeded();
            await map.screenshot({ path: testInfo.outputPath(`${await map.getAttribute('data-markdown-language')}.png`) });
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await expect.poll(covered, { timeout: 15_000 }).toBe(true);
        await expect
            .poll(async () => (await collect()).every((map) => map.tiles.length > 0 && map.tiles.every((tile) => tile.complete && tile.naturalWidth === 256)), { timeout: 45_000 })
            .toBe(true);
        await viewer.locator('[data-markdown-language="geojson"]').screenshot({ path: testInfo.outputPath('mobile.png') });
    } finally {
        await writeFile(testInfo.outputPath('grid.json'), JSON.stringify({ events, maps: await collect() }, null, 2));
    }
});
