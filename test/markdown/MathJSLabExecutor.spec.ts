import { MarkdownEngine, type MarkdownDiagnostic } from '../../src/MarkdownEngine';
import { mathJSLabExtension } from '../../src/markdown/extensions/mathjslab/extension';
import type { MathJSLabExecutionSession, MathJSLabExecutor } from '../../src/markdown/extensions/mathjslab/executor';

const lesson = (first: string, second: string): string => `# Session

\`\`\`mathjslab
${first}
\`\`\`

\`\`\`mathjslab
${second}
\`\`\``;

describe('MathJSLab executor sessions', () => {
    test('isolates document state and preserves block and statement order', async () => {
        const events: string[] = [];
        const disposed: number[] = [];
        let nextSession = 0;
        const executor: MathJSLabExecutor = {
            toMathML: (source) => source,
            createSession: (): MathJSLabExecutionSession => {
                const id = ++nextSession;
                const variables = new Map<string, string>();
                return {
                    parse: (source) => ({
                        statements: source
                            .split(';')
                            .map((statement) => statement.trim())
                            .filter(Boolean),
                    }),
                    async execute(statement, context) {
                        events.push(`${id}:start:${context.blockIndex}:${context.statementIndex}:${statement}`);
                        if (statement.startsWith('set ')) {
                            const [name, value] = statement.slice(4).split('=');
                            variables.set(name!.trim(), value!.trim());
                            await new Promise((resolve) => setTimeout(resolve, 5));
                            const text = `${id}:set:${name!.trim()}`;
                            events.push(`${id}:end:${context.blockIndex}:${context.statementIndex}:${statement}`);
                            return { status: 'success', outputs: [{ type: 'text', text }] };
                        } else {
                            const text = `${id}:get:${variables.get(statement.slice(4).trim()) ?? 'undefined'}`;
                            events.push(`${id}:end:${context.blockIndex}:${context.statementIndex}:${statement}`);
                            return { status: 'success', outputs: [{ type: 'text', text }] };
                        }
                    },
                    dispose: () => {
                        disposed.push(id);
                    },
                };
            },
        };
        const engine = new MarkdownEngine({ profile: 'core', extensions: [mathJSLabExtension(executor)], maxConcurrentRenders: 4 });
        const first = document.createElement('div');
        const second = document.createElement('div');

        const [firstDocument, secondDocument] = await Promise.all([
            engine.renderDocument(lesson('set x=one; get x', 'get x'), first),
            engine.renderDocument(lesson('set x=two', 'get x'), second),
        ]);

        expect(nextSession).toBe(2);
        expect(Array.from(first.querySelectorAll('.mathjslab-result'), (element) => element.textContent)).toEqual(['1:set:x', '1:get:one', '1:get:one']);
        expect(Array.from(second.querySelectorAll('.mathjslab-result'), (element) => element.textContent)).toEqual(['2:set:x', '2:get:two']);
        expect(events.filter((event) => event.startsWith('1:'))).toEqual([
            '1:start:0:0:set x=one',
            '1:end:0:0:set x=one',
            '1:start:0:1:get x',
            '1:end:0:1:get x',
            '1:start:1:0:get x',
            '1:end:1:0:get x',
        ]);

        await firstDocument.dispose();
        await secondDocument.dispose();
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(disposed.sort()).toEqual([1, 2]);
        await engine.dispose();
    });

    test('stops queued statements after the document signal is aborted', async () => {
        const executed: string[] = [];
        let release!: () => void;
        const blocked = new Promise<void>((resolve) => {
            release = resolve;
        });
        const controller = new AbortController();
        const executor: MathJSLabExecutor = {
            toMathML: (source) => source,
            createSession: () => ({
                parse: () => ({ statements: ['first', 'second'] }),
                execute: async (statement) => {
                    executed.push(statement);
                    if (statement === 'first') await blocked;
                    return { status: 'success' };
                },
            }),
        };
        const engine = new MarkdownEngine({ profile: 'core', extensions: [mathJSLabExtension(executor)] });
        const container = document.createElement('div');
        const rendering = engine.renderDocument(lesson('ignored', 'ignored'), container, { signal: controller.signal });
        await new Promise((resolve) => setTimeout(resolve, 0));
        controller.abort();
        release();
        const session = await rendering;

        expect(executed).toEqual(['first']);
        await session.dispose();
        await engine.dispose();
    });

    test('renders typed outputs and disposes rich nodes with the document', async () => {
        let disposeCount = 0;
        let mountCount = 0;
        let resizeCount = 0;
        let disconnectCount = 0;
        const previousResizeObserver = globalThis.ResizeObserver;
        class TestResizeObserver {
            public constructor(private readonly callback: ResizeObserverCallback) {}
            public observe(): void {
                this.callback([], this as unknown as ResizeObserver);
            }
            public unobserve(): void {}
            public disconnect(): void {
                disconnectCount++;
            }
        }
        globalThis.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
        const visualization = document.createElement('canvas');
        const executor: MathJSLabExecutor = {
            toMathML: (source) => source,
            createSession: () => ({
                parse: () => ({ statements: ['outputs'] }),
                execute: () => ({
                    status: 'success',
                    state: 'info',
                    outputs: [
                        { type: 'text', text: 'plain' },
                        { type: 'mathml', markup: '<math><mn>2</mn></math>' },
                        { type: 'html', markup: '<strong>trusted</strong>', trusted: true },
                        { type: 'html', markup: '<em>literal</em>', trusted: false },
                        {
                            type: 'node',
                            node: visualization,
                            role: 'visualization',
                            mount: () => void mountCount++,
                            resize: () => void resizeCount++,
                            dispose: () => void disposeCount++,
                        },
                    ],
                }),
            }),
        };
        const engine = new MarkdownEngine({ profile: 'core', extensions: [mathJSLabExtension(executor)] });
        const container = document.createElement('div');
        const markdownDocument = await engine.renderDocument('```mathjslab\noutputs\n```', container);
        const result = container.querySelector('.mathjslab-result')!;

        expect(result.getAttribute('data-state')).toBe('info');
        expect(result.querySelector('math')?.textContent).toBe('2');
        expect(result.querySelector('strong')?.textContent).toBe('trusted');
        expect(result.querySelector('em')).toBeNull();
        expect(result.textContent).toContain('<em>literal</em>');
        expect(result.querySelector('canvas')).toBe(visualization);
        expect(visualization.dataset.mathjslabOutputRole).toBe('visualization');
        expect(mountCount).toBe(1);
        expect(resizeCount).toBe(1);

        await markdownDocument.dispose();
        expect(disposeCount).toBe(1);
        expect(disconnectCount).toBe(1);
        await engine.dispose();
        globalThis.ResizeObserver = previousResizeObserver;
    });

    test('blocks execution in restricted documents unless the integrator opts in', async () => {
        let sessions = 0;
        const diagnostics: MarkdownDiagnostic[] = [];
        const executor: MathJSLabExecutor = {
            toMathML: (source) => source,
            createSession: () => {
                sessions++;
                return { parse: () => ({ statements: ['run'] }), execute: () => ({ status: 'success' }) };
            },
        };
        const engine = new MarkdownEngine({ profile: 'core', securityMode: 'sanitized', extensions: [mathJSLabExtension(executor)] });
        const blocked = document.createElement('div');
        const blockedDocument = await engine.renderDocument('```mathjslab\nrun\n```', blocked, { onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });

        expect(sessions).toBe(0);
        expect(blocked.querySelector('.markdown-extension-source')?.textContent).toBe('run');
        expect(diagnostics.map(({ code }) => code)).toEqual(['mathjslab-execution-disabled']);

        const allowed = document.createElement('div');
        const allowedDocument = await engine.renderDocument('```mathjslab\nrun\n```', allowed, {
            executionPolicy: { mathjslab: { allowInRestrictedMode: true } },
        });
        expect(sessions).toBe(1);
        expect(allowed.querySelectorAll('.mathjslab-result')).toHaveLength(1);

        await blockedDocument.dispose();
        await allowedDocument.dispose();
        await engine.dispose();
    });

    test('enforces source, block, and cumulative statement limits with diagnostics', async () => {
        const diagnostics: MarkdownDiagnostic[] = [];
        const executed: string[] = [];
        const executor: MathJSLabExecutor = {
            toMathML: (source) => source,
            createSession: () => ({
                parse: (source) => ({ statements: source.split(';') }),
                execute: (statement) => {
                    executed.push(statement);
                    return { status: 'success' };
                },
            }),
        };
        const engine = new MarkdownEngine({
            profile: 'core',
            executionPolicy: { mathjslab: { maxBlocks: 3, maxStatements: 1, maxSourceBytes: 10 } },
            extensions: [mathJSLabExtension(executor)],
        });
        const container = document.createElement('div');
        const source = lesson('one', 'two;three') + '\n\n```mathjslab\nsource-too-long\n```\n\n```mathjslab\nfour\n```';
        const markdownDocument = await engine.renderDocument(source, container, {
            onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
        });

        expect(executed).toEqual(['one']);
        expect(diagnostics.map(({ code }) => code).sort()).toEqual(['mathjslab-block-limit', 'mathjslab-source-limit', 'mathjslab-statement-limit']);
        expect(container.querySelectorAll('.markdown-extension-source')).toHaveLength(3);

        await markdownDocument.dispose();
        await engine.dispose();
    });

    test('keeps timeout failures local and continues with the next statement', async () => {
        const diagnostics: MarkdownDiagnostic[] = [];
        const timeout = Object.assign(new Error('execution exceeded 5 ms'), { name: 'TimeoutError', code: 'MATHJSLAB_TIMEOUT' });
        const executor: MathJSLabExecutor = {
            toMathML: (source) => source,
            createSession: () => ({
                parse: () => ({ statements: ['slow', 'recover'] }),
                execute: (statement) => {
                    if (statement === 'slow') throw timeout;
                    return { status: 'success', outputs: [{ type: 'text', text: 'recovered' }] };
                },
            }),
        };
        const engine = new MarkdownEngine({ profile: 'core', extensions: [mathJSLabExtension(executor)] });
        const container = document.createElement('div');
        const markdownDocument = await engine.renderDocument('```mathjslab\nslow; recover\n```', container, {
            onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
        });

        expect(container.querySelectorAll('.mathjslab-result')).toHaveLength(2);
        expect(container.querySelector('.mathjslab-error')?.textContent).toContain('execution exceeded 5 ms');
        expect(container.textContent).toContain('recovered');
        expect(diagnostics.map(({ code }) => code)).toEqual(['mathjslab-execution-timeout']);

        await markdownDocument.dispose();
        await engine.dispose();
    });
});
