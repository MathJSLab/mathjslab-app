import { expect, test, type Page } from '@playwright/test';
import { routeApplicationAssets } from './helpers/application';

test.setTimeout(90_000);

async function start(page: Page, locale = 'en') {
    await routeApplicationAssets(page);
    await page.goto(`/dist/${locale}/index.html${locale === 'en' ? '' : `?lang=${locale}`}`);
    await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-prompt-session-state]')).toHaveAttribute('data-prompt-session-state', 'idle');
}

async function execute(page: Page, source: string) {
    const prompts = page.locator('command-prompt');
    const prompt = prompts.last();
    const id = await prompt.getAttribute('id');
    await prompt.locator('textarea').fill(source);
    await prompt.locator('textarea').press('Enter');
    const evaluated = page.locator(`command-prompt[id="${id}"]`);
    await expect(evaluated.locator('[data-execution-state]')).toHaveAttribute('data-execution-state', /success|error|timeout|cancelled/, { timeout: 20_000 });
    return evaluated;
}

for (const locale of ['en', 'pt', 'es']) {
    test(`startup executes every prompt in order with registry packages (${locale})`, async ({ page }) => {
        await start(page, locale);
        await expect(page.locator('command-prompt [data-execution-state="success"]')).toHaveCount(9);
        await expect(page.locator('command-prompt [data-execution-state="error"]')).toHaveCount(0);
        await expect(page.locator('command-prompt')).toHaveCount(10);
        await expect(page.locator('command-prompt').filter({ hasText: 'MATHJSLAB_SESSION_BUSY' })).toHaveCount(0);
        await expect((await execute(page, 'a+b+c')).locator('math').last()).toContainText('12');
    });
}

test('prompt retains nested load, function context, plots and locale across waits', async ({ page }) => {
    await start(page, 'pt');
    await page.route('**/inner.m', (route) => route.fulfill({ body: 'pause(0.01); x+=4; plot([x,x+1]);' }));
    await page.route('**/outer.m', async (route) => {
        await route.fulfill({ body: "x+=2; load('/inner.m'); x+=8;" });
    });
    const result = await execute(page, "function y=lesson(), x=1; load('/outer.m'); y=x; end; lesson()");
    await expect(result.locator('math').last()).toContainText('15');
    expect(await page.evaluate(() => (window as any).appEngine.lang)).toBe('pt');
    await expect(result).toContainText('Loaded script from /inner.mLoaded script from /outer.m');
    await expect(result.locator('.js-plotly-plot')).toHaveCount(1);
    const failed = await execute(page, 'missing_prompt_value');
    await expect(failed.locator('[data-diagnostic-code]')).toHaveCount(1);
    const recovery = await execute(page, '1+1');
    await expect(recovery.locator('math').last()).toContainText('2');
});

test('cancel and timeout retain completed local effects, reset replaces workspace', async ({ page }) => {
    await page.clock.install();
    await start(page);
    const input = page.locator('command-prompt').last().locator('textarea');
    await input.fill('retained=7; pause(60); retained=99');
    await input.press('Enter');
    await expect(page.locator('[data-prompt-session-state]')).toHaveAttribute('data-prompt-session-state', 'waiting');
    await page.locator('[data-action="cancel-execution"]').click();
    await expect(page.locator('[data-execution-state="cancelled"]')).toHaveCount(1);
    await expect((await execute(page, 'retained')).locator('math').last()).toContainText('7');
    // Freeze elapsed time before execution: a short wall-clock budget can expire
    // during parsing, before the effect whose preservation this test asserts.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    try {
        await page.evaluate(() => {
            (window as any).appEngine.promptSession.timeoutMs = 1000;
        });
        const id = await page.locator('command-prompt').last().getAttribute('id');
        await input.fill('retained+=1; pause(60); retained=99');
        await input.press('Enter');
        await expect(page.locator('[data-prompt-session-state]')).toHaveAttribute('data-prompt-session-state', 'waiting');
        // The prefix has completed; expire its real runtime deadline during pause.
        await page.clock.runFor(1001);
        const timedOut = page.locator(`command-prompt[id="${id}"]`);
        await expect(timedOut.locator('[data-execution-state]')).toHaveAttribute('data-execution-state', 'timeout');
        await expect(timedOut.locator('[data-diagnostic-code="MATHJSLAB_TIMEOUT"]')).toHaveCount(1);
    } finally {
        await page.clock.resume();
        await page.evaluate(() => {
            (window as any).appEngine.promptSession.timeoutMs = 30000;
        });
    }
    await expect((await execute(page, 'retained')).locator('math').last()).toContainText('8');
    await page.locator('[data-action="reset-workspace"]').click();
    await expect(page.locator('command-prompt')).toHaveCount(1);
    await page.evaluate(() => (window as any).appEngine.shell.commandShell.element.promptSet.clearAll());
    await expect((await execute(page, 'exist("retained","var")')).locator('math').last()).toContainText('0');
});

test('configure switches the backend preserving workspace and has no numeric controls', async ({ page }) => {
    await start(page, 'pt');
    const controls = page.locator('fieldset').filter({ has: page.locator('[data-prompt-session-state]') });
    await expect(controls.locator('select,input')).toHaveCount(0);
    await expect(controls.locator('legend')).toHaveText('Sessão do prompt');
    expect(await controls.textContent()).not.toContain('\uFFFD');
    await execute(page, 'kept=42; matrix=[1,2]; f=@(x)x+kept;');
    for (const backend of ['number', 'decimal']) {
        const result = await execute(page, `configure("real","${backend}"); kept==42 && matrix(2)==2 && f(1)==43`);
        await expect(result.locator('[data-diagnostic-code]')).toHaveCount(0);
        await expect(result.locator('math').last()).toContainText('true');
    }
    await expect((await execute(page, 'configure("precision",40); getconfig("precision")')).locator('math').last()).toContainText('40');
});

test('prompt shows unchanged expressions once and left aligned computed results', async ({ page }) => {
    await start(page);
    for (const source of ['a=1', 'b=-10', 'c=21']) {
        const result = await execute(page, source);
        await expect(result.locator('table.command-result td')).toHaveCount(1);
    }
    const delta = await execute(page, 'Delta=b^2-4*a*c');
    await expect(delta.locator('table.command-result td')).toHaveCount(3);
    await expect(delta.locator('table.command-result td').nth(1)).toHaveText('⇒');
    await expect(delta.locator('table.command-result td').last()).toContainText('16');
    const geometry = await delta.locator('table.command-result').evaluate((table) => {
        const rect = table.getBoundingClientRect();
        const parent = table.parentElement!.getBoundingClientRect();
        return { offset: rect.left - parent.left, width: rect.width, available: parent.width };
    });
    expect(geometry.offset).toBeLessThan(30);
    expect(geometry.width).toBeLessThan(geometry.available / 2);
    await expect((await execute(page, 'clear')).locator('table.command-result')).toContainText('clear');
});

test('Markdown Worker remains independent during prompt wait and after prompt reset/disposal', async ({ page }) => {
    await start(page);
    const result = await page.evaluate(async () => {
        const app = (window as any).appEngine;
        const content = document.createElement('div');
        document.body.append(content);
        const target = {
            content,
            clear: () => content.replaceChildren(),
            setState() {},
            setText: (s: string) => {
                content.textContent = s;
            },
            append: (...nodes: Node[]) => content.append(...nodes),
        };
        const waiting = app.promptSession.execute('own=17; pause(0.2); own', target);
        const container = document.createElement('div');
        document.body.append(container);
        const doc = await app.Markdown.renderDocument('```mathjslab\nmd=31; pause(0.01); md\n```', container);
        await waiting;
        const markdown = container.textContent;
        const prompt = content.textContent;
        await app.promptSession.reset();
        await app.promptSession.dispose();
        const other = document.createElement('div');
        document.body.append(other);
        const survivor = await app.Markdown.renderDocument('```mathjslab\n2+3\n```', other);
        const surviving = other.textContent;
        await app.Markdown.dispose(container);
        await app.Markdown.dispose(other);
        return { markdown, prompt, surviving, disposed: doc.disposed && survivor.disposed };
    });
    expect(result.markdown).toContain('31');
    expect(result.prompt).toContain('17');
    expect(result.surviving).toContain('5');
    expect(result.disposed).toBe(true);
});

test('configure is independent between prompt and Markdown document Workers', async ({ page }) => {
    await start(page);
    await execute(page, 'configure("real","number"); kept=17;');
    await expect((await execute(page, 'getconfig("precision")')).locator('math').last()).toContainText('15');
    await execute(page, 'configure("real","decimal"); configure("precision",40);');
    const result = await page.evaluate(async () => {
        const app = (window as any).appEngine;
        const container = document.createElement('div');
        document.body.append(container);
        const doc = await app.Markdown.renderDocument('```mathjslab\nmd=3; configure("real","number"); getconfig("precision")\nplot([md,md+1])\n```', container);
        const output = container.textContent;
        const plotCount = container.querySelectorAll('.js-plotly-plot').length;
        await app.Markdown.dispose(container);
        return { output, plotCount, disposed: doc.disposed };
    });
    expect(result.output).toContain('15');
    expect(result.plotCount).toBe(1);
    expect(result.disposed).toBe(true);
    await expect((await execute(page, 'getconfig("precision")')).locator('math').last()).toContainText('40');
});

test('plot resources are purged when a prompt shadow tree clears or disconnects', async ({ page }) => {
    await start(page);
    const plotted = await execute(page, 'plot([1,2,3])');
    await plotted.evaluate((prompt: any) => {
        (window as any).removedPlot = prompt.element.output.querySelector('.plot-output');
        prompt.clearOutput();
    });
    await expect.poll(() => page.evaluate(() => Boolean((window as any).removedPlot._fullLayout))).toBe(false);
    const again = await execute(page, 'plot([4,5])');
    await again.evaluate((prompt: any) => {
        (window as any).removedPlot = prompt.element.output.querySelector('.plot-output');
        prompt.remove();
    });
    await expect.poll(() => page.evaluate(() => Boolean((window as any).removedPlot._fullLayout))).toBe(false);
});

test('batch mode awaits ordered commands and renders parse diagnostics without a dialog', async ({ page }) => {
    await start(page);
    await page.locator('[id="mathjslab-shell-mode"]').selectOption('editor-output');
    const editor = page.locator('batch-code-editor textarea');
    await editor.fill('batchValue=1\npause(0.01)\nbatchValue+=2\nbatchValue');
    await page.locator('[id="mathjslab-shell-run"]').click();
    await expect(page.locator('batch-output')).toContainText('3');
    await expect(page.locator('[data-prompt-session-state]')).toHaveAttribute('data-prompt-session-state', 'idle');
    await editor.fill('broken = (');
    await page.locator('[id="mathjslab-shell-run"]').click();
    await expect(page.locator('batch-output [data-diagnostic-code]')).toHaveCount(1);
});
