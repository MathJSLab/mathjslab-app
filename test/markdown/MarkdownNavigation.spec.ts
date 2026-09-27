/// <reference types="jest" />
import { MarkdownEngine } from '../../src/MarkdownEngine';
import { MarkdownNavigator, type MarkdownNavigationChange } from '../../src/markdown/MarkdownNavigator';
import { TextEncoder } from 'node:util';

Object.assign(globalThis, { TextEncoder });

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe('Markdown document navigation', () => {
    it('intercepts local Markdown links and keeps ordinary web links untouched', async () => {
        const requested: string[] = [];
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('[Lesson](lesson.md) [Website](https://outside.test/page)', container, {
            sourceUrl: new URL('https://course.test/index.md'),
            fetchResource: async (url) => {
                requested.push(url.href);
                return { ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => '# Lesson' } as Response;
            },
        });
        const navigator = new MarkdownNavigator(session);
        const links = container.querySelectorAll('a');
        const local = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
        links[0]!.dispatchEvent(local);
        await settle();
        expect(local.defaultPrevented).toBe(true);
        expect(requested).toEqual(['https://course.test/lesson.md']);
        expect(container.querySelector('h1')?.textContent).toBe('Lesson');

        await session.update('[Website](https://outside.test/page)');
        const external = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
        let preventedByNavigator = true;
        container.addEventListener(
            'click',
            (event) => {
                preventedByNavigator = event.defaultPrevented;
                event.preventDefault();
            },
            { once: true },
        );
        container.querySelector('a')!.dispatchEvent(external);
        expect(preventedByNavigator).toBe(false);
        navigator.dispose();
        await session.dispose();
    });

    it('moves to same-document fragments without fetching the document again', async () => {
        let requests = 0;
        const fragments: string[] = [];
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Contents\n\n[Details](#details)\n\n## Details', container, {
            sourceUrl: new URL('https://course.test/lesson.md'),
            fetchResource: async () => {
                requests++;
                throw new Error('Unexpected fetch');
            },
        });
        const navigator = new MarkdownNavigator(session, { scrollToFragment: (fragment, target) => fragments.push(`${fragment}:${target?.id}`) });
        container.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
        await settle();
        expect(requests).toBe(0);
        expect(fragments).toEqual(['details:details']);
        expect(navigator.current?.url.hash).toBe('#details');
        navigator.dispose();
        await session.dispose();
    });

    it('supports back, forward and truncation of forward history', async () => {
        const sources = new Map([
            ['https://course.test/one.md', '# One'],
            ['https://course.test/two.md', '# Two'],
            ['https://course.test/three.md', '# Three'],
        ]);
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Index', container, {
            sourceUrl: new URL('https://course.test/index.md'),
            fetchResource: async (url) => ({ ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => sources.get(url.href)! }) as Response,
        });
        const navigator = new MarkdownNavigator(session);
        await navigator.navigate('one.md');
        await navigator.navigate('two.md');
        expect(await navigator.back()).toBe(true);
        expect(container.querySelector('h1')?.textContent).toBe('One');
        expect(await navigator.forward()).toBe(true);
        expect(container.querySelector('h1')?.textContent).toBe('Two');
        await navigator.back();
        await navigator.navigate('three.md');
        expect(navigator.canGoForward).toBe(false);
        expect(navigator.history.map(({ url }) => url.pathname)).toEqual(['/index.md', '/one.md', '/three.md']);
        navigator.dispose();
        await session.dispose();
    });

    it('does not change history when loading fails and reports the error state', async () => {
        const changes: MarkdownNavigationChange[] = [];
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Current', container, {
            sourceUrl: new URL('https://course.test/index.md'),
            fetchResource: async () => ({ ok: false, status: 404, statusText: 'Not Found', headers: new Headers() }) as Response,
        });
        const navigator = new MarkdownNavigator(session, { onStateChange: (change) => changes.push(change) });
        await expect(navigator.navigate('missing.md')).rejects.toThrow('404 Not Found');
        expect(navigator.history).toHaveLength(1);
        expect(navigator.current?.url.pathname).toBe('/index.md');
        expect(navigator.navigationState).toBe('error');
        expect(changes.map(({ state }) => state)).toEqual(['loading', 'error']);
        expect(container.querySelector('h1')?.textContent).toBe('Current');
        navigator.dispose();
        await session.dispose();
    });

    it('commits only the latest navigation when an earlier request is superseded', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        let releaseSlow!: () => void;
        const slow = new Promise<void>((resolve) => (releaseSlow = resolve));
        const session = await engine.renderDocument('# Index', container, {
            sourceUrl: new URL('https://course.test/index.md'),
            async fetchResource(url, init) {
                if (url.pathname === '/slow.md') {
                    await Promise.race([slow, new Promise<void>((resolve) => init.signal?.addEventListener('abort', () => resolve(), { once: true }))]);
                }
                return { ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => `# ${url.pathname}` } as Response;
            },
        });
        const navigator = new MarkdownNavigator(session);
        const obsolete = navigator.navigate('slow.md');
        await settle();
        await navigator.navigate('latest.md');
        releaseSlow();
        await obsolete;
        expect(container.querySelector('h1')?.textContent).toBe('/latest.md');
        expect(navigator.history.map(({ url }) => url.pathname)).toEqual(['/index.md', '/latest.md']);
        navigator.dispose();
        await session.dispose();
    });

    it('honors modified clicks, download links and explicit targets', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('[Link](next.md)', container, { sourceUrl: new URL('https://course.test/index.md') });
        const navigator = new MarkdownNavigator(session);
        const anchor = container.querySelector('a')!;
        const preserveBrowserBehavior = (): void => {
            container.addEventListener('click', (event) => event.preventDefault(), { once: true });
        };
        for (const event of [
            new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true }),
            new MouseEvent('click', { bubbles: true, cancelable: true, button: 1 }),
        ]) {
            let preventedByNavigator = true;
            container.addEventListener(
                'click',
                (clicked) => {
                    preventedByNavigator = clicked.defaultPrevented;
                },
                { once: true },
            );
            preserveBrowserBehavior();
            anchor.dispatchEvent(event);
            expect(preventedByNavigator).toBe(false);
        }
        anchor.setAttribute('download', 'next.md');
        const download = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
        let downloadPrevented = true;
        container.addEventListener(
            'click',
            (event) => {
                downloadPrevented = event.defaultPrevented;
            },
            { once: true },
        );
        preserveBrowserBehavior();
        anchor.dispatchEvent(download);
        expect(downloadPrevented).toBe(false);
        anchor.removeAttribute('download');
        anchor.target = '_blank';
        const target = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
        let targetPrevented = true;
        container.addEventListener(
            'click',
            (event) => {
                targetPrevented = event.defaultPrevented;
            },
            { once: true },
        );
        preserveBrowserBehavior();
        anchor.dispatchEvent(target);
        expect(targetPrevented).toBe(false);
        navigator.dispose();
        await session.dispose();
    });
});
