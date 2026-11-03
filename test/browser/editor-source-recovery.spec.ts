import { expect, test } from '@playwright/test';
import { routeApplicationAssets } from './helpers/application';

test('editor executes literal classifier commands from the production distribution', async ({ page }) => {
    await routeApplicationAssets(page);
    await page.goto('/dist/en/index.html');
    await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-prompt-session-state]')).toHaveAttribute('data-prompt-session-state', 'idle');
    const commands = [
        'features = [-2,-1,0,1,2];',
        'scores = 2*features-0.5;',
        'probabilities = 1./(1+exp(-scores));',
        'predictions = probabilities >= 0.5;',
        'example_check = all(predictions == [0,0,0,1,1]) && all(probabilities > 0 & probabilities < 1)',
    ];
    for (const newline of ['\n', '\r\n']) {
        const source = [commands.slice(0, 2).join(' '), commands.slice(2, 4).join(' '), commands[4]].join(newline);
        const result = await page.evaluate(async (text) => (window as any).appEngine.shell.commandShell.load(text), source);
        expect(result.hasErrors).toBe(false);
        expect(result.statements).toEqual(commands);
        await expect(page.locator('command-prompt').filter({ hasText: 'example_check' }).last().locator('math').last()).toContainText('true');
    }
});
