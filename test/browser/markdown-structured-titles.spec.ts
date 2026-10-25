import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { routeApplicationAssets } from './helpers/application';

for (const locale of ['pt', 'en', 'es']) {
    test(`renders the published structured block example through the app in ${locale}`, async ({ page }) => {
        test.setTimeout(90_000);
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await routeApplicationAssets(page);
        const url = 'https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/structured-blocks.md';
        const source = readFileSync('node_modules/mathjslab-markdown/example/structured-blocks.md');
        await page.route(url, (route) => route.fulfill({ contentType: 'text/markdown', body: source }));
        await page.goto(`/dist/${locale}/index.html?lang=${locale}`);
        await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 30_000 });
        const input = page.locator('command-prompt textarea').last();
        await input.fill(`markdown("${url}")`);
        await input.press('Enter');
        const viewer = page.locator(`markdown-document[src="${url}"]`);
        await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 45_000 });
        const title = viewer.locator('[data-markdown-label="function"] .markdown-block-heading');
        await expect(title.locator('strong')).toHaveText('function');
        await expect(title.locator('mjx-container')).toHaveCount(1);
        const targetId = await viewer.locator('[data-markdown-label="function"]').getAttribute('id');
        expect(targetId).toBeTruthy();
        await expect(viewer.locator('[data-markdown-label="evaluation"] .markdown-block-heading [data-markdown-reference="function"] a')).toHaveAttribute('href', `#${targetId}`);
        const table = viewer.locator('[data-markdown-label="values"]');
        await expect(table).toHaveClass(/markdown-table-full-width/);
        await expect(table.locator('.markdown-block-heading strong')).toHaveText('Sample values');
        await expect(table.locator('table tbody tr')).toHaveCount(3);
        expect(
            await table.evaluate((element) => {
                const inner = element.querySelector('table')!;
                const style = getComputedStyle(element);
                const contentWidth = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
                return Math.abs(inner.getBoundingClientRect().width - contentWidth);
            }),
        ).toBeLessThan(2);
        await expect(viewer.locator('pre code')).toContainText('%`sqrt(2)`%');
        await expect(viewer.locator('[role="alert"], .markdown-reference-unresolved')).toHaveCount(0);
        expect(errors).toEqual([]);
    });
}
