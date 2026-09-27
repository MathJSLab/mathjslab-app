/// <reference types="jest" />
import { MarkdownEngine } from '../../src/MarkdownEngine';
import { MarkdownDocumentController, type MarkdownControllerSnapshot } from '../../src/markdown/MarkdownDocumentController';
import { MarkdownDocumentModel } from '../../src/markdown/MarkdownDocumentModel';
import { TextEncoder } from 'node:util';

Object.assign(globalThis, { TextEncoder });

const sources = new Map([
    ['https://course.test/notes/index.md', '# Course\n\n[Vectors](vectors.md#sum)\n\n## Introduction'],
    ['https://course.test/notes/vectors.md', '# Vectors\n\n## Sum\n\n[Exercises](exercises.md)'],
    ['https://course.test/notes/exercises.md', '# Exercises'],
]);

const createFixture = (): { engine: MarkdownEngine; container: HTMLElement; model: MarkdownDocumentModel; requests: string[] } => {
    const requests: string[] = [];
    const model = new MarkdownDocumentModel(
        {
            version: 1,
            title: 'Course',
            baseUrl: './notes/',
            items: [
                { type: 'page', id: 'home', title: 'Home', source: 'index.md' },
                { type: 'page', id: 'vectors', title: 'Vectors', source: 'vectors.md' },
                { type: 'page', id: 'exercises', title: 'Exercises', source: 'exercises.md' },
            ],
        },
        'https://course.test/manifest.json',
    );
    const engine = new MarkdownEngine({ profile: 'gfm' });
    const container = document.createElement('article');
    return { engine, container, model, requests };
};

const fetchContext = (requests: string[]) => ({
    async fetchResource(url: URL) {
        requests.push(url.href);
        const source = sources.get(url.href.replace(/#.*$/, ''));
        return {
            ok: source !== undefined,
            status: source === undefined ? 404 : 200,
            statusText: source === undefined ? 'Not Found' : 'OK',
            headers: new Headers(),
            text: async () => source ?? '',
        } as Response;
    },
});

describe('Markdown document controller', () => {
    it('loads the initial page and publishes page and document summaries', async () => {
        const { engine, container, model, requests } = createFixture();
        const changes: MarkdownControllerSnapshot[] = [];
        const controller = await MarkdownDocumentController.create(engine, container, model, {
            context: fetchContext(requests),
            initialPage: 'home',
            onChange: (snapshot) => changes.push(snapshot),
        });
        expect(requests).toEqual(['https://course.test/notes/index.md']);
        expect(controller.snapshot.state).toBe('idle');
        expect(controller.snapshot.page?.id).toBe('home');
        expect(controller.snapshot.outline.map(({ title }) => title)).toEqual(['Course']);
        expect(controller.snapshot.outline[0]?.children[0]?.title).toBe('Introduction');
        expect(changes.at(0)?.state).toBe('loading');
        expect(changes.at(-1)?.state).toBe('idle');
        await controller.dispose();
        await engine.dispose();
    });

    it('keeps model, navigator and outline synchronized for clicks and history', async () => {
        const { engine, container, model, requests } = createFixture();
        const fragments: string[] = [];
        const controller = await MarkdownDocumentController.create(engine, container, model, {
            context: fetchContext(requests),
            navigation: { scrollToFragment: (fragment) => fragments.push(fragment) },
        });
        container.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(controller.snapshot.page?.id).toBe('vectors');
        expect(controller.snapshot.url?.hash).toBe('#sum');
        expect(controller.snapshot.outline[0]?.title).toBe('Vectors');
        expect(fragments).toEqual(['sum']);
        expect(controller.snapshot.canGoBack).toBe(true);
        await controller.back();
        expect(controller.snapshot.page?.id).toBe('home');
        expect(controller.snapshot.canGoForward).toBe(true);
        await controller.forward();
        expect(controller.snapshot.page?.id).toBe('vectors');
        await controller.dispose();
        await engine.dispose();
    });

    it('opens pages by id and by collection URL and rejects outside pages', async () => {
        const { engine, container, model, requests } = createFixture();
        const controller = await MarkdownDocumentController.create(engine, container, model, { context: fetchContext(requests) });
        await controller.open('exercises');
        expect(controller.snapshot.page?.id).toBe('exercises');
        await controller.open(new URL('https://course.test/notes/vectors.md#sum'));
        expect(controller.snapshot.page?.id).toBe('vectors');
        expect(controller.snapshot.url?.hash).toBe('#sum');
        await expect(controller.open('https://outside.test/page.md')).rejects.toThrow('not part of the collection');
        expect(controller.snapshot.page?.id).toBe('vectors');
        await controller.dispose();
        await engine.dispose();
    });

    it('keeps the active page after a load failure and exposes the error', async () => {
        const { engine, container, model, requests } = createFixture();
        sources.delete('https://course.test/notes/exercises.md');
        try {
            const controller = await MarkdownDocumentController.create(engine, container, model, { context: fetchContext(requests) });
            await expect(controller.open('exercises')).rejects.toThrow('404 Not Found');
            expect(controller.snapshot.state).toBe('error');
            expect(controller.snapshot.page?.id).toBe('home');
            expect(controller.snapshot.url?.pathname).toBe('/notes/index.md');
            expect(controller.snapshot.targetUrl?.pathname).toBe('/notes/exercises.md');
            expect(container.querySelector('h1')?.textContent).toBe('Course');
            await controller.dispose();
        } finally {
            sources.set('https://course.test/notes/exercises.md', '# Exercises');
            await engine.dispose();
        }
    });

    it('supports subscriptions and releases the owned document on disposal', async () => {
        const { engine, container, model, requests } = createFixture();
        const controller = new MarkdownDocumentController(engine, container, model, { context: fetchContext(requests) });
        const states: string[] = [];
        const unsubscribe = controller.subscribe(({ state }) => states.push(state));
        await controller.initialize('home#introduction');
        unsubscribe();
        await controller.open('vectors');
        expect(states).toContain('uninitialized');
        expect(states).toContain('loading');
        expect(states).toContain('idle');
        await controller.dispose();
        expect(controller.snapshot.state).toBe('disposed');
        expect(container.childNodes).toHaveLength(0);
        await expect(controller.open('home')).rejects.toThrow('disposed');
        await engine.dispose();
    });
});
