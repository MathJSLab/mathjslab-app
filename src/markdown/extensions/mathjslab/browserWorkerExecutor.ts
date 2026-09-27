import { Interpreter, type NodeInput } from 'mathjslab';
import { RemoteMathJSLabRuntime, type RuntimeHost, type RuntimeOutput, type RuntimeWorkerEndpoint } from 'mathjslab/runtime';

import type { MarkdownDocumentContext } from '../../../MarkdownEngine';
import { DefaultMarkdownResourceService } from '../../security';
import type { MathJSLabExecutionResult, MathJSLabExecutor, MathJSLabOutput } from './executor';
import { materializePlotlyOutput } from './plotlyOutput';

export type BrowserMathJSLabWorkerExecutorOptions = {
    readonly toMathML: MathJSLabExecutor['toMathML'];
    readonly workerFactory?: () => Worker;
    readonly timeoutMs?: number;
};

let executorSequence = 0;

const statementSources = (interpreter: Interpreter, source: string): string[] => {
    const lines = source.split(/\r?\n/);
    const tree = interpreter.Parse(source);
    if (tree.type !== 'LIST') return [source];
    return tree.list.map((statement: NodeInput, index: number) => {
        const previous = tree.list[index - 1];
        const next = tree.list[index + 1];
        const startLine = lines[statement.start.line - 1] ?? '';
        const stopLine = lines[statement.stop.line - 1] ?? '';
        if (statement.stop.line === statement.start.line) {
            if ((!previous || previous.stop.line < statement.start.line) && (!next || next.start.line > statement.start.line)) return startLine;
            return startLine.substring(statement.start.column, statement.stop.column + 1);
        }
        const middle = statement.stop.line > statement.start.line + 1 ? `${lines.slice(statement.start.line, statement.stop.line - 1).join('\n')}\n` : '';
        const start = !previous || previous.stop.line < statement.start.line ? `${startLine}\n` : `${startLine.substring(statement.start.column)}\n`;
        const stop = !next || next.start.line > statement.stop.line ? stopLine : stopLine.substring(0, statement.stop.column + 1);
        return `${start}${middle}${stop}`.trim();
    });
};

/** Creates the Markdown adapter over the package-level MathJSLab runtime. */
export const createBrowserMathJSLabWorkerExecutor = (options: BrowserMathJSLabWorkerExecutorOptions): MathJSLabExecutor => {
    const contexts = new Map<string, MarkdownDocumentContext>();
    const fallbackResources = new DefaultMarkdownResourceService();
    const storage = new Map<string, unknown>();
    const host: RuntimeHost = {
        async request(effect, context) {
            const documentContext = contexts.get(context.sessionId);
            switch (effect.type) {
                case 'read-text':
                    if (!documentContext) throw new Error(`Unknown Markdown runtime session: ${context.sessionId}`);
                    return { value: await (documentContext.resources ?? fallbackResources).readText(effect.reference, documentContext) };
                case 'read-binary':
                    throw new Error('Binary resources are not enabled by the Markdown adapter.');
                case 'storage-get':
                    return { value: storage.get(effect.key) };
                case 'storage-set':
                    storage.set(effect.key, effect.value);
                    return {};
                case 'clock-now':
                    return { value: Date.now() };
                case 'delay':
                    await new Promise<void>((resolve) => setTimeout(resolve, effect.milliseconds));
                    return {};
                case 'publish-output':
                    return { value: effect.output };
            }
        },
    };
    const workerFactory = options.workerFactory ?? (() => new Worker(new URL('./mathjslab.worker.ts', import.meta.url), { type: 'module', name: 'mathjslab-markdown' }));
    const runtime = new RemoteMathJSLabRuntime(() => workerFactory() as unknown as RuntimeWorkerEndpoint, { host });
    const parser = Interpreter.Create();
    const executorId = ++executorSequence;
    let sessionSequence = 0;

    const materialize = async (outputs: readonly RuntimeOutput[]): Promise<readonly MathJSLabOutput[]> => {
        const result: MathJSLabOutput[] = [];
        for (const output of outputs) {
            if (output.type === 'data' || (output.type === 'text' && !output.text.startsWith('Loaded script from '))) continue;
            if (output.type === 'visualization') {
                if (output.renderer !== 'plotly') throw new Error(`Unsupported MathJSLab visualization renderer: ${output.renderer}`);
                result.push(await materializePlotlyOutput({ ...output, renderer: 'plotly', role: 'visualization' } as Parameters<typeof materializePlotlyOutput>[0]));
            } else result.push(output);
        }
        return result;
    };

    return {
        toMathML: options.toMathML,
        async createSession(context) {
            const sessionId = `markdown-${executorId}-${++sessionSequence}`;
            contexts.set(sessionId, context);
            const session = await runtime.createSession({ id: sessionId, parfor: 'fallback' });
            return {
                async parse(source, activeContext) {
                    contexts.set(sessionId, activeContext);
                    const result = await session.parse(source);
                    if (result.diagnostics.some((item) => item.severity === 'error')) return { statements: [], error: new Error(result.diagnostics.map((item) => item.message).join('\n')) };
                    return { statements: statementSources(parser, source) };
                },
                async execute(statement, activeContext): Promise<MathJSLabExecutionResult> {
                    contexts.set(sessionId, activeContext);
                    const timeoutMs = activeContext.executionPolicy?.mathjslab?.timeoutMs ?? options.timeoutMs;
                    const result = await session.execute(statement, {
                        ...(activeContext.signal ? { signal: activeContext.signal } : {}),
                        ...(timeoutMs !== undefined ? { timeoutMs } : {}),
                    });
                    if (result.status === 'timeout') {
                        throw Object.assign(new Error(result.diagnostics[0]?.message ?? 'MathJSLab execution timed out.'), { name: 'TimeoutError', code: 'MATHJSLAB_TIMEOUT' });
                    }
                    return {
                        status: result.status,
                        state: result.status === 'success' ? 'good' : 'bad',
                        outputs: await materialize(result.outputs),
                        ...(result.status === 'success' ? {} : { error: new Error(result.diagnostics.map((item) => item.message).join('\n')) }),
                    };
                },
                async dispose() {
                    contexts.delete(sessionId);
                    await session.dispose();
                },
            };
        },
        async dispose() {
            contexts.clear();
            await runtime.dispose();
            fallbackResources.dispose();
        },
    };
};
