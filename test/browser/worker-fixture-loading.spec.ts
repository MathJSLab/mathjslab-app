import { expect, test } from '@playwright/test';

// A delayed entry response must not let load report an empty Worker fixture.
test('Worker fixture creates its component before navigation load with delayed module delivery', async ({ page }) => {
    await page.addInitScript(() => {
        window.addEventListener('load', () => {
            document.documentElement.dataset.workerFixtureAtLoad = String(Boolean(document.querySelector('markdown-document')));
        });
    });
    await page.route('**/markdown-document/markdown-document.js', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 250));
        await route.continue();
    });
    await page.goto('/test/browser/fixtures/mathjslab-worker.html');
    await expect(page.locator('html')).toHaveAttribute('data-worker-fixture-at-load', 'true');
    await expect(page.locator('markdown-document')).toHaveAttribute('state', 'ready', { timeout: 20_000 });
});
