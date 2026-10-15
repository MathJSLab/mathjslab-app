import { expect, test } from '@playwright/test';
import { routeApplicationAssets } from './helpers/application';

test('keeps Markdown output in the document panel after evaluating a URL', async ({ page }) => {
    await routeApplicationAssets(page);
    await page.route('https://example.org/lesson.md', (route) => route.fulfill({ contentType: 'text/markdown', body: '# Panel regression' }));
    await page.goto('/dist/en/index.html');
    const prompts = page.locator('command-prompt');
    await expect(prompts.last().locator('textarea')).toBeVisible({ timeout: 30_000 });
    const prompt = prompts.nth((await prompts.count()) - 1);
    const input = prompt.locator('textarea');
    await expect(input).toBeVisible({ timeout: 30_000 });
    await input.fill('markdown("https://example.org/lesson.md")');
    await input.press('Enter');
    const panel = prompt.locator('.green-panel.doc');
    await expect(panel).toBeVisible();
    await expect(panel.locator('markdown-document')).toHaveAttribute('state', 'ready');
    await expect(panel.getByRole('heading', { name: 'Panel regression' })).toBeVisible();
    expect(await panel.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(255, 255, 255)');
});

test('keeps the synchronous app prompt and renders Plotly after an external-function failure', async ({ page }) => {
    test.setTimeout(90_000);
    // The built app uses root asset URLs. Serve those assets from its local dist
    // directory without changing the production HTML or application settings.
    await routeApplicationAssets(page);
    await page.goto('/dist/en/index.html');
    const prompts = page.locator('command-prompt');
    await expect(prompts.last().locator('textarea')).toBeVisible({ timeout: 30_000 });
    const evaluate = async (source: string) => {
        const count = await prompts.count();
        const prompt = prompts.nth(count - 1);
        await prompt.locator('textarea').fill(source);
        await prompt.locator('textarea').press('Enter');
        await expect(prompts).toHaveCount(count + 1);
        return prompt;
    };
    const sum = await evaluate('n=3; summation(k,1,n,k)+productory(k,1,n,k)');
    await expect(sum.locator('math').last()).toContainText('12');
    const failed = await evaluate('summation(k,1,n,missing)');
    await expect(failed.locator('.green-panel.bad')).toHaveCount(1);
    const plot = await evaluate('plot2d(t,t,0,1)');
    await expect(plot.locator('.js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 30_000 });
    const recovered = await evaluate('summation(k,1,n,k)');
    await expect(recovered.locator('math').last()).toContainText('6');
});
