import { expect, test, type Locator, type Page } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

const documents = (page: Page): Locator => page.locator('markdown-document');
const extensionUrl = (features: string, source: string, instances = 1): string =>
    `/test/browser/fixtures/extensions.html?features=${encodeURIComponent(features)}&src=${encodeURIComponent(source)}&instances=${instances}`;

const expectNoExtensionError = async (document: Locator): Promise<void> => {
    await expect(document.locator('[role="alert"]')).toHaveCount(0);
};

test('renders Mermaid, SMILES, MathJax, Graphviz and Vega-Lite from optional chunks', async ({ page }) => {
    const chunks = new Set<string>();
    page.on('response', (response) => {
        if (response.url().includes('/dist/markdown-document/chunks/')) chunks.add(new URL(response.url()).pathname);
    });
    await page.goto(extensionUrl('mermaid,smiles,graphviz,vega-lite', './extensions-core.md'));
    const document = documents(page);
    await expect(document).toHaveAttribute('state', 'ready', { timeout: 90_000 });

    await expect(document.locator('[data-markdown-extension="mermaid"] svg')).toBeVisible();
    await expect(document.locator('[data-markdown-extension="smiles"] svg')).toBeVisible();
    await expect(document.locator('mjx-container')).toHaveCount(2);
    await expect(document.locator('mjx-container').first().locator('svg').first()).toBeVisible();
    await expect(document.locator('mjx-container').last().locator('svg').first()).toBeVisible();
    await expect(document.locator('[data-markdown-extension="graphviz"] svg')).toBeVisible();
    await expect(document.locator('[data-markdown-extension="vega-lite"] canvas, [data-markdown-extension="vega-lite"] svg').first()).toBeVisible();
    await expectNoExtensionError(document);
    expect(chunks.size).toBeGreaterThanOrEqual(5);
});

test('keeps two rich document instances isolated', async ({ page }) => {
    await page.goto(extensionUrl('mermaid,smiles', './extensions-core.md', 2));
    await expect(documents(page)).toHaveCount(2);
    for (const document of await documents(page).all()) {
        await expect(document).toHaveAttribute('state', 'ready', { timeout: 90_000 });
        await expect(document.locator('[data-markdown-extension="mermaid"] svg')).toBeVisible();
        await expect(document.locator('[data-markdown-extension="smiles"] svg')).toBeVisible();
        await expectNoExtensionError(document);
    }
    const distinct = await page.evaluate(() => {
        const viewers = Array.from(document.querySelectorAll('markdown-document'));
        const diagrams = viewers.map((viewer) => viewer.shadowRoot?.querySelector('[data-markdown-extension="mermaid"] svg'));
        return diagrams[0] !== diagrams[1] && viewers[0]?.shadowRoot !== viewers[1]?.shadowRoot;
    });
    expect(distinct).toBe(true);
});

test('renders ABC and Verovio music notation', async ({ page }) => {
    await page.goto(extensionUrl('abc,verovio', '/test/markdown/extensions/abc.md'));
    let document = documents(page);
    await expect(document).toHaveAttribute('state', 'ready', { timeout: 120_000 });
    await expect(document.locator('[data-markdown-extension="abc-music"] svg').first()).toBeVisible();
    await expectNoExtensionError(document);

    await page.goto(extensionUrl('abc,verovio', '/test/markdown/extensions/verovio.md'));
    document = documents(page);
    await expect(document).toHaveAttribute('state', 'ready', { timeout: 120_000 });
    await expect(document.locator('[data-markdown-extension="verovio-music"] svg').first()).toBeVisible();
    await expectNoExtensionError(document);
});

test('renders offline GeoJSON and TopoJSON maps', async ({ page }) => {
    await page.goto(extensionUrl('maps', '/test/markdown/extensions/maps.md'));
    const document = documents(page);
    await expect(document).toHaveAttribute('state', 'ready', { timeout: 90_000 });
    await expect(document.locator('[data-markdown-extension="maps"] .leaflet-container')).toHaveCount(2);
    await expect(document.locator('[data-markdown-extension="maps"] .leaflet-marker-pane img')).toHaveCount(1);
    await expect(document.locator('[data-markdown-extension="maps"] .leaflet-overlay-pane svg')).toHaveCount(1);
    await expectNoExtensionError(document);
});

test('renders molecular and general 3D models with WebGL', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Playwright Firefox does not provide the WebGL implementation required by Three.js on this test host.');
    await page.goto('/test/browser/fixtures/lifecycle.html');
    const hasWebGL = await page.evaluate(() => Boolean(globalThis.document.createElement('canvas').getContext('webgl2') ?? globalThis.document.createElement('canvas').getContext('webgl')));
    test.skip(!hasWebGL, 'This browser runtime does not provide a WebGL context.');
    await page.goto(extensionUrl('molecule-3d,model-3d', '/test/markdown/combined/all-extensions.md'));
    const document = documents(page);
    await expect(document).toHaveAttribute('state', 'ready', { timeout: 120_000 });
    const molecule = document.locator('[data-markdown-extension="molecule-3d"]');
    const moleculeViewport = molecule.locator('[role="application"]');
    await expect(moleculeViewport).toHaveAttribute('aria-label', /molecular structure/i);
    await expect(moleculeViewport).toBeVisible();
    if (browserName !== 'webkit') await expect(molecule.locator('canvas').first()).toBeVisible();
    await expect(document.locator('[data-markdown-extension="model-3d"] canvas').first()).toBeVisible();
    await expectNoExtensionError(document);
});
