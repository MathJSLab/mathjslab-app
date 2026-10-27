import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { routeApplicationAssets } from './helpers/application';

const contentsUrl = 'https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/digital-electronics/pt/README.md';
const contents = readFileSync(new URL('../../node_modules/mathjslab-markdown/example/digital-electronics/pt/README.md', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../../example/example.json', import.meta.url), 'utf8'));

for (const locale of ['pt', 'en', 'es']) {
    test(`the ${locale} Markdown menu opens the Portuguese Digital Electronics contents`, async ({ page }) => {
        const requested: string[] = [];
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await routeApplicationAssets(page);
        await page.route('https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/digital-electronics/**', async (route) => {
            requested.push(route.request().url());
            await route.fulfill(route.request().url() === contentsUrl ? { contentType: 'text/markdown', body: contents } : { status: 404, body: 'Unexpected document URL' });
        });
        await page.goto(`/dist/${locale}/index.html?lang=${locale}`);
        await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 30_000 });
        await page.locator('#examples label').click();
        await page.locator('#example-markdown').click();
        const menu = page.locator('.example-menu');
        const electronics = manifest.markdown.children.electronics;
        await menu.getByRole('button', { name: electronics.caption[locale] }).click();
        const [response] = await Promise.all([
            page.waitForResponse((response) => new URL(response.url()).pathname.endsWith('/markdown/electronics/digital-electronics.m')),
            menu.getByRole('button', { name: electronics.children['digital-electronics'].caption[locale], exact: true }).click(),
        ]);
        expect(response.ok()).toBe(true);
        expect(await response.finished()).toBeNull();
        await expect(menu).toBeHidden();
        expect(await page.locator('batch-code-editor textarea').inputValue()).toContain(`markdown("${contentsUrl}")`);
        const viewer = page.locator(`markdown-document[src="${contentsUrl}"]`);
        await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 30_000 });
        await expect(viewer.getByRole('heading', { name: 'Eletrônica Digital', exact: true })).toBeVisible();
        await expect(viewer.locator('a[href="' + contentsUrl.replace('README.md', 'introduction-to-digital-electronics.md') + '"]')).toHaveCount(1);
        expect(requested.length).toBeGreaterThan(0);
        expect(requested.every((url) => url === contentsUrl)).toBe(true);
        expect(errors).toEqual([]);
    });
}
