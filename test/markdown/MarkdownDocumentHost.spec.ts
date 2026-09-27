/// <reference types="jest" />
import { TextEncoder } from 'node:util';
import { MarkdownEngine } from '../../src/MarkdownEngine';
import { disposeMarkdownDocument, getHostedMarkdownDocument, mountMarkdownDocument } from '../../src/markdown/MarkdownDocumentHost';

Object.assign(globalThis, { TextEncoder });

describe('MarkdownDocumentHost', () => {
    afterEach(() => document.body.replaceChildren());

    it('mounts the component with application context and replaces the previous document', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        document.body.append(container);

        const first = await mountMarkdownDocument(container, {
            engine,
            markdown: '# First\n\n[Relative](next.md)',
            context: { sourceUrl: new URL('https://course.test/lesson.md') },
            locale: 'pt-BR',
            theme: 'dark',
        });
        expect(container.firstElementChild).toBe(first);
        expect(first.shadowRoot?.querySelector('a')?.href).toBe('https://course.test/next.md');
        expect(first.getAttribute('locale')).toBe('pt-BR');
        expect(first.getAttribute('theme')).toBe('dark');

        const second = await mountMarkdownDocument(container, { engine, markdown: '# Second' });
        expect(container.childElementCount).toBe(1);
        expect(container.firstElementChild).toBe(second);
        expect(getHostedMarkdownDocument(container)).toBe(second);
        expect(first.isConnected).toBe(false);

        await disposeMarkdownDocument(container);
        expect(container.childElementCount).toBe(0);
        expect(getHostedMarkdownDocument(container)).toBeUndefined();
        await engine.dispose();
    });

    it('rejects when the hosted component cannot load its source', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        document.body.append(container);
        await expect(
            mountMarkdownDocument(container, {
                engine,
                src: 'https://course.test/missing.md',
                context: {
                    fetchResource: async () => ({ ok: false, status: 404, statusText: 'Not Found', headers: new Headers() }) as Response,
                },
            }),
        ).rejects.toThrow('404 Not Found');
        await disposeMarkdownDocument(container);
        await engine.dispose();
    });

    it('mounts an embedded document that preserves navigation without full-page chrome', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        document.body.append(container);

        const embedded = await mountMarkdownDocument(container, {
            engine,
            markdown: '# Plot3\n\n[Local](guide.md) [External](https://example.test/reference)\n\n## References',
            context: { sourceUrl: new URL('https://help.test/plot3.md') },
            presentation: 'embedded',
        });

        expect(container.firstElementChild).toBe(embedded);
        expect(embedded.getAttribute('presentation')).toBe('embedded');
        expect(embedded.shadowRoot?.querySelector('h1')?.textContent).toBe('Plot3');
        const links = embedded.shadowRoot?.querySelectorAll<HTMLAnchorElement>('a[href]');
        expect(links?.[0]?.href).toBe('https://help.test/guide.md');
        expect(links?.[0]?.target).toBe('');
        expect(links?.[1]?.target).toBe('_blank');
        expect(links?.[1]?.rel).toContain('noopener');

        await disposeMarkdownDocument(container);
        expect(container.childElementCount).toBe(0);
        await engine.dispose();
    });

    it('configures hidden and inline outline presentations', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        document.body.append(container);

        const hidden = await mountMarkdownDocument(container, {
            engine,
            markdown: '# Help\n\n[External](https://example.test/reference)',
            outline: 'hidden',
            externalLinks: 'new-tab',
        });
        expect(hidden.getAttribute('outline')).toBe('hidden');
        expect(hidden.shadowRoot?.querySelector<HTMLAnchorElement>('a')?.target).toBe('_blank');

        const inline = await mountMarkdownDocument(container, { engine, markdown: '# Lesson', outline: 'inline' });
        expect(inline.getAttribute('outline')).toBe('inline');
        expect(inline.shadowRoot?.querySelector<HTMLElement>('[part="toolbar"]')?.hidden).toBe(false);

        await disposeMarkdownDocument(container);
        await engine.dispose();
    });
});
