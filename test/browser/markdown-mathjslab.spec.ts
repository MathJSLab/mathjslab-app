import { expect, test } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

test('executes document-scoped sessions and disposes rich outputs on replacement', async ({ page }) => {
    await page.goto('/test/browser/fixtures/mathjslab.html');
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('.mathjslab-result')).toHaveCount(4);
    await expect(viewer.locator('.mathjslab-result').nth(1)).toHaveText('value:one');
    await expect(viewer.locator('.mathjslab-result').nth(2)).toHaveText('value:one');
    await expect(viewer.locator('[data-mathjslab-output-role="visualization"]')).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as any).mathJSLabTest.statistics.mounted)).toBe(1);

    await page.evaluate(() => (window as any).mathJSLabTest.replace());
    await expect(viewer.locator('h1')).toHaveText('Replacement');
    await expect.poll(() => page.evaluate(() => (window as any).mathJSLabTest.statistics.disposedSessions)).toBe(1);
    await expect.poll(() => page.evaluate(() => (window as any).mathJSLabTest.statistics.disposedOutputs)).toBe(1);
});

test('blocks executable fences in restricted documents before creating a session', async ({ page }) => {
    await page.goto('/test/browser/fixtures/mathjslab.html?security=sanitized');
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('.mathjslab-policy')).toHaveCount(2);
    await expect(viewer.locator('.markdown-extension-source')).toHaveCount(2);
    const statistics = await page.evaluate(() => (window as any).mathJSLabTest.statistics);
    expect(statistics.sessions).toBe(0);
    expect(statistics.diagnostics).toEqual(['mathjslab-execution-disabled', 'mathjslab-execution-disabled']);
});

test('allows an integrator to authorize execution in sanitized documents', async ({ page }) => {
    await page.goto('/test/browser/fixtures/mathjslab.html?security=sanitized&allow=true');
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('.mathjslab-result')).toHaveCount(4);
    expect(await page.evaluate(() => (window as any).mathJSLabTest.statistics.sessions)).toBe(1);
});
