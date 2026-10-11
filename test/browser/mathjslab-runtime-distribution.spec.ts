import { expect, test } from '@playwright/test';

for (const factory of ['default', 'explicit'] as const) {
    test(`native browser runtime uses its ${factory} public Dedicated Worker and clones host effects`, async ({ page }) => {
        await page.goto('/test/browser/fixtures/mathjslab-runtime.html');
        const result = await page.evaluate(async (factory) => {
            const entry = '/test/mathjslab-lib/mathjslab.runtime-browser.esm2022.js';
            const { createBrowserMathJSLabRuntime } = await import(entry);
            const effects: Array<{ type: string; milliseconds?: number }> = [];
            const runtime = createBrowserMathJSLabRuntime({
                ...(factory === 'explicit' ? { workerFactory: () => new Worker('/test/mathjslab-lib/mathjslab.runtime-worker.esm2022.js', { type: 'module' }) } : {}),
                host: {
                    request: async (effect: { type: string; milliseconds?: number }) => {
                        effects.push(effect);
                        return {};
                    },
                },
            });
            const session = await runtime.createSession();
            const execution = await session.execute('function y=f(x), pause(x); y=x+4; end; x=0; result=f(x++); x+result', { timeoutMs: 5000 });
            const retained = await session.execute('function y=sample(v), pause(v/1000); y=v; end; function y=make(), y=[sample(1),sample(2)]; end; sum(make()(1:end))', { timeoutMs: 5000 });
            const plots = await session.execute('a=2; plot([a,a+1]); pause(0); plot2d(a*x,x,0,1); histogram([3,4])', { timeoutMs: 5000 });
            await runtime.dispose();
            return { execution, retained, plots, effects };
        }, factory);
        expect(result.execution.status, JSON.stringify(result.execution.diagnostics)).toBe('success');
        expect(result.execution.outputs[0]).toMatchObject({ type: 'text', text: '5\n' });
        expect(result.retained.status, JSON.stringify(result.retained.diagnostics)).toBe('success');
        expect(result.retained.outputs[0]).toMatchObject({ type: 'text', text: '3\n' });
        expect(result.plots.status, JSON.stringify(result.plots.diagnostics)).toBe('success');
        const visualizations = result.plots.outputs.filter((output: { type: string }) => output.type === 'visualization');
        expect(visualizations.map((output: { request: { type: string } }) => output.request.type)).toEqual(['plot', 'plot2d', 'histogram']);
        expect(visualizations[0].request.data[0].y).toEqual([2, 3]);
        expect(visualizations[1].request.data[0].y[1]).toBe(0.02);
        expect(result.effects).toEqual([0, 1, 2, 0].map((milliseconds) => ({ type: 'delay', milliseconds })));
    });
}
