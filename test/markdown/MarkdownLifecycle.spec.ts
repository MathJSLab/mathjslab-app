/// <reference types="jest" />
import { MarkdownEngine, type MarkdownDocument, type MarkdownDocumentContext, type MarkdownExtension, type MarkdownExtensionCapability } from '../../src/MarkdownEngine';
import { TextEncoder } from 'node:util';
import { jest } from '@jest/globals';

Object.assign(globalThis, { TextEncoder });

const deferred = <T = void>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    const promise = new Promise<T>((done) => (resolve = done));
    return { promise, resolve };
};

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
    it('disposes a session once when an abort listener reenters dispose', async () => {
        let disposals = 0;
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                fenceExtension(
                    async () => undefined,
                    async () => {
                        disposals++;
                        await Promise.resolve();
                    },
                ),
            ],
        });
        const session = await engine.renderDocument('```fixture\nresource\n```', document.createElement('div'));
        let reentered!: Promise<void>;
        session.signal.addEventListener(
            'abort',
            () => {
                reentered = session.dispose();
            },
            { once: true },
        );
        const disposal = session.dispose();
        await Promise.all([disposal, reentered]);
        expect(disposals).toBe(1);
        await engine.dispose();
    });

    it('disposes extensions once when an abort listener reenters engine disposal', async () => {
        let disposals = 0;
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                {
                    name: 'fixture',
                    dispose: () => {
                        disposals++;
                    },
                },
            ],
        });
        const session = await engine.renderDocument('# Initial', document.createElement('div'));
        let reentered!: Promise<void>;
        session.signal.addEventListener(
            'abort',
            () => {
                reentered = engine.dispose();
            },
            { once: true },
        );
        const disposal = engine.dispose();
        await Promise.all([disposal, reentered]);
        expect(disposals).toBe(1);
    });

    it('keeps a replacement requested by an abort listener as the latest document', async () => {
        const engine = new MarkdownEngine({ profile: 'core' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Initial', container);
        let latest!: Promise<MarkdownDocument>;
        session.signal.addEventListener(
            'abort',
            () => {
                latest = engine.renderDocument('# Latest', container);
            },
            { once: true },
        );
        const obsolete = engine.renderDocument('# Obsolete', container);
        const [oldDocument, current] = await Promise.all([obsolete, latest]);
        expect(oldDocument.disposed).toBe(true);
        expect(current.disposed).toBe(false);
        expect(container.textContent).toContain('Latest');
        await engine.dispose();
    });
    it('releases queued rendering references when disposing an engine used without sessions', async () => {
        const started = deferred();
        const release = deferred();
        const rendered: string[] = [];
        const engine = new MarkdownEngine({
            profile: 'core',
            maxConcurrentRenders: 1,
            extensions: [
                fenceExtension(async (_container, source) => {
                    rendered.push(source);
                    if (source === 'blocking') {
                        started.resolve();
                        await release.promise;
                    }
                }),
            ],
        });
        const first = document.createElement('div');
        const second = document.createElement('div');
        first.innerHTML = engine.parse('```fixture\nblocking\n```');
        second.innerHTML = engine.parse('```fixture\nqueued\n```');
        const active = engine.typeset(first);
        await started.promise;
        const queued = engine.typeset(second);
        await new Promise((resolve) => setTimeout(resolve, 0));
        const disposal = engine.dispose();
        await queued;
        release.resolve();
        await Promise.all([active, disposal]);
        expect(rendered).toEqual(['blocking']);
        // Instrument the ownership registry: settled queue entries must not retain DOM nodes.
        expect((engine as unknown as { renderings: Map<Element, Promise<void>> }).renderings.size).toBe(0);
    });

    it('does not create a visibility observer after disposal during a prepare hook', async () => {
        const started = deferred();
        const release = deferred();
        const original = globalThis.IntersectionObserver;
        let observers = 0;
        Object.assign(globalThis, {
            IntersectionObserver: class {
                public observe(): void {
                    observers++;
                }
                public disconnect(): void {
                    observers--;
                }
            },
        });
        try {
            const extension = fenceExtension(async () => undefined, undefined, ['interactive']);
            extension.prepare = async () => {
                started.resolve();
                await release.promise;
            };
            const engine = new MarkdownEngine({ profile: 'core', extensions: [extension] });
            const container = document.createElement('div');
            container.innerHTML = engine.parse('```fixture\nqueued\n```');
            const rendering = engine.typeset(container, { renderMode: 'visible' });
            await started.promise;
            const disposal = engine.dispose();
            release.resolve();
            await Promise.all([rendering, disposal]);
            expect(observers).toBe(0);
        } finally {
            Object.assign(globalThis, { IntersectionObserver: original });
        }
    });
    it('revokes only the disposed document object URLs on a shared engine', async () => {
        const createObjectURL = URL.createObjectURL;
        const revokeObjectURL = URL.revokeObjectURL;
        let sequence = 0;
        const revoked: string[] = [];
        Object.assign(URL, { createObjectURL: () => `blob:fixture-${++sequence}`, revokeObjectURL: (url: string) => revoked.push(url) });
        try {
            const services = new Set<MarkdownDocumentContext['resources']>();
            const engine = new MarkdownEngine({
                profile: 'core',
                extensions: [
                    fenceExtension(async (_container, _source, context) => {
                        services.add(context.resources);
                        context.resources!.createObjectURL(new Blob(['resource']));
                    }),
                ],
            });
            const first = await engine.renderDocument('```fixture\nfirst\n```', document.createElement('div'));
            const second = await engine.renderDocument('```fixture\nsecond\n```', document.createElement('div'));
            expect(services.size).toBe(2);
            expect(first.signal).not.toBe(second.signal);
            await Promise.all([first.dispose(), first.dispose()]);
            expect(revoked).toEqual(['blob:fixture-1']);
            expect(second.disposed).toBe(false);
            await engine.dispose();
            expect(revoked).toEqual(['blob:fixture-1', 'blob:fixture-2']);
        } finally {
            Object.assign(URL, { createObjectURL, revokeObjectURL });
        }
    });
    it('retries an initially aborted document without reusing its aborted signal', async () => {
        const engine = new MarkdownEngine({ profile: 'core' });
        const container = document.createElement('div');
        const abort = new AbortController();
        abort.abort();
        const session = await engine.renderDocument('# Aborted', container, { signal: abort.signal });
        await session.update('# Retry');
        expect(container.textContent).toContain('Retry');
        await engine.dispose();
    });
    it('cleans partial extension resources after failure and retries in the same container', async () => {
        const resources = new Set<Element>();
        let fail = true;
        let disposals = 0;
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                fenceExtension(
                    async (container, source) => {
                        resources.add(container);
                        if (fail) throw new Error('Partial failure');
                        container.textContent = source;
                    },
                    (container) => {
                        resources.delete(container);
                        disposals++;
                    },
                ),
            ],
        });
        const container = document.createElement('div');
        await expect(engine.render('```fixture\nfirst\n```', container)).rejects.toThrow('Partial failure');
        expect(resources.size).toBe(0);
        fail = false;
        await engine.render('```fixture\nretry\n```', container);
        expect(container.textContent).toContain('retry');
        expect(resources.size).toBe(1);
        await engine.dispose();
        expect(resources.size).toBe(0);
        expect(disposals).toBe(2);
    });

    it('ignores a stale navigation response and permits retry after abort', async () => {
        const response = deferred<string>();
        const started = deferred();
        const engine = new MarkdownEngine({ profile: 'core' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Initial', container, {
            sourceUrl: new URL('https://example.test/initial.md'),
            fetchResource: async () => {
                started.resolve();
                return { ok: true, headers: new Headers(), text: () => response.promise } as Response;
            },
        });
        const navigation = session.navigate('stale.md');
        await started.promise;
        const update = session.update('# Current');
        response.resolve('# Stale');
        await Promise.all([navigation, update]);
        expect(container.textContent).toContain('Current');
        expect(session.sourceUrl?.pathname).toBe('/initial.md');
        const abort = new AbortController();
        abort.abort();
        await session.update('# Aborted', { signal: abort.signal });
        await session.update('# Retry');
        expect(container.textContent).toContain('Retry');
        await engine.dispose();
    });

    it('blocks new documents as soon as engine disposal starts and disposes extensions once', async () => {
        const started = deferred();
        const release = deferred();
        let disposals = 0;
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                {
                    name: 'fixture',
                    dispose: async () => {
                        disposals++;
                        started.resolve();
                        await release.promise;
                    },
                },
            ],
        });
        const first = engine.dispose();
        await started.promise;
        const second = engine.dispose();
        await expect(engine.renderDocument('# Late', document.createElement('div'))).rejects.toThrow('disposed');
        release.resolve();
        await Promise.all([first, second]);
        expect(disposals).toBe(1);
    });

    it('does not publish HTML from an update superseded during renderHTML', async () => {
        const engine = new MarkdownEngine({ profile: 'core' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Initial', container);
        const started = deferred();
        const html = deferred<string>();
        const renderHTML = engine.renderHTML.bind(engine);
        engine.renderHTML = async (source, context) => {
            if (source !== '# Stale') return renderHTML(source, context);
            started.resolve();
            return html.promise;
        };
        const published: string[] = [];
        const observer = new MutationObserver(() => published.push(container.textContent ?? ''));
        observer.observe(container, { childList: true, subtree: true });
        const stale = session.update('# Stale');
        await started.promise;
        const current = session.update('# Current');
        html.resolve('<h1>Stale</h1>');
        await Promise.all([stale, current]);
        observer.disconnect();
        expect(published.some((text) => text.includes('Stale'))).toBe(false);
        expect(container.textContent).toContain('Current');
        await engine.dispose();
    });

    it('reserves the container synchronously for the newest renderDocument', async () => {
        const engine = new MarkdownEngine({ profile: 'core' });
        const container = document.createElement('div');
        await engine.renderDocument('# Initial', container);
        const first = engine.renderDocument('# Obsolete', container);
        const second = engine.renderDocument('# Current', container);
        const [obsolete, current] = await Promise.all([first, second]);
        expect(obsolete.disposed).toBe(true);
        expect(current.disposed).toBe(false);
        expect(container.textContent).toContain('Current');
        await engine.dispose();
    });

    it('settles aborted queued work without waiting for another document', async () => {
        const started = deferred();
        const release = deferred();
        const renders: string[] = [];
        const engine = new MarkdownEngine({
            profile: 'core',
            maxConcurrentRenders: 1,
            extensions: [
                fenceExtension(async (_container, source) => {
                    renders.push(source);
                    if (source === 'blocking') {
                        started.resolve();
                        await release.promise;
                    }
                }),
            ],
        });
        const first = engine.renderDocument('```fixture\nblocking\n```', document.createElement('div'));
        await started.promise;
        const abort = new AbortController();
        let settled = false;
        const second = engine.renderDocument('```fixture\nqueued\n```', document.createElement('div'), { signal: abort.signal }).then(() => {
            settled = true;
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
        abort.abort();
        await new Promise((resolve) => setTimeout(resolve, 0));
        const settledBeforeRelease = settled;
        release.resolve();
        await Promise.all([first, second]);
        await engine.dispose();
        expect(settledBeforeRelease).toBe(true);
        expect(renders).toEqual(['blocking']);
    });

    it('waits for the same session cleanup on concurrent dispose calls', async () => {
        const started = deferred();
        const release = deferred();
        let disposals = 0;
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                fenceExtension(
                    async () => undefined,
                    async () => {
                        disposals++;
                        started.resolve();
                        await release.promise;
                    },
                ),
            ],
        });
        const container = document.createElement('div');
        const session = await engine.renderDocument('```fixture\nresource\n```', container);
        const first = session.dispose();
        await started.promise;
        let settled = false;
        const second = session.dispose().then(() => {
            settled = true;
        });
        await Promise.resolve();
        const settledBeforeRelease = settled;
        release.resolve();
        await Promise.all([first, second]);
        expect(settledBeforeRelease).toBe(false);
        expect(disposals).toBe(1);
        expect(container.childNodes).toHaveLength(0);
        await engine.dispose();
    });

    it('ignores observer callbacks delivered after container disposal', async () => {
        let callback!: IntersectionObserverCallback;
        const original = globalThis.IntersectionObserver;
        const disconnect = jest.fn();
        Object.assign(globalThis, {
            IntersectionObserver: class {
                public constructor(handler: IntersectionObserverCallback) {
                    callback = handler;
                }
                public observe(): void {}
                public disconnect = disconnect;
            },
        });
        try {
            const render = jest.fn(async () => undefined);
            const engine = new MarkdownEngine({ profile: 'core', extensions: [fenceExtension(render, undefined, ['interactive'])] });
            const container = document.createElement('div');
            container.innerHTML = engine.parse('```fixture\nresource\n```');
            await engine.typeset(container, { renderMode: 'visible' });
            const target = container.querySelector('.fixture')!;
            await engine.dispose(container);
            callback([{ target, isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(render).not.toHaveBeenCalled();
            expect(disconnect).toHaveBeenCalled();
            await engine.dispose();
        } finally {
            Object.assign(globalThis, { IntersectionObserver: original });
        }
    });

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
