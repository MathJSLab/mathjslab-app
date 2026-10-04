/// <reference types="jest" />
import { jest } from '@jest/globals';
import { MarkdownEngine, type MarkdownDiagnostic, type MarkdownDocumentContext } from '../../src/MarkdownEngine';
import { DefaultMarkdownResourceService } from '../../src/markdown/security';
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextDecoder, TextEncoder });

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

    it('applies URL policy before returned HTML can trigger image requests', async () => {
        const engine = new MarkdownEngine({ profile: 'core', securityMode: 'sanitized', resourcePolicy: { allowedOrigins: ['https://course.test'] } });
        const diagnostics: MarkdownDiagnostic[] = [];
        const html = await engine.renderHTML('[outside](https://outside.test/page) ![outside](https://outside.test/image.png) ![local](./image.png)', {
            sourceUrl: new URL('https://course.test/lesson.md'),
            onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
        });
        const template = document.createElement('template');
        template.innerHTML = html;
        expect(template.content.querySelector('a')?.hasAttribute('href')).toBe(false);
        expect(template.content.querySelectorAll('img[src]')).toHaveLength(1);
        expect(template.content.querySelector('img[src]')?.getAttribute('src')).toBe('https://course.test/image.png');
        expect(diagnostics).toHaveLength(2);
        await engine.dispose();
    });

    it('applies resource policy to sanitized and strict Markdown URLs', async () => {
        for (const securityMode of ['sanitized', 'strict'] as const) {
            const engine = new MarkdownEngine({ profile: 'core', securityMode });
            const html = await engine.renderHTML('[script](javascript:alert(1)) ![data](data:image/png;base64,AAAA)', {
                sourceUrl: new URL('https://course.test/lesson.md'),
                resourcePolicy: { allowedProtocols: ['https:'], allowDataUrls: false },
            });
            const template = document.createElement('template');
            template.innerHTML = html;
            expect(template.content.querySelector('a')?.hasAttribute('href')).toBe(false);
            expect(template.content.querySelector('img')?.hasAttribute('src')).toBe(false);
            await engine.dispose();
        }
    });

    it('mediates session image requests, checks body size and owns the object URL', async () => {
        const created: string[] = [];
        const revoked: string[] = [];
        const previousCreate = URL.createObjectURL;
        const previousRevoke = URL.revokeObjectURL;
        URL.createObjectURL = jest.fn(() => {
            const url = `blob:https://course.test/managed-${created.length}`;
            created.push(url);
            return url;
        });
        URL.revokeObjectURL = jest.fn((url: string): void => {
            revoked.push(url);
        });
        try {
            let requests = 0;
            const imageDiagnostics: MarkdownDiagnostic[] = [];
            const engine = new MarkdownEngine({ profile: 'gfm', securityMode: 'sanitized', resourcePolicy: { maxResourceBytes: 3 } });
            const container = document.createElement('div');
            const session = await engine.renderDocument('![ok](./ok.png)', container, {
                sourceUrl: new URL('https://course.test/lesson.md'),
                fetchResource: async () => {
                    requests++;
                    return { ok: true, status: 200, statusText: 'OK', headers: { get: () => null }, blob: async () => new Blob(['png'], { type: 'image/png' }) } as unknown as Response;
                },
                onDiagnostic: (diagnostic) => imageDiagnostics.push(diagnostic),
            });
            expect(requests).toBe(1);
            expect(created).toEqual(['blob:https://course.test/managed-0']);
            expect(container.querySelector('img')?.getAttribute('src')).toBe('blob:https://course.test/managed-0');
            expect(imageDiagnostics).toHaveLength(0);
            await session.update('# Replaced');
            expect(revoked).toContain('blob:https://course.test/managed-0');
            await session.dispose();
            await engine.dispose();

            const limited = new MarkdownEngine({ profile: 'gfm', securityMode: 'sanitized', resourcePolicy: { maxResourceBytes: 2 } });
            const limitedContainer = document.createElement('div');
            const diagnostics: MarkdownDiagnostic[] = [];
            const limitedSession = await limited.renderDocument('![too large](./large.png)', limitedContainer, {
                sourceUrl: new URL('https://course.test/lesson.md'),
                fetchResource: async () =>
                    ({ ok: true, status: 200, statusText: 'OK', headers: { get: () => null }, blob: async () => new Blob(['large'], { type: 'image/png' }) }) as unknown as Response,
                onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
            });
            expect(limitedContainer.querySelector('img')?.hasAttribute('src')).toBe(false);
            expect(diagnostics.some(({ code }) => code === 'resource-size-limit')).toBe(true);
            await limitedSession.dispose();
            await limited.dispose();
        } finally {
            URL.createObjectURL = previousCreate;
            URL.revokeObjectURL = previousRevoke;
        }
    });

    it('leaves policy-approved cross-origin images for the browser instead of fetching them with CORS', async () => {
        const previousFetch = globalThis.fetch;
        const fetchSpy = jest.fn(async () => {
            throw new TypeError('Failed to fetch');
        });
        globalThis.fetch = fetchSpy as unknown as typeof fetch;
        const engine = new MarkdownEngine({ profile: 'core', securityMode: 'sanitized' });
        const resources = new DefaultMarkdownResourceService();
        try {
            const html = await engine.renderHTML(
                '![logo](https://mathjslab.com/images/mathjslab-logo.svg) ![status](https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-app/tree/main.svg?style=svg) ![chat](https://badges.gitter.im/Join%20Chat.svg)',
                {
                    resources,
                    sourceUrl: new URL('https://localhost:8080/pt/README.md'),
                    resourcePolicy: { allowedOrigins: ['https://mathjslab.com', 'https://dl.circleci.com', 'https://badges.gitter.im'] },
                },
            );
            const template = document.createElement('template');
            template.innerHTML = html;
            expect(Array.from(template.content.querySelectorAll('img'), (image) => image.getAttribute('src'))).toEqual([
                'https://mathjslab.com/images/mathjslab-logo.svg',
                'https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-app/tree/main.svg?style=svg',
                'https://badges.gitter.im/Join%20Chat.svg',
            ]);
            expect(fetchSpy).not.toHaveBeenCalled();
            await engine.dispose();
            await resources.dispose();
        } finally {
            globalThis.fetch = previousFetch;
        }
    });

    it('validates every redirect before following it', async () => {
        const resources = new DefaultMarkdownResourceService();
        const requests: string[] = [];
        const context: MarkdownDocumentContext = {
            sourceUrl: new URL('https://course.test/lesson.md'),
            securityMode: 'sanitized',
            resourcePolicy: { allowedOrigins: ['https://course.test'] },
            fetchResource: async (url, init) => {
                requests.push(url.href);
                expect(init.redirect).toBe('manual');
                return {
                    ok: url.pathname === '/final.md',
                    status: url.pathname === '/start.md' ? 302 : 200,
                    statusText: url.pathname === '/start.md' ? 'Found' : 'OK',
                    headers: { get: (name: string) => (name.toLowerCase() === 'location' ? (url.pathname === '/start.md' ? '/final.md' : null) : null) },
                    url: url.href,
                } as unknown as Response;
            },
        };
        const response = await resources.fetch('/start.md', context);
        expect(response.status).toBe(200);
        expect(requests).toEqual(['https://course.test/start.md', 'https://course.test/final.md']);
        await resources.dispose();

        const blockedRequests: string[] = [];
        const blocked = new DefaultMarkdownResourceService();
        await expect(
            blocked.fetch('/redirect.md', {
                ...context,
                fetchResource: async (url) => {
                    blockedRequests.push(url.href);
                    return {
                        ok: false,
                        status: 302,
                        statusText: 'Found',
                        headers: { get: () => 'https://outside.test/final.md' },
                        url: url.href,
                    } as unknown as Response;
                },
            }),
        ).rejects.toThrow(/Origin is not allowed/);
        expect(blockedRequests).toEqual(['https://course.test/redirect.md']);
        await blocked.dispose();
    });

    it('reports resource policy and transport failures with stable diagnostic codes', async () => {
        const resources = new DefaultMarkdownResourceService();
        const diagnostics: MarkdownDiagnostic[] = [];
        const context: MarkdownDocumentContext = {
            sourceUrl: new URL('https://course.test/lesson.md'),
            securityMode: 'sanitized',
            onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
            fetchResource: async () => ({ ok: false, status: 503, statusText: 'Unavailable', headers: { get: () => null } }) as unknown as Response,
        };
        expect(() => resources.resolve('javascript:alert(1)', context)).toThrow(/Protocol is not allowed/);
        await expect(resources.readText('/offline.md', context)).rejects.toThrow('503 Unavailable');
        expect(diagnostics.map(({ code }) => code)).toEqual(['resource-url-blocked', 'resource-load-error']);
        await resources.dispose();
    });

    it('stops consuming a stream when it exceeds the body limit without Content-Length', async () => {
        const resources = new DefaultMarkdownResourceService();
        const cancel = jest.fn(async () => undefined);
        let reads = 0;
        const reader = {
            read: async (): Promise<ReadableStreamReadResult<Uint8Array>> => {
                reads++;
                return { done: false, value: new Uint8Array(reads === 1 ? [1, 2, 3, 4, 5] : [6]) };
            },
            cancel,
            releaseLock: jest.fn(),
        };
        const diagnostics: MarkdownDiagnostic[] = [];
        await expect(
            resources.readText('/large.md', {
                sourceUrl: new URL('https://course.test/index.md'),
                securityMode: 'sanitized',
                resourcePolicy: { maxResourceBytes: 4 },
                onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
                fetchResource: async () =>
                    ({
                        ok: true,
                        status: 200,
                        statusText: 'OK',
                        headers: { get: () => null },
                        body: { getReader: () => reader },
                    }) as unknown as Response,
            }),
        ).rejects.toThrow(/Resource exceeds the configured limit/);
        expect(cancel).toHaveBeenCalledTimes(1);
        expect(reads).toBe(1);
        expect(diagnostics.map(({ code }) => code)).toEqual(['resource-size-limit']);
        await resources.dispose();
    });

    it('blocks extension capabilities by security mode unless explicitly allowed', async () => {
        const calls: string[] = [];
        const extension = {
            name: 'capability-fixture',
            manifest: {
                name: 'capability-fixture',
                description: '',
                dependencies: [],
                fences: [{ language: 'remote-fixture', className: 'remote-fixture' }],
                capabilities: ['network' as const],
            },
            fences: [
                {
                    language: 'remote-fixture',
                    className: 'remote-fixture',
                    render: async (_container: Element, _source: string, context: MarkdownDocumentContext) => {
                        calls.push('render');
                        context.onDiagnostic?.({ extension: 'capability-fixture', code: 'fixture', message: 'rendered' });
                    },
                },
            ],
        };
        const engine = new MarkdownEngine({ profile: 'core', securityMode: 'strict', extensions: [extension] });
        const diagnostics: MarkdownDiagnostic[] = [];
        const container = document.createElement('div');
        const session = await engine.renderDocument('```remote-fixture\nhello\n```', container, { onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });
        expect(calls).toHaveLength(0);
        expect(diagnostics.some(({ code }) => code === 'extension-capability-blocked')).toBe(true);
        const sanitizedEngine = new MarkdownEngine({ profile: 'core', securityMode: 'sanitized', extensions: [extension] });
        const sanitizedSession = await sanitizedEngine.renderDocument('```remote-fixture\nhello\n```', document.createElement('div'));
        expect(calls).toHaveLength(0);
        await sanitizedSession.dispose();
        await sanitizedEngine.dispose();
        await session.update('```remote-fixture\nhello\n```', { allowedCapabilities: ['network'], onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });
        expect(calls).toHaveLength(1);
        await session.dispose();
    });
});
