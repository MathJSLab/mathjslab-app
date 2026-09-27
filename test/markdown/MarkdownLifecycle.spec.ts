/// <reference types="jest" />
import { MarkdownEngine, type MarkdownDocumentContext, type MarkdownExtension, type MarkdownExtensionCapability } from '../../src/MarkdownEngine';
import { TextEncoder } from 'node:util';

Object.assign(globalThis, { TextEncoder });

const fenceExtension = (
    render: (container: Element, source: string, context: MarkdownDocumentContext) => Promise<void>,
    dispose: (container: Element) => void | Promise<void> = () => undefined,
    capabilities: MarkdownExtensionCapability[] = [],
): MarkdownExtension => ({
    name: 'fixture',
    manifest: {
        name: 'fixture',
        description: 'Lifecycle fixture',
        dependencies: [],
        fences: [{ language: 'fixture', className: 'fixture' }],
        capabilities,
    },
    fences: [{ language: 'fixture', className: 'fixture', render, dispose }],
});

describe('Markdown document lifecycle', () => {
    it('disposes the previous document before updating the same session', async () => {
        const events: string[] = [];
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                fenceExtension(
                    async (container, source) => {
                        events.push(`render:${source}`);
                        container.textContent = source;
                    },
                    (container) => {
                        events.push(`dispose:${container.textContent}`);
                    },
                ),
            ],
        });
        const container = document.createElement('div');
        const session = await engine.renderDocument('```fixture\nfirst\n```', container);
        await session.update('```fixture\nsecond\n```');
        expect(events).toEqual(['render:first', 'dispose:first', 'render:second']);
        expect(container.querySelector('.fixture')?.textContent).toContain('second');
        await session.dispose();
        expect(events).toEqual(['render:first', 'dispose:first', 'render:second', 'dispose:second']);
        expect(container.childNodes).toHaveLength(0);
    });

    it('keeps the engine reusable after disposing only one container', async () => {
        const engine = new MarkdownEngine({ profile: 'core' });
        const first = document.createElement('div');
        const second = document.createElement('div');
        await engine.render('# First', first);
        await engine.render('# Second', second);
        await engine.dispose(first);
        expect(first.childNodes).toHaveLength(0);
        await engine.render('# Updated', second);
        expect(second.querySelector('h1')?.textContent).toBe('Updated');
        await engine.dispose();
    });

    it('navigates with the document resource service and updates the relative URL base', async () => {
        const requested: URL[] = [];
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        const context: MarkdownDocumentContext = {
            sourceUrl: new URL('https://example.test/course/index.md'),
            async fetchResource(url) {
                requested.push(url);
                return {
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Headers(),
                    text: async () => '# Lesson\n\n[Next](next.md)',
                } as Response;
            },
        };
        const session = await engine.renderDocument('# Index', container, context);
        await session.navigate('unit/lesson.md');
        expect(requested[0]?.href).toBe('https://example.test/course/unit/lesson.md');
        expect(session.sourceUrl?.href).toBe('https://example.test/course/unit/lesson.md');
        expect(container.querySelector('a')?.href).toBe('https://example.test/course/unit/next.md');
        await session.dispose();
    });

    it('preserves the current document when navigation fails', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Current lesson', container, {
            sourceUrl: new URL('https://example.test/course/current.md'),
            fetchResource: async () =>
                ({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    headers: new Headers(),
                }) as Response,
        });
        await expect(session.navigate('missing.md')).rejects.toThrow('404 Not Found');
        expect(container.querySelector('h1')?.textContent).toBe('Current lesson');
        expect(session.sourceUrl?.href).toBe('https://example.test/course/current.md');
        await session.dispose();
    });

    it('aborts an obsolete render and successfully renders the replacement', async () => {
        const sources: string[] = [];
        let started!: () => void;
        const hasStarted = new Promise<void>((resolve) => (started = resolve));
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                fenceExtension(async (container, source, context) => {
                    sources.push(source);
                    if (source === 'slow') {
                        started();
                        await new Promise<void>((resolve) => context.signal?.addEventListener('abort', () => resolve(), { once: true }));
                    }
                    if (!context.signal?.aborted) container.textContent = source;
                }),
            ],
        });
        const container = document.createElement('div');
        const first = engine.renderDocument('```fixture\nslow\n```', container);
        await hasStarted;
        await engine.render('```fixture\nreplacement\n```', container);
        await first;
        expect(sources).toEqual(['slow', 'replacement']);
        expect(container.querySelector('.fixture')?.textContent).toContain('replacement');
        await engine.dispose();
    });

    it('limits concurrent fence renders across a document', async () => {
        let active = 0;
        let peak = 0;
        const engine = new MarkdownEngine({
            profile: 'core',
            maxConcurrentRenders: 2,
            extensions: [
                fenceExtension(async () => {
                    active++;
                    peak = Math.max(peak, active);
                    await new Promise((resolve) => setTimeout(resolve, 5));
                    active--;
                }),
            ],
        });
        const container = document.createElement('div');
        await engine.render(Array.from({ length: 6 }, (_, index) => `\`\`\`fixture\n${index}\n\`\`\``).join('\n\n'), container);
        expect(peak).toBe(2);
        await engine.dispose();
    });

    it('defers a heavy extension until its element approaches the viewport', async () => {
        const callbacks: IntersectionObserverCallback[] = [];
        class ObserverMock {
            public constructor(callback: IntersectionObserverCallback) {
                callbacks.push(callback);
            }
            public observe(): void {}
            public disconnect(): void {}
            public unobserve(): void {}
            public takeRecords(): IntersectionObserverEntry[] {
                return [];
            }
            public readonly root = null;
            public readonly rootMargin = '300px';
            public readonly thresholds = [0];
        }
        const original = globalThis.IntersectionObserver;
        globalThis.IntersectionObserver = ObserverMock as unknown as typeof IntersectionObserver;
        try {
            let renders = 0;
            const engine = new MarkdownEngine({
                profile: 'core',
                extensions: [fenceExtension(async () => void renders++, undefined, ['interactive'])],
            });
            const container = document.createElement('div');
            await engine.render('```fixture\ninteractive\n```', container, { renderMode: 'visible' });
            expect(renders).toBe(0);
            const target = container.querySelector('.fixture')!;
            callbacks[0]?.([{ isIntersecting: true, target } as IntersectionObserverEntry], {} as IntersectionObserver);
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(renders).toBe(1);
            await engine.dispose();
        } finally {
            globalThis.IntersectionObserver = original;
        }
    });
});
