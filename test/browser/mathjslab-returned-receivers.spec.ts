/* global window, HTMLElement, location, RequestInit */
import { expect, test } from '@playwright/test';
import type { MathJSLabExecutor, MathJSLabExecutionResult } from '../../src/markdown/extensions/mathjslab/executor';

declare global {
    interface Window {
        mathJSLabWorkerTest: {
            executor: MathJSLabExecutor;
            viewer: HTMLElement & { markdown: string };
            effects: Array<{ type: string; milliseconds?: number; reference?: string }>;
            workerCount: number;
            probe(): Promise<{ interpreter: boolean; plots: boolean }>;
            nextEffect(): Promise<{ type: string }>;
            serialize(
                result: MathJSLabExecutionResult,
            ): Promise<{ status: string; outputs: Array<{ type: string; markup?: string; text?: string; request?: { data: Array<{ y: number[] }> } }>; error?: string }>;
        };
    }
}

test.beforeEach(async ({ page }) => {
    await page.goto('/test/browser/fixtures/mathjslab-worker.html');
    await expect(page.locator('markdown-document')).toHaveAttribute('state', 'ready', { timeout: 20_000 });
});

test('cancels a returned receiver index and recovers with a clean Worker', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const harness = window.mathJSLabWorkerTest;
        const session = await harness.executor.createSession({});
        const controller = new AbortController();
        harness.effects.length = 0;
        try {
            const first = harness.nextEffect();
            const pending = session.execute(
                'function y=g(a), if a==2, pause(60); else, pause(0.01); end; if a==1, y=[10,20,30]; else, y=a; end; end; x=0; a=99; a=g(++x)(g(++x):end); plot(a)',
                { blockIndex: 0, statementIndex: 0, signal: controller.signal },
            );
            await first;
            await harness.nextEffect();
            const contexts = await harness.probe();
            controller.abort('cancel literal element');
            const cancelled = await harness.serialize(await pending);
            const effects = [...harness.effects];
            const recovery = await harness.serialize(await session.execute('exist("x","var")', { blockIndex: 1, statementIndex: 0 }));
            return { cancelled, recovery, effects, contexts, recoveredContexts: await harness.probe() };
        } finally {
            await session.dispose?.();
        }
    });
    expect(result.cancelled).toMatchObject({ status: 'cancelled', outputs: [] });
    expect(result.effects).toEqual([
        { type: 'delay', milliseconds: 10 },
        { type: 'delay', milliseconds: 60000 },
    ]);
    expect(result.recovery.outputs[0]?.markup).toContain('<mn>0</mn>');
    expect(result.contexts).toMatchObject({ interpreter: false, plots: false });
    expect(result.recoveredContexts).toMatchObject({ interpreter: false, plots: false });
});

test('retains returned receiver effects when indexing fails', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const harness = window.mathJSLabWorkerTest;
        const session = await harness.executor.createSession({});
        harness.effects.length = 0;
        try {
            const failed = await harness.serialize(
                await session.execute('function y=g(a), global count; count+=1; pause(a/1000); if a==1, y=[10,20]; else, y=a; end; end; global count; count=0; a=99; a=g(1)(g(3)); plot(a)', {
                    blockIndex: 0,
                    statementIndex: 0,
                }),
            );
            const workspace = await harness.serialize(await session.execute('global count; a+count', { blockIndex: 1, statementIndex: 0 }));
            return { failed, workspace, effects: [...harness.effects], contexts: await harness.probe() };
        } finally {
            await session.dispose?.();
        }
    });
    expect(result.failed.status).toBe('error');
    expect(result.failed.outputs).toEqual([]);
    expect(result.workspace.outputs[0]?.markup).toContain('<mn>101</mn>');
    expect(result.effects).toEqual([1, 3].map((milliseconds) => ({ type: 'delay', milliseconds })));
    expect(result.contexts).toMatchObject({ interpreter: false, plots: false });
});
test('propagates a returned receiver index host failure without replay', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const harness = window.mathJSLabWorkerTest;
        const session = await harness.executor.createSession({});
        const original = window.setTimeout;
        window.setTimeout = new Proxy(original, {
            apply(target, receiver, args) {
                if (args[1] === 77) throw new Error('literal host failure');
                return Reflect.apply(target, receiver, args);
            },
        });
        harness.effects.length = 0;
        try {
            const execution = await harness.serialize(
                await session.execute(
                    'function y=g(a), global count; count+=1; pause(a/1000); if a==1, y=[10,20]; else, y=a; end; end; global count; count=0; a=99; try, a=g(1)(g(77)); catch, end; a+count',
                    { blockIndex: 0, statementIndex: 0 },
                ),
            );
            return { execution, effects: [...harness.effects], contexts: await harness.probe() };
        } finally {
            window.setTimeout = original;
            await session.dispose?.();
        }
    });
    expect(result.execution.status).toBe('success');
    expect(result.execution.outputs[0]?.markup).toContain('<mn>101</mn>');
    expect(result.effects).toEqual([
        { type: 'delay', milliseconds: 1 },
        { type: 'delay', milliseconds: 77 },
    ]);
    expect(result.contexts).toMatchObject({ interpreter: false, plots: false });
});

test('keeps numeric session configuration through a returned receiver wait', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const harness = window.mathJSLabWorkerTest;
        const first = await harness.executor.createSession({});
        const second = await harness.executor.createSession({});
        const context = { blockIndex: 0, statementIndex: 0 };
        try {
            await first.execute('configure("precision",20)', context);
            const effect = harness.nextEffect();
            const pending = first.execute('function y=g(), pause(0.1); y={getconfig("precision")}; end; g(){1}', context);
            await effect;
            await second.execute('configure("precision",40)', context);
            const resumed = await harness.serialize(await pending);
            const other = await harness.serialize(await second.execute('getconfig("precision")', context));
            return { resumed, other };
        } finally {
            await first.dispose?.();
            await second.dispose?.();
        }
    });
    expect(result.resumed.status).toBe('success');
    expect(result.resumed.outputs[0]?.markup).toContain('<mn>20</mn>');
    expect(result.other.outputs[0]?.markup).toContain('<mn>40</mn>');
});

test('plots a retained returned receiver with end and dynamic field order', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const h = window.mathJSLabWorkerTest;
        const session = await h.executor.createSession({});
        h.effects.length = 0;
        try {
            const source =
                'function y=make(a), global trace; trace=trace*10+a; pause(a/1000); y=struct("a",[10,20,30]); end; function y=field(), global trace; trace=trace*10+3; pause(0.003); y="a"; end; function y=idx(a), global trace; trace=trace*10+a; pause(a/1000); y=a; end; global trace; trace=0; x=0; plot(make(++x).(field())(idx(++x):end)); trace+x';
            const execution = await h.serialize(await session.execute(source, { blockIndex: 0, statementIndex: 0 }));
            return { execution, effects: [...h.effects], contexts: await h.probe() };
        } finally {
            await session.dispose?.();
        }
    });
    expect(result.execution.status).toBe('success');
    expect(result.execution.outputs.find((o) => o.type === 'plot')?.request?.data.map((s) => s.y)).toEqual([[20, 30]]);
    expect(result.execution.outputs.find((o) => o.type === 'mathml')?.markup).toContain('<mn>314</mn>');
    expect(result.effects).toEqual([3, 1, 2].map((milliseconds) => ({ type: 'delay', milliseconds })));
    expect(result.contexts).toMatchObject({ interpreter: false, plots: false });
});

test('expands returned cell receivers and dispatches returned handles', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const h = window.mathJSLabWorkerTest;
        const session = await h.executor.createSession({});
        h.effects.length = 0;
        try {
            const execution = await h.serialize(
                await session.execute(
                    'function y=make(), pause(0.001); y={struct("a",10),struct("a",20)}; end; function y=g(a), pause(a/1000); y=a; end; function y=makehandle(), pause(0.002); y=@g; end; [a,b]=make(){:}.a; a+b+makehandle()(3)',
                    { blockIndex: 0, statementIndex: 0 },
                ),
            );
            return { execution, effects: [...h.effects], contexts: await h.probe() };
        } finally {
            await session.dispose?.();
        }
    });
    expect(result.execution.status).toBe('success');
    expect(result.execution.outputs[0]?.markup).toContain('<mn>33</mn>');
    expect(result.effects).toEqual([1, 2, 3].map((milliseconds) => ({ type: 'delay', milliseconds })));
    expect(result.contexts).toMatchObject({ interpreter: false, plots: false });
});

test('uses returned receivers in plots across Markdown blocks', async ({ page }) => {
    await page.evaluate(() => {
        const harness = window.mathJSLabWorkerTest;
        harness.effects.length = 0;
        harness.viewer.markdown =
            '\n```mathjslab\nglobal count; count=0\nfunction y=sample(v)\nglobal count; count+=1; pause(0.001); y=v;\nend\nfunction y=samples(), y=[sample(1),sample(2)]; end\n```\n\n```mathjslab\nplot(samples()(1:end))\n```\n\n```mathjslab\ncount\n```';
    });
    const viewer = page.locator('markdown-document');
    await expect(viewer.locator('.plot-container')).toHaveCount(1, { timeout: 20_000 });
    await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 20_000 });
    await expect(viewer.locator('.mathjslab-result[data-state="bad"]')).toHaveCount(0);
    await expect(viewer.locator('.mathjslab-result').last()).toContainText('2');
    const request = JSON.parse((await viewer.locator('.plot-container').getAttribute('data-request')) ?? '{}');
    expect(request.data.map((series: { y: number[] }) => series.y)).toEqual([[1, 2]]);
    expect(await page.evaluate(() => window.mathJSLabWorkerTest.effects)).toEqual([
        { type: 'delay', milliseconds: 1 },
        { type: 'delay', milliseconds: 1 },
    ]);
});
