import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const url = '/test/browser/fixtures/extensions.html?features=maps&maps=online&src=/test/markdown/extensions/maps.md';
const tile =
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#d8e7cb"/><path d="M0 120L256 120M120 0L120 256" stroke="#fff" stroke-width="12"/></svg>';
export const mockMapTiles = async (page: import('@playwright/test').Page) => {
    await page.route('https://tile.openstreetmap.org/**', (route) => route.fulfill({ contentType: 'image/svg+xml', body: tile }));
    await page.route('https://basemaps.cartocdn.com/**', (route) => route.fulfill({ contentType: 'image/svg+xml', body: tile }));
};

test('selects OSM by default, switches providers independently and supports offline', async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await mockMapTiles(page);
    await page.goto(url);
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    const maps = viewer.locator('[data-markdown-extension="maps"]');
    for (const map of await maps.all()) {
        await expect(map.locator('.leaflet-tile-loaded').first()).toBeVisible();
        expect(await map.locator('.leaflet-tile').first().getAttribute('src')).toContain('tile.openstreetmap.org');
        await expect(map.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');
    }
    const first = maps.first();
    await first.locator('.leaflet-control-layers').hover();
    await first.locator('.leaflet-control-layers-base label').filter({ hasText: 'CARTO Positron' }).click();
    await expect(first.locator('.leaflet-tile-loaded').first()).toHaveAttribute('src', /basemaps.cartocdn.com/);
    await expect(first.locator('.leaflet-control-attribution')).toContainText('CARTO');
    expect(await maps.last().locator('.leaflet-tile').first().getAttribute('src')).toContain('tile.openstreetmap.org');
    await first.screenshot({ path: testInfo.outputPath('provider-selector.png') });
    await first.locator('.leaflet-control-layers').hover();
    await first.locator('.leaflet-control-layers-base label').filter({ hasText: 'offline' }).click();
    await expect(first.locator('.leaflet-tile')).toHaveCount(0);
    await expect(first.locator('.leaflet-interactive')).toHaveCount(1);
    expect(errors).toEqual([]);
});

test('keeps features and a local diagnostic when tiles fail, and respects network policy', async ({ page }) => {
    await page.route('https://tile.openstreetmap.org/**', (route) => route.fulfill({ status: 404, body: 'missing' }));
    await page.goto(url);
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('.markdown-map-status').first()).toContainText('OpenStreetMap');
    await expect(viewer.locator('[data-markdown-extension="maps"] .leaflet-interactive')).toHaveCount(2);
    await viewer.evaluate((element) => {
        (element as any).context = { resourcePolicy: { allowNetwork: false } };
        (element as any).markdown = '```geojson\n{"type":"Point","coordinates":[0,0]}\n```';
    });
    await expect(viewer.locator('.leaflet-tile')).toHaveCount(0);
    await expect(viewer.locator('.leaflet-interactive')).toHaveCount(1);
});

test('renders actual online OSM tiles', async ({ page }, testInfo) => {
    test.skip(process.env.MARKDOWN_LIVE_MAPS !== '1', 'Opt-in live provider test; ordinary regression tests use deterministic tiles.');
    test.setTimeout(90_000);
    const requests: unknown[] = [];
    page.on('response', (response) => {
        if (/tile.openstreetmap.org|basemaps.cartocdn.com/.test(response.url())) requests.push({ url: response.url(), status: response.status() });
    });
    page.on('requestfailed', (request) => requests.push({ url: request.url(), error: request.failure() }));
    await page.goto(url);
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    const map = viewer.locator('[data-markdown-extension="maps"]').first();
    try {
        await expect(map.locator('.leaflet-tile-loaded').first()).toBeVisible({ timeout: 60_000 });
    } finally {
        await writeFile(testInfo.outputPath('live-requests.json'), JSON.stringify(requests, null, 2));
    }
    expect(
        await map
            .locator('.leaflet-tile-loaded')
            .first()
            .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    ).toBe(256);
    await map.screenshot({ path: testInfo.outputPath('live-osm.png') });
    for (const [name, service] of [
        ['CARTO Positron', 'light_all'],
        ['CARTO Dark Matter', 'dark_all'],
    ] as const) {
        await map.locator('.leaflet-control-layers').hover();
        await map.locator('.leaflet-control-layers-base label').filter({ hasText: name }).click();
        try {
            await expect(map.locator('.leaflet-tile-loaded').first()).toHaveAttribute('src', new RegExp(`basemaps.cartocdn.com/${service}/`), { timeout: 30_000 });
        } finally {
            await writeFile(testInfo.outputPath('live-requests.json'), JSON.stringify(requests, null, 2));
        }
        await map.screenshot({ path: testInfo.outputPath(`live-${service}.png`) });
    }
    await writeFile(testInfo.outputPath('live-requests.json'), JSON.stringify(requests, null, 2));
});
