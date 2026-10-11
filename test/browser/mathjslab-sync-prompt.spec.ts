import { expect, test } from '@playwright/test';

test('keeps the synchronous app prompt and renders Plotly after an external-function failure', async ({ page }) => {
    test.setTimeout(90_000);
    // The built app uses root asset URLs. Serve those assets from its local dist
    // directory without changing the production HTML or application settings.
    await page.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.origin === 'http://127.0.0.1:4173' && !url.pathname.startsWith('/dist/') && !url.pathname.startsWith('/test/') && /\.(?:js|css)$/.test(url.pathname)) {
            url.pathname = `/dist${url.pathname}`;
            await route.continue({ url: url.href });
        } else await route.continue();
    });
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
