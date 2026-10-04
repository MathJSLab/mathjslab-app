import { jest } from '@jest/globals';
import { TextEncoder } from 'node:util';
import { MarkdownEngine } from '../../src/MarkdownEngine';
import { DefaultMarkdownResourceService } from '../../src/markdown/security';
import { mathJSLabExtension } from '../../src/markdown/extensions/mathjslab/extension';
import { mathJaxExtension } from '../../src/markdown/extensions/mathjax/extension';
import { mountMarkdownDocument, disposeMarkdownDocument } from '../../src/markdown/MarkdownDocumentHost';

Object.assign(globalThis, { TextEncoder });
const gate = <T = void>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    const promise = new Promise<T>((done) => (resolve = done));
    return { promise, resolve };
};
const textResponse = (text: string): Response => ({ ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => text }) as Response;

describe('Milestone lifecycle contracts', () => {
    test('container disposal cancels and waits for standalone prepare hooks', async () => {
        const started = gate();
        const finish = gate();
        let signal: AbortSignal | undefined;
        let late = false;
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                {
                    name: 'pending',
                    async prepare(_, context) {
                        signal = context.signal;
                        started.resolve();
                        await finish.promise;
                        if (!signal?.aborted) late = true;
                    },
                },
            ],
        });
        const container = document.createElement('div');
        const rendering = engine.typeset(container);
        await started.promise;
        let disposed = false;
        const disposal = engine.dispose(container).then(() => {
            disposed = true;
        });
        await Promise.resolve();
        await Promise.resolve();
        expect(signal?.aborted).toBe(true);
        expect(disposed).toBe(false);
        finish.resolve();
        await Promise.all([rendering, disposal]);
        expect(late).toBe(false);
        await engine.dispose();
    });

    test('settled standalone typeset hooks release their engine ownership record', async () => {
        const engine = new MarkdownEngine({ profile: 'core' });
        await engine.typeset(document.createElement('div'));
        expect((engine as unknown as { hookOperations: Set<unknown> }).hookOperations.size).toBe(0);
        await engine.dispose();
    });

    test('all cleanup runs even when a fence and extension disposer fail', async () => {
        const cleaned: string[] = [];
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                {
                    name: 'first',
                    fences: [
                        {
                            language: 'first',
                            className: 'first',
                            render: async () => undefined,
                            dispose: () => {
                                cleaned.push('first');
                            },
                        },
                    ],
                    dispose: () => {
                        cleaned.push('extension-first');
                    },
                },
                {
                    name: 'broken',
                    fences: [
                        {
                            language: 'broken',
                            className: 'broken',
                            render: async () => undefined,
                            dispose: () => {
                                cleaned.push('broken');
                                throw new Error('broken fence');
                            },
                        },
                    ],
                    dispose: () => {
                        cleaned.push('extension-broken');
                        throw new Error('broken extension');
                    },
                },
            ],
        });
        const container = document.createElement('div');
        await engine.renderDocument('```first\na\n```\n\n```broken\nb\n```', container);
        await expect(engine.dispose()).rejects.toThrow();
        expect(cleaned).toEqual(['broken', 'first', 'extension-broken', 'extension-first']);
        expect(container.childElementCount).toBe(0);
        await expect(engine.dispose()).rejects.toThrow();
        expect(cleaned).toHaveLength(4);
    });

    test('resources cannot allocate object URLs after disposal', () => {
        const previous = URL.createObjectURL;
        URL.createObjectURL = jest.fn(() => 'blob:late');
        try {
            const resources = new DefaultMarkdownResourceService();
            resources.dispose();
            expect(() => resources.createObjectURL(new Blob())).toThrow(/disposed/);
            expect(URL.createObjectURL).not.toHaveBeenCalled();
        } finally {
            URL.createObjectURL = previous;
        }
    });

    test('document disposal waits for the asynchronous MathJSLab session disposer', async () => {
        const started = gate();
        const finish = gate();
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                mathJSLabExtension({
                    toMathML: (source) => source,
                    createSession: () => ({
                        parse: () => ({ statements: ['x'] }),
                        execute: () => ({ status: 'success' }),
                        dispose: async () => {
                            started.resolve();
                            await finish.promise;
                        },
                    }),
                }),
            ],
        });
        const session = await engine.renderDocument('```mathjslab\nx\n```', document.createElement('div'));
        let complete = false;
        const disposal = session.dispose().then(() => {
            complete = true;
        });
        await started.promise;
        await Promise.resolve();
        await Promise.resolve();
        expect(complete).toBe(false);
        finish.resolve();
        await disposal;
        await engine.dispose();
    });

    test('engine invokes document cleanup hooks only for the disposed container', async () => {
        const cleaned: ParentNode[] = [];
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                {
                    name: 'owned-resource',
                    disposeContainer: (container) => {
                        cleaned.push(container);
                    },
                },
            ],
        });
        const firstContainer = document.createElement('div');
        const secondContainer = document.createElement('div');
        const first = await engine.renderDocument('# First', firstContainer);
        const second = await engine.renderDocument('# Second', secondContainer);
        const previousCalls = cleaned.length;
        await first.dispose();
        expect(cleaned.slice(previousCalls)).toEqual([firstContainer]);
        expect(second.disposed).toBe(false);
        await engine.dispose();
    });

    test('MathJax releases only math owned by the disposed document', async () => {
        const original = (globalThis as typeof globalThis & { MathJax?: unknown }).MathJax;
        const cleared: Element[][] = [];
        Object.assign(globalThis, {
            MathJax: {
                typesetPromise: async () => undefined,
                typesetClear: (elements: Element[]) => cleared.push(elements),
            },
        });
        try {
            const engine = new MarkdownEngine({ profile: 'core', extensions: [mathJaxExtension()] });
            const container = document.createElement('div');
            container.innerHTML = '<div class="mathjax-pending" data-math-display="block"><span class="mathjax-source">x+1</span></div>';
            const math = container.firstElementChild!;
            await engine.typeset(container);
            await engine.dispose(container);
            expect(cleared).toEqual([[math]]);
            await engine.dispose();
        } finally {
            if (original === undefined) delete (globalThis as typeof globalThis & { MathJax?: unknown }).MathJax;
            else Object.assign(globalThis, { MathJax: original });
        }
    });

    test('disposing one resource service aborts only its pending reads', async () => {
        const resources = new DefaultMarkdownResourceService();
        const firstAbort = new AbortController();
        const secondAbort = new AbortController();
        const responses: Array<(response: Response) => void> = [];
        const signals: AbortSignal[] = [];
        const fetchResource = async (_url: URL, init: RequestInit): Promise<Response> => {
            signals.push(init.signal!);
            return new Promise<Response>((resolve) => responses.push(resolve));
        };
        const reference = 'https://resources.test/shared.md';
        const first = resources.readText(reference, { signal: firstAbort.signal, fetchResource });
        const second = resources.readText(reference, { signal: secondAbort.signal, fetchResource });
        firstAbort.abort();
        responses[0]!(textResponse('# Obsolete'));
        responses[1]!(textResponse('# Current'));
        await expect(first).rejects.toMatchObject({ name: 'AbortError' });
        await expect(second).resolves.toBe('# Current');
        expect(signals[0]?.aborted).toBe(true);
        expect(signals[1]?.aborted).toBe(false);
        resources.dispose();
    });

    test('facade navigator survives navigation and is removed when its session is replaced directly', async () => {
        jest.unstable_mockModule('../../src/appEngine', () => ({ appEngine: { interpreter: {} } }));
        const { Markdown, markdownEngine } = await import('../../src/Markdown');
        const container = document.createElement('div');
        const initial = await Markdown.renderDocument('# First', container, {
            sourceUrl: new URL('https://navigation.test/first.md'),
            fetchResource: async () => textResponse('# Second'),
        });
        const navigator = Markdown.getNavigator(container)!;
        await navigator.navigate('second.md');
        expect(Markdown.getNavigator(container)).toBe(navigator);
        expect(navigator.history).toHaveLength(2);
        await markdownEngine.renderDocument('# Replacement', container);
        expect(initial.disposed).toBe(true);
        expect(navigator.navigationState).toBe('disposed');
        expect(Markdown.getNavigator(container)).toBeUndefined();
        await Markdown.dispose(container);
    });

    test('disposing a host settles a mount cancelled before ready', async () => {
        const started = gate();
        const finish = gate();
        const container = document.createElement('div');
        document.body.append(container);
        const engine = new MarkdownEngine({ profile: 'core' });
        const mounting = mountMarkdownDocument(container, {
            engine,
            src: 'https://example.test/page.md',
            context: {
                fetchResource: async () => {
                    started.resolve();
                    await finish.promise;
                    return { ok: true, headers: new Headers(), text: async () => '# Old' } as Response;
                },
            },
        });
        const outcome = mounting.then(
            () => 'ready',
            (error: unknown) => (error as Error).name,
        );
        await started.promise;
        const disposal = disposeMarkdownDocument(container);
        finish.resolve();
        await disposal;
        const settled = await Promise.race([outcome, new Promise<string>((resolve) => setTimeout(() => resolve('pending'), 50))]);
        expect(settled).toBe('AbortError');
        expect(container.childElementCount).toBe(0);
        await engine.dispose();
        container.remove();
    });

    test('removing a hosted component settles its pending mount promise', async () => {
        const started = gate();
        const finish = gate();
        const container = document.createElement('div');
        document.body.append(container);
        const engine = new MarkdownEngine({ profile: 'core' });
        const mounting = mountMarkdownDocument(container, {
            engine,
            src: 'https://example.test/page.md',
            context: {
                fetchResource: async () => {
                    started.resolve();
                    await finish.promise;
                    return textResponse('# Old');
                },
            },
        });
        const outcome = mounting.then(
            () => 'ready',
            (error: unknown) => (error as Error).name,
        );
        await started.promise;
        container.firstElementChild!.remove();
        const settled = await Promise.race([outcome, new Promise<string>((resolve) => setTimeout(() => resolve('pending'), 50))]);
        expect(settled).toBe('AbortError');
        finish.resolve();
        await engine.dispose();
        container.remove();
    });
});
