/// <reference types="jest" />
import { MarkdownEngine, type MarkdownDiagnostic, type MarkdownDocumentContext } from '../../src/MarkdownEngine';
import { TextEncoder } from 'node:util';

Object.assign(globalThis, { TextEncoder });

describe('Markdown security and resource policy', () => {
    it('preserves authored HTML in trusted mode for backwards compatibility', async () => {
        const engine = new MarkdownEngine({ profile: 'core' });
        const container = document.createElement('div');
        await engine.render('<section data-example="yes">Trusted</section>', container);
        expect(container.querySelector('section')?.textContent).toBe('Trusted');
        await engine.dispose();
    });

    it('sanitizes active HTML while preserving ordinary Markdown', async () => {
        const engine = new MarkdownEngine({ profile: 'core', securityMode: 'sanitized' });
        const container = document.createElement('div');
        await engine.render('# Lesson\n\n<script>bad()</script><img src="x" onerror="bad()">', container);
        expect(container.querySelector('h1')?.textContent).toBe('Lesson');
        expect(container.querySelector('script')).toBeNull();
        expect(container.querySelector('img')?.hasAttribute('onerror')).toBe(false);
        await engine.dispose();
    });

    it('renders authored HTML as text in strict mode', async () => {
        const engine = new MarkdownEngine({ profile: 'core', securityMode: 'strict' });
        const container = document.createElement('div');
        await engine.render('<section>Raw HTML</section>\n\n**Markdown remains active**', container);
        expect(container.querySelector('section')).toBeNull();
        expect(container.textContent).toContain('<section>Raw HTML</section>');
        expect(container.querySelector('strong')?.textContent).toBe('Markdown remains active');
        await engine.dispose();
    });

    it('removes disallowed resource URLs and emits structured diagnostics', async () => {
        const diagnostics: MarkdownDiagnostic[] = [];
        const engine = new MarkdownEngine({
            profile: 'gfm',
            resourcePolicy: { allowedProtocols: ['https:'], allowedOrigins: ['https://course.test'] },
        });
        const container = document.createElement('div');
        await engine.render('[Allowed](lesson.md) [Blocked](http://outside.test/a) ![Bad](data:text/plain,no)', container, {
            sourceUrl: new URL('https://course.test/index.md'),
            onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
        });
        const links = container.querySelectorAll('a');
        expect(links[0]?.getAttribute('href')).toBe('https://course.test/lesson.md');
        expect(links[1]?.hasAttribute('href')).toBe(false);
        expect(container.querySelector('img')?.hasAttribute('src')).toBe(false);
        expect(diagnostics).toHaveLength(2);
        expect(diagnostics.every(({ code, severity }) => code === 'resource-url-blocked' && severity === 'warning')).toBe(true);
        await engine.dispose();
    });

    it('blocks navigation when network access is disabled without replacing the document', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm', resourcePolicy: { allowNetwork: false } });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Current', container, { sourceUrl: new URL('https://course.test/index.md') });
        await expect(session.navigate('next.md')).rejects.toThrow('Network access is not allowed');
        expect(container.querySelector('h1')?.textContent).toBe('Current');
        await session.dispose();
    });

    it('caches successful text resources inside one document session', async () => {
        let requests = 0;
        const context: MarkdownDocumentContext = {
            sourceUrl: new URL('https://course.test/index.md'),
            fetchResource: async () => {
                requests++;
                return { ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => '# Cached' } as Response;
            },
        };
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Index', container, context);
        await session.navigate('lesson.md');
        await session.navigate('https://course.test/lesson.md');
        expect(requests).toBe(1);
        await session.dispose();
    });

    it('enforces the actual text size when a server omits Content-Length', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm', resourcePolicy: { maxResourceBytes: 4 } });
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Current', container, {
            sourceUrl: new URL('https://course.test/index.md'),
            fetchResource: async () => ({ ok: true, status: 200, statusText: 'OK', headers: new Headers(), text: async () => '12345' }) as Response,
        });
        await expect(session.navigate('large.md')).rejects.toThrow('Resource exceeds the configured limit');
        expect(container.querySelector('h1')?.textContent).toBe('Current');
        await session.dispose();
    });
});
