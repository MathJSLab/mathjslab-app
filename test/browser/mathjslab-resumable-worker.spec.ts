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

test('renders retained calls and loops through Markdown statement slicing and shared document workspace', async ({ page }) => {
    await page.evaluate(() => {
        const harness = window.mathJSLabWorkerTest;
        harness.effects.length = 0;
        harness.viewer.markdown = `
\`\`\`mathjslab
global count; count=0
\`\`\`

\`\`\`mathjslab
function y=step(v)
global count; count+=1;
pause(0.01); y=v+count;
end
value=0;
for i=1:2
value+=step(i);
end
value
\`\`\`

\`\`\`mathjslab
count
\`\`\``;
    });
    const viewer = page.locator('markdown-document');
    await expect(viewer.locator('.mathjslab-result')).toHaveCount(7, { timeout: 20_000 });
    await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 20_000 });
    await expect(viewer.locator('.mathjslab-result[data-state="bad"]')).toHaveCount(0);
    await expect(viewer.locator('.mathjslab-result').nth(5)).toContainText('6');
    await expect(viewer.locator('.mathjslab-result').last()).toContainText('2');
    expect(await page.evaluate(() => window.mathJSLabWorkerTest.effects)).toEqual([
        { type: 'delay', milliseconds: 10 },
        { type: 'delay', milliseconds: 10 },
    ]);
});

test('cleans active contexts during a suspended function and cancels its pending delay', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const harness = window.mathJSLabWorkerTest;
        const session = await harness.executor.createSession({});
        const controller = new AbortController();
        const nextEffect = harness.nextEffect();
        const pending = session.execute('function y=f(), plot([1,2]); pause(60); plot([3,4]); y=9; end; x=f()', { blockIndex: 0, statementIndex: 0, signal: controller.signal });
        const effect = await nextEffect;
        const duringCall = await harness.probe();
        controller.abort('cancel retained call');
        const cancelled = await harness.serialize(await pending);
        const recovery = await harness.serialize(await session.execute("exist('x')", { blockIndex: 0, statementIndex: 0 }));
        const afterRecovery = await harness.probe();
        await session.dispose?.();
        return { effect, duringCall, cancelled, recovery, afterRecovery };
    });
    expect(result.effect.type).toBe('delay');
    expect(result.duringCall).toMatchObject({ interpreter: false, plots: false });
    expect(result.cancelled).toMatchObject({ status: 'cancelled', outputs: [] });
    expect(result.recovery.outputs[0]?.markup).toContain('<mn>0</mn>');
    expect(result.afterRecovery).toMatchObject({ interpreter: false, plots: false });
});

test('retains control flow, argument order, multiple outputs and chained writes through real Worker waits', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { executor, effects, serialize } = window.mathJSLabWorkerTest;
        const session = await executor.createSession({});
        const context = { blockIndex: 0, statementIndex: 0 };
        const start = effects.length;
        const execution = await session.execute(
            `
global trace; trace=0;
function y=mark(v)
global trace; trace=trace*10+v;
pause(v/1000);
y=v;
end
function [a,b]=pair(x,y)
a=x+y; pause(0); b=x*y;
end
before=7;
for i=1:2
if i==1
[a,b]=pair(mark(1),mark(2));
else
h=@(x)mark(x); a+=h(3);
end
end
C={[10,20]}; C{mark(1)}(mark(2))=mark(4);
s.a=5;
function y=field(), pause(0); y='a'; end
s.(field())+=mark(5);
after=before+a+b+C{1}(end)+s.a;
trace`,
            context,
        );
        const workspace = await session.execute('after', context);
        await session.dispose?.();
        return { execution: await serialize(execution), workspace: await serialize(workspace), effects: effects.slice(start) };
    });
    expect(result.execution.status).toBe('success');
    expect(result.execution.outputs[0]?.markup).toContain('<mn>1231245</mn>');
    expect(result.workspace.outputs[0]?.markup).toContain('<mn>29</mn>');
    expect(result.effects.map((effect) => effect.type)).toEqual(Array(9).fill('delay'));
    expect(result.effects.map((effect) => effect.milliseconds)).toEqual([1, 2, 0, 3, 1, 2, 4, 0, 5]);
});

test('captures plots once before and after waits and binds external functions to their session', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { executor, serialize } = window.mathJSLabWorkerTest;
        const session = await executor.createSession({});
        const context = { blockIndex: 0, statementIndex: 0 };
        const execution = await serialize(
            await session.execute(
                `
n=3; plot([1,2]);
function y=f(), pause(0); y=8; end
x=f(); plot([x,9]);
summation(k,1,n,k)+productory(k,1,n,k)`,
                context,
            ),
        );
        const next = await serialize(await session.execute('x+n', context));
        const sampled = await serialize(await session.execute('plot2d(t,t,0,1)', context));
        const failure = await serialize(await session.execute('summation(k,1,n,missing)', context));
        const recovered = await serialize(await session.execute('summation(k,1,n,k)', context));
        const afterSteps = await window.mathJSLabWorkerTest.probe();
        await session.dispose?.();
        return { execution, next, sampled, failure, recovered, afterSteps };
    });
    expect(result.execution.status).toBe('success');
    expect(result.execution.outputs.filter((output) => output.type === 'plot').map((output) => output.request?.data[0]?.y)).toEqual([
        [1, 2],
        [8, 9],
    ]);
    expect(result.execution.outputs[0]?.markup).toContain('<mn>12</mn>');
    expect(result.next.outputs).toHaveLength(1);
    expect(result.next.outputs[0]?.markup).toContain('<mn>11</mn>');
    expect(result.sampled.status).toBe('success');
    expect(result.sampled.outputs.filter((output) => output.type === 'plot')[0]?.request?.data[0]?.y).toHaveLength(100);
    expect(result.failure.status).toBe('error');
    expect(result.recovered.outputs[0]?.markup).toContain('<mn>6</mn>');
    expect(result.afterSteps).toMatchObject({ interpreter: false, plots: false });
});

test('resumes repeated relative loads in a loop and retains caller instructions', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { executor, serialize, effects } = window.mathJSLabWorkerTest;
        const context = { sourceUrl: new URL('/test/browser/fixtures/worker-lesson.md', location.href), blockIndex: 0, statementIndex: 0 };
        const session = await executor.createSession(context);
        const start = effects.length;
        const executed = await serialize(await session.execute("x=0; for i=1:2; x+=1; load('./mathjslab-loaded.m'); x+=workerLoaded; end; x", context));
        await session.dispose?.();
        return { executed, effects: effects.slice(start) };
    });
    expect(result.executed.status).toBe('success');
    expect(result.executed.outputs[0]?.markup).toContain('<mn>148</mn>');
    expect(result.executed.outputs.filter((output) => output.type === 'text')).toHaveLength(2);
    expect(result.effects).toMatchObject([
        { type: 'read-text', reference: './mathjslab-loaded.m' },
        { type: 'read-text', reference: './mathjslab-loaded.m' },
    ]);
});

test('keeps independent numeric settings and workspaces while another session waits', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { executor, serialize } = window.mathJSLabWorkerTest;
        const first = await executor.createSession({});
        const second = await executor.createSession({});
        const context = { blockIndex: 0, statementIndex: 0 };
        await first.execute("configure('precision',20); x=7", context);
        await second.execute("configure('precision',40); x=11", context);
        const waiting = first.execute("function y=f(), pause(0.05); y=getconfig('precision'); end; observed=f(); x+=1; observed", context);
        const other = await serialize(await second.execute("x+=1; getconfig('precision')", context));
        const resumed = await serialize(await waiting);
        const x1 = await serialize(await first.execute('x', context));
        const x2 = await serialize(await second.execute('x', context));
        await first.dispose?.();
        const surviving = await serialize(await second.execute('x+1', context));
        await second.dispose?.();
        return { resumed, other, x1, x2, surviving };
    });
    expect(result.resumed.status).toBe('success');
    expect(result.resumed.outputs[0]?.markup).toContain('<mn>20</mn>');
    expect(result.other.outputs[0]?.markup).toContain('<mn>40</mn>');
    expect(result.x1.outputs[0]?.markup).toContain('<mn>8</mn>');
    expect(result.x2.outputs[0]?.markup).toContain('<mn>12</mn>');
    expect(result.surviving.outputs[0]?.markup).toContain('<mn>13</mn>');
});

test('injects host failures into catch and cleanup, preserving prior workspace effects', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { executor, serialize, effects } = window.mathJSLabWorkerTest;
        const context = { blockIndex: 0, statementIndex: 0, resourcePolicy: { allowNetwork: false }, sourceUrl: new URL('/lesson.md', location.href) };
        const session = await executor.createSession(context);
        const start = effects.length;
        const caught = await serialize(await session.execute("x=1; try; load('./missing.m'); x=99; catch; x+=2; end; pause(0); x+=4; x", context));
        const failure = await serialize(await session.execute("unwind_protect; x+=8; load('./missing.m'); x=99; unwind_protect_cleanup; x+=16; end_unwind_protect", context));
        const recovery = await serialize(await session.execute('x', context));
        await session.dispose?.();
        return { caught, failure, recovery, effects: effects.slice(start) };
    });
    expect(result.caught.status).toBe('success');
    expect(result.caught.outputs[0]?.markup).toContain('<mn>7</mn>');
    expect(result.failure.status).toBe('error');
    expect(result.failure.error).toContain('Network access is not allowed');
    expect(result.recovery.outputs[0]?.markup).toContain('<mn>31</mn>');
    expect(result.effects.map((effect) => effect.type)).toEqual(['read-text', 'delay', 'read-text']);
});

for (const interruption of ['abort', 'timeout', 'dispose'] as const) {
    test(`${interruption} aborts the outstanding host read and ignores late results`, async ({ page }) => {
        const result = await page.evaluate(async (interruption) => {
            const harness = window.mathJSLabWorkerTest;
            const controller = new AbortController();
            let release!: (text: string) => void;
            let started!: () => void;
            const ready = new Promise<void>((resolve) => {
                started = resolve;
            });
            let hostSignal: AbortSignal | undefined;
            const context = {
                blockIndex: 0,
                statementIndex: 0,
                sourceUrl: new URL('/lesson.md', location.href),
                fetchResource: async (_url: URL, init: RequestInit) => {
                    hostSignal = init.signal ?? undefined;
                    started();
                    return new Promise<Response>((resolve) => {
                        release = (text) => resolve(new Response(text));
                    });
                },
            };
            const session = await harness.executor.createSession(context);
            await session.execute('x=7', context);
            const count = harness.workerCount;
            const pending = Promise.resolve(
                session.execute("x+=1; load('held.m'); x=99", {
                    ...context,
                    signal: controller.signal,
                    ...(interruption === 'timeout' ? { executionPolicy: { mathjslab: { timeoutMs: 2000 } } } : {}),
                }),
            ).then(
                (result) => ({ status: result.status }),
                (error: Error & { code?: string }) => ({ status: error.name, code: error.code }),
            );
            await ready;
            const duringWait = await harness.probe();
            if (interruption === 'abort') controller.abort('test abort');
            if (interruption === 'dispose') {
                await session.dispose?.();
                await session.dispose?.();
            }
            const interrupted = await pending;
            const aborted = hostSignal?.aborted;
            release('x=1234');
            let recovery;
            if (interruption === 'dispose') {
                try {
                    await session.execute('1', context);
                } catch (error) {
                    recovery = String(error);
                }
            } else recovery = await harness.serialize(await session.execute("exist('x')", context));
            const fresh = await harness.executor.createSession({});
            const independent = await harness.serialize(await fresh.execute('2+3', { blockIndex: 0, statementIndex: 0 }));
            await fresh.dispose?.();
            await session.dispose?.();
            return { interrupted, aborted, recovery, independent, duringWait, recreated: harness.workerCount > count };
        }, interruption);
        expect(result.aborted).toBe(true);
        expect(result.duringWait).toMatchObject({ interpreter: false, plots: false });
        expect(result.interrupted).toMatchObject(interruption === 'timeout' ? { status: 'TimeoutError', code: 'MATHJSLAB_TIMEOUT' } : { status: 'cancelled' });
        if (interruption === 'dispose') expect(result.recovery).toContain('session is disposed');
        else {
            expect(result.recreated).toBe(true);
            expect(result.recovery).toMatchObject({ status: 'success', outputs: [{ type: 'mathml', markup: expect.stringContaining('<mn>0</mn>') }] });
        }
        expect(result.independent.outputs[0]?.markup).toContain('<mn>5</mn>');
    });
}

test('preserves ordinary variable and user-function dispatch for effect names', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const { executor, serialize, effects } = window.mathJSLabWorkerTest;
        const session = await executor.createSession({});
        const context = { blockIndex: 0, statementIndex: 0 };
        const start = effects.length;
        const variable = await serialize(await session.execute('pause=[4,9]; pause(2)', context));
        const callable = await serialize(await session.execute('clear pause; function y=pause(x), y=x+10; end; pause(2)', context));
        await session.dispose?.();
        return { variable, callable, effects: effects.slice(start) };
    });
    expect(result.variable.outputs[0]?.markup).toContain('<mn>9</mn>');
    expect(result.callable.outputs[0]?.markup).toContain('<mn>12</mn>');
    expect(result.effects).toEqual([]);
});
test('retains literal elements used directly by plots and nested cells', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const harness = window.mathJSLabWorkerTest;
        const session = await harness.executor.createSession({});
        harness.effects.length = 0;
        try {
            const execution = await harness.serialize(
                await session.execute(
                    'function y=mark(v), global trace; trace=trace*10+v; pause(v/1000); y=v; end; global trace; trace=0; plot([mark(1),mark(2);mark(3),mark(4)]); c={mark(5),[mark(6),mark(7)]}; trace',
                    { blockIndex: 0, statementIndex: 0 },
                ),
            );
            const workspace = await harness.serialize(await session.execute('sum(c{2})+c{1}', { blockIndex: 1, statementIndex: 0 }));
            return { execution, workspace, effects: [...harness.effects], contexts: await harness.probe() };
        } finally {
            await session.dispose?.();
        }
    });
    expect(result.execution.status).toBe('success');
    expect(result.execution.outputs.find((output) => output.type === 'mathml')?.markup).toContain('<mn>1234567</mn>');
    const plot = result.execution.outputs.find((output) => output.type === 'plot');
    expect(plot?.request?.data.map((series) => series.y)).toEqual([
        [1, 3],
        [2, 4],
    ]);
    expect(result.workspace.outputs[0]?.markup).toContain('<mn>18</mn>');
    expect(result.effects).toEqual([1, 2, 3, 4, 5, 6, 7].map((milliseconds) => ({ type: 'delay', milliseconds })));
    expect(result.contexts).toMatchObject({ interpreter: false, plots: false });
});

test('cancels a second literal element and recovers with a clean Worker', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const harness = window.mathJSLabWorkerTest;
        const session = await harness.executor.createSession({});
        const controller = new AbortController();
        harness.effects.length = 0;
        try {
            const first = harness.nextEffect();
            const pending = session.execute('function y=g(a), if a==2, pause(60); else, pause(0.01); end; y=a; end; x=0; a=99; a=[g(++x),g(++x),g(++x)]; plot(a)', {
                blockIndex: 0,
                statementIndex: 0,
                signal: controller.signal,
            });
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

test('retains completed element effects when concatenation fails', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const harness = window.mathJSLabWorkerTest;
        const session = await harness.executor.createSession({});
        harness.effects.length = 0;
        try {
            const failed = await harness.serialize(
                await session.execute('function y=g(a), global count; count+=1; pause(a/1000); y=a; end; global count; count=0; a=99; a=[g(1);g(2),g(3)]; plot(a)', {
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
    expect(result.workspace.outputs[0]?.markup).toContain('<mn>102</mn>');
    expect(result.effects).toEqual([1, 2, 3].map((milliseconds) => ({ type: 'delay', milliseconds })));
    expect(result.contexts).toMatchObject({ interpreter: false, plots: false });
});
test('propagates a host failure from a literal element without replaying completed work', async ({ page }) => {
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
                await session.execute('function y=g(a), global count; count+=1; pause(a/1000); y=a; end; global count; count=0; a=99; try, a=[g(1),g(77),g(3)]; catch, end; a+count', {
                    blockIndex: 0,
                    statementIndex: 0,
                }),
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

test('keeps numeric session configuration through a literal element wait', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const harness = window.mathJSLabWorkerTest;
        const first = await harness.executor.createSession({});
        const second = await harness.executor.createSession({});
        const context = { blockIndex: 0, statementIndex: 0 };
        try {
            await first.execute('configure("precision",20)', context);
            const effect = harness.nextEffect();
            const pending = first.execute('function y=g(), pause(0.1); y=getconfig("precision"); end; c={g()}; c{1}', context);
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

test('uses resumable plot literals across Markdown blocks', async ({ page }) => {
    await page.evaluate(() => {
        const harness = window.mathJSLabWorkerTest;
        harness.effects.length = 0;
        harness.viewer.markdown =
            '\n```mathjslab\nglobal count; count=0\nfunction y=sample(v)\nglobal count; count+=1; pause(0.001); y=v;\nend\n```\n\n```mathjslab\nplot([sample(1),sample(2)])\n```\n\n```mathjslab\ncount\n```';
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
