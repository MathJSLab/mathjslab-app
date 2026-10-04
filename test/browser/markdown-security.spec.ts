import { expect, test } from '@playwright/test';

test('sanitized documents mediate allowed images and prevent cross-origin requests before DOM insertion', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.route('http://127.0.0.1:4173/course-image.png', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from([137, 80, 78, 71]) }));
    await page.route('http://127.0.0.1:4173/redirect.png', (route) => route.fulfill({ status: 302, headers: { location: 'https://outside.test/redirected.png' } }));
    await page.route('https://outside.test/**', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from([137, 80, 78, 71]) }));
    await page.goto('/test/browser/fixtures/lifecycle.html');

    const result = await page.evaluate(async () => {
        const moduleUrl = new URL('/dist/markdown-document/markdown-document.js', location.href).href;
        const { MarkdownEngine } = await import(/* webpackIgnore: true */ moduleUrl);
        const engine = new MarkdownEngine({ profile: 'core', securityMode: 'sanitized' });
        const container = document.createElement('div');
        document.body.append(container);
        const diagnostics: string[] = [];
        const session = await engine.renderDocument(
            '![local](/course-image.png) ![external](https://outside.test/blocked.png) ![redirect](/redirect.png)\n\n<img src="https://outside.test/raw.png" onerror="alert(1)"><svg><image href="/course-image.png"></image><image href="https://outside.test/svg.png"></image></svg><audio src="/audio.mp3"></audio>',
            container,
            {
                sourceUrl: new URL(location.href),
                resourcePolicy: { allowedOrigins: [location.origin] },
                onDiagnostic: (diagnostic: { code?: string }) => diagnostics.push(diagnostic.code ?? ''),
            },
        );
        const result = {
            imageSources: Array.from(container.querySelectorAll('img'), (image) => image.getAttribute('src')),
            svgImageSources: Array.from(container.querySelectorAll('svg image'), (image) => image.getAttribute('href')),
            mediaElements: container.querySelectorAll('audio, video').length,
            eventHandlers: container.querySelectorAll('[onerror]').length,
            diagnostics,
        };
        await session.dispose();
        await engine.dispose();
        return result;
    });

    expect(result.imageSources).toHaveLength(4);
    expect(result.imageSources[0]).toMatch(/^blob:/);
    expect(result.imageSources.slice(1)).toEqual([null, null, null]);
    expect(result.svgImageSources).toHaveLength(2);
    expect(result.svgImageSources[0]).toMatch(/^blob:/);
    expect(result.svgImageSources[1]).toBeNull();
    expect(result.mediaElements).toBe(0);
    expect(result.eventHandlers).toBe(0);
    expect(result.diagnostics.filter((code) => code === 'resource-url-blocked')).toHaveLength(4);
    expect(requests.filter((url) => url.includes('course-image.png'))).toHaveLength(2);
    expect(requests.filter((url) => url.includes('redirect.png'))).toHaveLength(1);
    expect(requests.some((url) => url.includes('outside.test'))).toBe(false);
});

test('sanitized documents display policy-approved cross-origin images without CORS fetches', async ({ page }) => {
    const requests: string[] = [];
    const failures: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    page.on('requestfailed', (request) => failures.push(`${request.url()}: ${request.failure()?.errorText ?? ''}`));
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="green"/></svg>';
    await page.route('https://mathjslab.com/**', (route) => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: svg }));
    await page.route('https://dl.circleci.com/**', (route) => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: svg }));
    await page.route('https://badges.gitter.im/Join%20Chat.svg', (route) => route.fulfill({ status: 301, headers: { location: 'https://badges.gitter.im/JoinChat.svg' } }));
    await page.route('https://badges.gitter.im/JoinChat.svg', (route) => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: svg }));
    await page.goto('/test/browser/fixtures/lifecycle.html');

    const result = await page.evaluate(async () => {
        const moduleUrl = new URL('/dist/markdown-document/markdown-document.js', location.href).href;
        const { MarkdownEngine } = await import(/* webpackIgnore: true */ moduleUrl);
        const engine = new MarkdownEngine({ profile: 'core', securityMode: 'sanitized' });
        const container = document.createElement('div');
        document.body.append(container);
        const session = await engine.renderDocument(
            '![logo](https://mathjslab.com/images/mathjslab-logo.svg) ![status](https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-app/tree/main.svg?style=svg) ![chat](https://badges.gitter.im/Join%20Chat.svg)',
            container,
            {
                sourceUrl: new URL(location.href),
                resourcePolicy: { allowedOrigins: [location.origin, 'https://mathjslab.com', 'https://dl.circleci.com', 'https://badges.gitter.im'] },
            },
        );
        const sources = Array.from(container.querySelectorAll('img'), (image) => image.getAttribute('src'));
        await Promise.all(Array.from(container.querySelectorAll('img'), (image) => image.decode().catch(() => undefined)));
        const loaded = Array.from(container.querySelectorAll('img'), (image) => image.naturalWidth > 0);
        await session.dispose();
        await engine.dispose();
        return { sources, loaded };
    });

    expect(result.sources).toEqual([
        'https://mathjslab.com/images/mathjslab-logo.svg',
        'https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-app/tree/main.svg?style=svg',
        'https://badges.gitter.im/Join%20Chat.svg',
    ]);
    expect(result.loaded).toEqual([true, true, true]);
    expect(requests.some((url) => url.includes('JoinChat.svg'))).toBe(true);
    expect(failures).toEqual([]);
});
