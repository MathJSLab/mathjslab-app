/// <reference types="jest" />
import { MarkdownEngine } from '../../src/MarkdownEngine';
import { MarkdownDocumentElement, type MarkdownDocumentReadyDetail } from '../../src/markdown-component-register';
import type { MarkdownCollectionManifest } from '../../src/markdown/MarkdownDocumentModel';
import { TextEncoder } from 'node:util';

Object.assign(globalThis, { TextEncoder });

const ready = (element: MarkdownDocumentElement): Promise<MarkdownDocumentReadyDetail> =>
    new Promise((resolve) => element.addEventListener('markdown-ready', (event) => resolve((event as CustomEvent<MarkdownDocumentReadyDetail>).detail), { once: true }));

describe('<markdown-document>', () => {
    afterEach(() => document.body.replaceChildren());

    it('cancels a queued property load when explicitly disposed before the microtask', async () => {
        const element = new MarkdownDocumentElement();
        element.engine = new MarkdownEngine({ profile: 'core' });
        document.body.append(element);
        element.markdown = '# Cancelled';
        await element.dispose();
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(element.state).toBe('empty');
        expect(element.documentSession).toBeUndefined();
        expect(element.shadowRoot?.querySelector('[part="content"]')?.textContent).toBe('');
        await element.engine.dispose();
    });

    it('creates a fresh session when disconnected and immediately reconnected', async () => {
        const element = new MarkdownDocumentElement();
        element.engine = new MarkdownEngine({ profile: 'core' });
        element.markdown = '# Initial';
        const firstReady = ready(element);
        document.body.append(element);
        await firstReady;
        const first = element.documentSession!;
        element.remove();
        element.markdown = '# Reconnected';
        const nextReady = ready(element);
        document.body.append(element);
        await nextReady;
        expect(first.disposed).toBe(true);
        expect(element.documentSession).not.toBe(first);
        expect(element.documentSession?.disposed).toBe(false);
        expect(element.shadowRoot?.querySelector('h1')?.textContent).toBe('Reconnected');
        await element.dispose();
        await element.engine.dispose();
    });

    it('renders Markdown supplied through the markdown property in Shadow DOM', async () => {
        const element = new MarkdownDocumentElement();
        element.engine = new MarkdownEngine({ profile: 'gfm' });
        element.markdown = '# Lesson\n\n**Content**';
        const completed = ready(element);
        document.body.append(element);
        const detail = await completed;
        expect(element.state).toBe('ready');
        expect(element.getAttribute('aria-busy')).toBe('false');
        expect(element.shadowRoot?.querySelector('h1')?.textContent).toBe('Lesson');
        expect(element.shadowRoot?.querySelector('strong')?.textContent).toBe('Content');
        expect(detail.document).toBe(element.documentSession);
        await element.dispose();
        await element.engine.dispose();
    });

    it('loads src with the shared context and keeps links navigable in the container', async () => {
        const requested: string[] = [];
        const element = new MarkdownDocumentElement();
        element.engine = new MarkdownEngine({ profile: 'gfm' });
        element.context = {
            fetchResource: async (url) => {
                requested.push(url.href);
                const text = url.pathname.endsWith('index.md') ? '# Index\n\n[Next](next.md)' : '# Next';
                return { ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => text } as Response;
            },
        };
        element.src = 'https://course.test/index.md';
        const completed = ready(element);
        document.body.append(element);
        await completed;
        const navigated = new Promise<URL>((resolve) => element.addEventListener('markdown-navigate', (event) => resolve((event as CustomEvent<{ url: URL }>).detail.url), { once: true }));
        element.shadowRoot?.querySelector('a')?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, button: 0 }));
        expect((await navigated).href).toBe('https://course.test/next.md');
        expect(element.shadowRoot?.querySelector('h1')?.textContent).toBe('Next');
        expect(requested).toEqual(['https://course.test/index.md', 'https://course.test/next.md']);
        await element.dispose();
        await element.engine.dispose();
    });

    it('forwards structured engine diagnostics as composed events and preserves the host callback', async () => {
        const callbacks: unknown[] = [];
        const events: CustomEvent[] = [];
        const engine = new MarkdownEngine({
            profile: 'core',
            securityMode: 'strict',
            extensions: [
                {
                    name: 'diagnostic-fixture',
                    manifest: {
                        name: 'diagnostic-fixture',
                        description: '',
                        dependencies: [],
                        fences: [{ language: 'diagnostic-fixture', className: 'diagnostic-fixture' }],
                        capabilities: ['network'],
                    },
                    fences: [{ language: 'diagnostic-fixture', className: 'diagnostic-fixture', render: async () => undefined }],
                },
            ],
        });
        const element = new MarkdownDocumentElement();
        element.engine = engine;
        element.context = { sourceUrl: new URL('https://course.test/lesson.md'), onDiagnostic: (diagnostic) => callbacks.push(diagnostic) };
        element.markdown = '# Lesson\n\n```diagnostic-fixture\ncontent\n```';
        element.addEventListener('markdown-diagnostic', (event) => events.push(event as CustomEvent));
        const completed = ready(element);
        document.body.append(element);
        await completed;

        expect(callbacks).toHaveLength(1);
        expect(events).toHaveLength(1);
        expect(events[0]?.bubbles).toBe(true);
        expect(events[0]?.composed).toBe(true);
        expect(events[0]?.detail).toMatchObject({
            code: 'extension-capability-blocked',
            category: 'policy',
            line: 3,
            sourceUrl: new URL('https://course.test/lesson.md'),
        });
        expect(events[0]?.detail).toEqual(callbacks[0]);
        await element.dispose();
        await engine.dispose();
    });

    it('emits a structured document diagnostic when loading fails', async () => {
        const element = new MarkdownDocumentElement();
        element.context = {
            fetchResource: async () => {
                throw new Error('offline');
            },
        };
        element.src = 'https://course.test/broken.md';
        const diagnostics: CustomEvent[] = [];
        element.addEventListener('markdown-diagnostic', (event) => diagnostics.push(event as CustomEvent));
        const failed = new Promise<void>((resolve) => element.addEventListener('markdown-error', () => resolve(), { once: true }));
        document.body.append(element);
        await failed;
        expect(diagnostics.map(({ detail }) => detail.code)).toEqual(['resource-load-error', 'document-load-error']);
        expect(diagnostics[0]?.detail).toMatchObject({ category: 'network', sourceUrl: new URL('https://course.test/broken.md') });
        expect(diagnostics[1]?.detail).toMatchObject({ category: 'document', severity: 'error', sourceUrl: new URL('https://course.test/broken.md') });
        await element.dispose();
        await element.engine.dispose();
    });

    it('reports navigation failures with the target URL and navigation category', async () => {
        const element = new MarkdownDocumentElement();
        const engine = new MarkdownEngine({ profile: 'core' });
        element.engine = engine;
        element.context = {
            fetchResource: async (url) => {
                if (url.pathname === '/index.md') return { ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => '# Index\n\n[Next](next.md)' } as Response;
                throw new Error('offline');
            },
        };
        element.src = 'https://course.test/index.md';
        const completed = ready(element);
        document.body.append(element);
        await completed;
        const diagnostic = new Promise<CustomEvent>((resolve) => {
            const listener = (event: Event): void => {
                const customEvent = event as CustomEvent<{ code?: string }>;
                if (customEvent.detail.code !== 'document-navigation-error') return;
                element.removeEventListener('markdown-diagnostic', listener);
                resolve(customEvent);
            };
            element.addEventListener('markdown-diagnostic', listener);
        });
        element.shadowRoot?.querySelector('a')?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, button: 0 }));

        expect((await diagnostic).detail).toMatchObject({
            code: 'document-navigation-error',
            category: 'navigation',
            sourceUrl: new URL('https://course.test/next.md'),
        });
        await element.dispose();
        await engine.dispose();
    });

    it('creates a document controller when supplied with a collection manifest', async () => {
        const manifest: MarkdownCollectionManifest = {
            version: 1,
            title: 'Course',
            baseUrl: 'https://course.test/',
            items: [
                { type: 'page', id: 'first', title: 'First', source: 'first.md' },
                { type: 'page', id: 'second', title: 'Second', source: 'second.md' },
            ],
        };
        const element = new MarkdownDocumentElement();
        element.engine = new MarkdownEngine({ profile: 'gfm' });
        element.context = {
            fetchResource: async (url) => ({ ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => `# ${url.pathname}` }) as Response,
        };
        element.manifest = manifest;
        element.setAttribute('initial-page', 'second');
        const completed = ready(element);
        document.body.append(element);
        const detail = await completed;
        expect(detail.controller).toBe(element.controller);
        expect(detail.model).toBe(element.model);
        expect(element.controller?.snapshot.page?.id).toBe('second');
        expect(element.shadowRoot?.querySelector('h1')?.textContent).toBe('/second.md');
        const collection = element.shadowRoot!.querySelector('[part="collection"]')!;
        expect(collection.querySelectorAll('[data-page-id]')).toHaveLength(2);
        expect(collection.querySelector('[aria-current="page"]')?.textContent).toBe('Second');
        expect(element.shadowRoot?.querySelector('[data-action="previous"]')?.textContent).toContain('First');

        const changedPage = new Promise((resolve) => element.addEventListener('markdown-navigate', resolve, { once: true }));
        element.shadowRoot?.querySelector<HTMLElement>('[data-action="previous"]')?.click();
        await changedPage;
        expect(element.controller?.snapshot.page?.id).toBe('first');
        expect(collection.querySelector('[aria-current="page"]')?.textContent).toBe('First');
        expect(element.shadowRoot?.querySelector('[data-action="next"]')?.textContent).toContain('Second');

        const returned = new Promise((resolve) => element.addEventListener('markdown-navigate', resolve, { once: true }));
        element.shadowRoot?.querySelector<HTMLElement>('[data-action="back"]')?.click();
        await returned;
        expect(element.controller?.snapshot.page?.id).toBe('second');
        await element.dispose();
        await element.engine.dispose();
    });

    it('renders the page outline and marks the selected section', async () => {
        const element = new MarkdownDocumentElement();
        element.engine = new MarkdownEngine({ profile: 'gfm' });
        element.markdown = '# Lesson\n\n## First section\n\n## Second section';
        const completed = ready(element);
        document.body.append(element);
        await completed;
        const outline = element.shadowRoot!.querySelector('[part="page-outline"]')!;
        expect(outline.querySelectorAll('[data-fragment]')).toHaveLength(3);
        element.shadowRoot?.querySelector<HTMLElement>('[data-fragment="second-section"]')?.click();
        expect(outline.querySelector('[aria-current="location"]')?.textContent).toBe('Second section');
        expect(element.hasAttribute('has-navigation')).toBe(true);
        await element.dispose();
        await element.engine.dispose();
    });

    it('applies attribute security settings and exposes empty and error states', async () => {
        const element = new MarkdownDocumentElement();
        element.engine = new MarkdownEngine({ profile: 'core' });
        document.body.append(element);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(element.state).toBe('empty');
        expect(element.shadowRoot?.querySelector('[part="status"]')?.textContent).toContain('No Markdown');

        element.setAttribute('security', 'strict');
        element.markdown = '<section>Raw</section>\n\n**Safe**';
        await ready(element);
        expect(element.shadowRoot?.querySelector('section section')).toBeNull();
        expect(element.shadowRoot?.querySelector('strong')?.textContent).toBe('Safe');

        const failed = new Promise((resolve) => element.addEventListener('markdown-error', resolve, { once: true }));
        element.markdown = undefined;
        element.src = 'https://course.test/missing.md';
        element.context = {
            fetchResource: async () => ({ ok: false, status: 404, statusText: 'Not Found', headers: new Headers() }) as Response,
        };
        await failed;
        expect(element.state).toBe('error');
        expect(element.shadowRoot?.querySelector('[part="status"]')?.textContent).toContain('404 Not Found');
        await element.dispose();
        await element.engine.dispose();
    });

    it('defines the custom element only once and releases rendering when disconnected', async () => {
        expect(customElements.get('markdown-document')).toBe(MarkdownDocumentElement);
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const element = document.createElement('markdown-document');
        element.engine = engine;
        element.markdown = '# Temporary';
        const completed = ready(element);
        document.body.append(element);
        await completed;
        element.remove();
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(element.documentSession).toBeUndefined();
        await engine.dispose();
    });

    it('localizes controls, exposes shortcuts, moves within navigation lists and focuses a new page', async () => {
        const manifest: MarkdownCollectionManifest = {
            version: 1,
            title: 'Curso',
            baseUrl: 'https://course.test/',
            items: [
                { type: 'page', id: 'first', title: 'Primeira', source: 'first.md' },
                { type: 'page', id: 'second', title: 'Segunda', source: 'second.md' },
            ],
        };
        const element = new MarkdownDocumentElement();
        element.engine = new MarkdownEngine({ profile: 'gfm' });
        element.context = {
            fetchResource: async (url) => ({ ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => `# ${url.pathname}\n\n## Seção` }) as Response,
        };
        element.setAttribute('locale', 'pt');
        element.manifest = manifest;
        const completed = ready(element);
        document.body.append(element);
        await completed;

        const shadow = element.shadowRoot!;
        expect(shadow.querySelector('[data-action="back"]')?.textContent).toBe('Voltar');
        expect(shadow.querySelector('[part="page-outline"]')?.getAttribute('aria-label')).toBe('Nesta página');
        expect(shadow.querySelector('[data-action="next"]')?.textContent).toBe('Próxima: Segunda');
        expect(shadow.querySelector('[data-action="next"]')?.getAttribute('aria-keyshortcuts')).toBe('Alt+PageDown');

        const pageLinks = Array.from(shadow.querySelectorAll<HTMLElement>('[data-page-id]'));
        pageLinks[0]?.focus();
        pageLinks[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true, cancelable: true }));
        expect(shadow.activeElement).toBe(pageLinks[1]);

        const navigated = new Promise((resolve) => element.addEventListener('markdown-navigate', resolve, { once: true }));
        pageLinks[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', altKey: true, bubbles: true, composed: true, cancelable: true }));
        await navigated;
        await Promise.resolve();
        expect(element.controller?.snapshot.page?.id).toBe('second');
        expect(shadow.activeElement).toBe(shadow.querySelector('[part="content"] h1'));
        expect(shadow.querySelector('[part="announcer"]')?.textContent).toBe('Carregado: Segunda');
        await element.dispose();
        await element.engine.dispose();
    });

    it('tracks the visible heading without changing document history', async () => {
        let callback: IntersectionObserverCallback | undefined;
        const original = globalThis.IntersectionObserver;
        class TestIntersectionObserver {
            public constructor(handler: IntersectionObserverCallback) {
                callback = handler;
            }
            public observe(): void {}
            public unobserve(): void {}
            public disconnect(): void {}
            public takeRecords(): IntersectionObserverEntry[] {
                return [];
            }
            public readonly root = null;
            public readonly rootMargin = '';
            public readonly thresholds = [0];
        }
        Object.assign(globalThis, { IntersectionObserver: TestIntersectionObserver });
        try {
            const element = new MarkdownDocumentElement();
            element.engine = new MarkdownEngine({ profile: 'gfm' });
            element.markdown = '# Lesson\n\n## First\n\n## Second';
            const completed = ready(element);
            document.body.append(element);
            await completed;
            const heading = element.shadowRoot!.querySelector<HTMLElement>('#second')!;
            callback?.([{ target: heading, isIntersecting: true, boundingClientRect: { top: 5 } } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
            await Promise.resolve();
            expect(element.shadowRoot?.querySelector('[aria-current="location"]')?.textContent).toBe('Second');
            expect(element.shadowRoot?.querySelector('[part="announcer"]')?.textContent).toBe('Section Second');
            await element.dispose();
            await element.engine.dispose();
        } finally {
            Object.assign(globalThis, { IntersectionObserver: original });
        }
    });

    it('uses instant scrolling when reduced motion is requested', async () => {
        const original = globalThis.matchMedia;
        Object.assign(globalThis, { matchMedia: () => ({ matches: true }) });
        try {
            const element = new MarkdownDocumentElement();
            element.engine = new MarkdownEngine({ profile: 'gfm' });
            element.markdown = '# Lesson\n\n## Target';
            const completed = ready(element);
            document.body.append(element);
            await completed;
            const heading = element.shadowRoot!.querySelector<HTMLElement>('#target')!;
            const calls: ScrollIntoViewOptions[] = [];
            heading.scrollIntoView = (options?: boolean | ScrollIntoViewOptions) => {
                if (typeof options === 'object') calls.push(options);
            };
            element.shadowRoot?.querySelector<HTMLElement>('[data-fragment="target"]')?.click();
            expect(calls).toContainEqual({ block: 'start', behavior: 'auto' });
            await element.dispose();
            await element.engine.dispose();
        } finally {
            Object.assign(globalThis, { matchMedia: original });
        }
    });
});
