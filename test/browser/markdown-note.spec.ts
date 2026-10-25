import { expect, test } from '@playwright/test';
import { routeApplicationAssets } from './helpers/application';

for (const [locale, label] of [
    ['pt', 'Nota'],
    ['en', 'Note'],
    ['es', 'Nota'],
]) {
    test(`renders numbered note references through the app in ${locale}`, async ({ page }) => {
        test.setTimeout(60_000);
        await routeApplicationAssets(page);
        const url = `http://127.0.0.1:4173/notes-${locale}.md`;
        const source = [
            '# Note references',
            '{@ref assumptions} and {@ref limits}',
            '::: theorem Independent counter {#theorem}',
            'Theorem body.',
            ':::',
            '::: note Check assumptions {#assumptions}',
            '**Verified** assumptions.',
            ':::',
            '::: note Limits {#limits}',
            'Check limits.',
            ':::',
            '{@ref assumptions}',
            '```markdown',
            '::: note Literal {#literal}',
            '{@ref assumptions}',
            ':::',
            '```',
        ].join('\n\n');
        await page.route(url, (route) => route.fulfill({ contentType: 'text/markdown', body: source }));
        await page.goto(`/dist/${locale}/index.html?lang=${locale}`);
        await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 30_000 });
        const input = page.locator('command-prompt textarea').last();
        await input.fill(`markdown("${url}")`);
        await input.press('Enter');
        const viewer = page.locator(`markdown-document[src="${url}"]`);
        await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 30_000 });
        await expect(viewer.locator('.markdown-note [data-markdown-block-label]')).toHaveText([`${label} 1`, `${label} 2`]);
        await expect(viewer.locator('[data-markdown-reference] a')).toHaveText([`${label} 1`, `${label} 2`, `${label} 1`]);
        for (const name of ['assumptions', 'limits']) {
            const target = viewer.locator(`[data-markdown-label="${name}"]`);
            await expect(target).toHaveCount(1);
            await expect(viewer.locator(`[data-markdown-reference="${name}"] a`).first()).toHaveAttribute('href', `#${await target.getAttribute('id')}`);
        }
        await expect(viewer.locator('[data-markdown-label="literal"], code a, [role="alert"]')).toHaveCount(0);
        await expect(viewer.locator('pre code')).toContainText('::: note Literal {#literal}');
        await expect(viewer.locator('pre code')).toContainText('{@ref assumptions}');
    });
}
