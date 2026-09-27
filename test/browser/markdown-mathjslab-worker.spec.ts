import { expect, test } from '@playwright/test';

test('executes document sessions in the packaged MathJSLab module Worker', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/test/browser/fixtures/mathjslab-worker.html');
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('.mathjslab-result')).toHaveCount(3);
    await expect(viewer.locator('.mathjslab-result').nth(1)).toContainText('42');
    await expect(viewer.locator('[data-mathjslab-output-role="visualization"] .plot-container')).toBeVisible();
    expect(errors).toEqual([]);
    await page.evaluate(() => (window as unknown as { mathJSLabWorkerTest: { shutdown(): Promise<void> } }).mathJSLabWorkerTest.shutdown());
});

test('terminates a timed-out evaluation and recreates a clean Worker session', async ({ page }) => {
    await page.goto('/test/browser/fixtures/mathjslab-worker.html');
    await expect(page.locator('markdown-document')).toHaveAttribute('state', 'ready');
    const result = await page.evaluate(() =>
        (
            window as unknown as {
                mathJSLabWorkerTest: {
                    timeoutAndRecover(): Promise<{
                        timeout?: { name: string; code?: string; message: string };
                        recovery: { status: string; outputs: Array<{ markup: string }> };
                    }>;
                };
            }
        ).mathJSLabWorkerTest.timeoutAndRecover(),
    );

    expect(result.timeout).toMatchObject({ name: 'TimeoutError', code: 'MATHJSLAB_TIMEOUT' });
    expect(result.recovery.status).toBe('success');
    expect(result.recovery.outputs).toHaveLength(1);
    expect(result.recovery.outputs[0]!.markup).toContain('<mn>2</mn>');
});

test('loads a relative MathJSLab script through the document resource service', async ({ page }) => {
    await page.goto('/test/browser/fixtures/mathjslab-worker.html');
    await expect(page.locator('markdown-document')).toHaveAttribute('state', 'ready');
    const result = await page.evaluate(() =>
        (
            window as unknown as {
                mathJSLabWorkerTest: {
                    loadRelative(): Promise<{
                        loaded: { status: string; outputs: Array<{ text?: string }> };
                        result: { status: string; outputs: Array<{ markup?: string }> };
                    }>;
                };
            }
        ).mathJSLabWorkerTest.loadRelative(),
    );

    expect(result.loaded).toMatchObject({ status: 'success', outputs: [{ text: 'Loaded script from ./mathjslab-loaded.m' }] });
    expect(result.result.status).toBe('success');
    expect(result.result.outputs[0]!.markup).toContain('<mn>74</mn>');
});

test('applies the document resource policy to Worker loads', async ({ page }) => {
    await page.goto('/test/browser/fixtures/mathjslab-worker.html');
    await expect(page.locator('markdown-document')).toHaveAttribute('state', 'ready');
    const result = await page.evaluate(() =>
        (
            window as unknown as {
                mathJSLabWorkerTest: { loadBlocked(): Promise<{ status: string; error: { message: string } }> };
            }
        ).mathJSLabWorkerTest.loadBlocked(),
    );

    expect(result.status).toBe('error');
    expect(result.error.message).toContain('Network access is not allowed');
});
