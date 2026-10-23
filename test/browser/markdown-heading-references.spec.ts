import { expect, test } from '@playwright/test';
import { routeApplicationAssets } from './helpers/application';

for (const [locale, section] of [
    ['pt', 'Seção'],
    ['en', 'Section'],
    ['es', 'Sección'],
]) {
    test(`renders and navigates explicit heading references through the app in ${locale}`, async ({ page }) => {
        test.setTimeout(90_000);
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await routeApplicationAssets(page);
        const url = `http://127.0.0.1:4173/heading-references-${locale}.md`;
        const source = `# Heading references\n\n{@ref gates}\n\n${'Paragraph.\n\n'.repeat(60)}## 2.3 Logic gates {#gates}\n\n{@ref notes}\n\n## Notes {#notes}\n\n<script>window.headingInjection = true</script>`;
        await page.route(url, (route) => route.fulfill({ contentType: 'text/markdown', body: source }));
        await page.goto(`/dist/${locale}/index.html?lang=${locale}`);
        await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 30_000 });
        const input = page.locator('command-prompt textarea').last();
        await input.fill(`markdown("${url}")`);
        await input.press('Enter');
        const viewer = page.locator(`markdown-document[src="${url}"]`);
        await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 60_000 });
        await expect(viewer.locator('h2#gates')).toHaveText('2.3 Logic gates');
        await expect(viewer.locator('h2#notes')).toHaveText('Notes');
        const link = viewer.locator('[data-markdown-reference] a[href="#gates"]');
        await expect(link).toHaveText(`${section} 2.3`);
        await expect(viewer.locator('[data-markdown-reference] a[href="#notes"]')).toHaveText('Notes');
        const pageUrl = page.url();
        await link.click();
        await expect(viewer.locator('h2#gates')).toBeInViewport();
        expect(page.url()).toBe(pageUrl);
        expect(await page.evaluate(() => (window as Window & { headingInjection?: boolean }).headingInjection)).toBeUndefined();
        await expect(viewer.locator('[role="alert"]')).toHaveCount(0);
        expect(errors).toEqual([]);
    });
}
