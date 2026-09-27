import { expect, test } from '@playwright/test';

test('loads each standalone public API entrypoint with isolated exports', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/test/browser/fixtures/markdown-public-api.html');
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');

    const result = await page.evaluate(() => (window as unknown as { markdownPublicApiTest: Record<string, boolean> }).markdownPublicApiTest);

    expect(result).toEqual({ core: true, component: true, componentRegistered: true, componentUnregistered: true, extensions: true, mathjslab: true, worker: true });
    expect(errors).toEqual([]);
});
