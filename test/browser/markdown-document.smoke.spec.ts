import { expect, test } from '@playwright/test';

test('loads the standalone ESM bundle and renders a relative Markdown document', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto('/test/browser/fixtures/');

    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('h1')).toHaveText('Browser lesson');
    await expect(viewer.locator('img')).toHaveAttribute('src', 'http://127.0.0.1:4173/test/browser/fixtures/pixel.svg');
    await expect(viewer.locator('[part="page-outline"]')).toBeVisible();
    expect(pageErrors).toEqual([]);
});

test('keeps Markdown navigation inside the component', async ({ page }) => {
    await page.goto('/test/browser/fixtures/');
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    const pageUrl = page.url();

    await viewer.getByRole('link', { name: 'Next lesson' }).click();
    await expect(viewer.locator('h1')).toHaveText('Next lesson');
    expect(page.url()).toBe(pageUrl);
});
