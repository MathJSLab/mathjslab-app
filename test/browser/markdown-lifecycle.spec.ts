import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

const openFixture = async (page: Page): Promise<void> => {
    await page.goto('/test/browser/fixtures/lifecycle.html');
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
};

test('aborts a stale document request before it can replace the current document', async ({ page }) => {
    await openFixture(page);
    await page.evaluate(() => {
        const api = window.markdownTestApi!;
        const aborted: string[] = [];
        const viewer = document.createElement('markdown-document');
        viewer.engine = api.createEducationalMarkdownEngine({ features: [] });
        viewer.context = {
            fetchResource: (url: URL, init?: RequestInit) =>
                new Promise<Response>((resolve, reject) => {
                    const signal = init?.signal;
                    const timer = window.setTimeout(
                        () => resolve(new Response(url.pathname.includes('slow') ? '# Stale document' : '# Current document')),
                        url.pathname.includes('slow') ? 2_000 : 10,
                    );
                    signal?.addEventListener(
                        'abort',
                        () => {
                            window.clearTimeout(timer);
                            aborted.push(url.pathname);
                            reject(new DOMException('Aborted', 'AbortError'));
                        },
                        { once: true },
                    );
                }),
        };
        viewer.src = './slow.md';
        document.body.append(viewer);
        window.markdownLifecycle = { viewer, aborted };
    });

    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'loading');
    await page.evaluate(() => {
        window.markdownLifecycle!.viewer.src = './current.md';
    });
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('h1')).toHaveText('Current document');
    await expect(viewer.locator('text=Stale document')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.markdownLifecycle!.aborted.includes('/test/browser/fixtures/slow.md'))).toBe(true);
});

test('disconnecting during a request prevents late rendering and releases the session', async ({ page }) => {
    await openFixture(page);
    const result = await page.evaluate(async () => {
        const api = window.markdownTestApi!;
        let aborted = false;
        const viewer = document.createElement('markdown-document');
        viewer.engine = api.createEducationalMarkdownEngine({ features: [] });
        viewer.context = {
            fetchResource: (_url: URL, init?: RequestInit) =>
                new Promise<Response>((resolve, reject) => {
                    const timer = window.setTimeout(() => resolve(new Response('# Too late')), 1_000);
                    init?.signal?.addEventListener(
                        'abort',
                        () => {
                            aborted = true;
                            window.clearTimeout(timer);
                            reject(new DOMException('Aborted', 'AbortError'));
                        },
                        { once: true },
                    );
                }),
        };
        viewer.src = './pending.md';
        document.body.append(viewer);
        await new Promise<void>((resolve) => viewer.addEventListener('markdown-state-change', () => viewer.state === 'loading' && resolve(), { once: true }));
        viewer.remove();
        await new Promise((resolve) => window.setTimeout(resolve, 50));
        return { aborted, state: viewer.state, content: viewer.shadowRoot?.querySelector('[part="content"]')?.textContent ?? '' };
    });

    expect(result.aborted).toBe(true);
    expect(result.content).toBe('');
});

test('keeps an invalid extension local and renders the remaining blocks', async ({ page }) => {
    await openFixture(page);
    await page.evaluate(() => {
        const viewer = document.createElement('markdown-document');
        viewer.engine = window.markdownTestApi!.createEducationalMarkdownEngine({ features: ['mermaid', 'graphviz'] });
        viewer.markdown = `# Isolated failure

\`\`\`mermaid
this is not a mermaid diagram
\`\`\`

\`\`\`dot
digraph { valid -> result }
\`\`\``;
        document.body.append(viewer);
    });

    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('[data-markdown-extension="mermaid"] [role="alert"]')).toContainText('Mermaid:');
    await expect(viewer.locator('[data-markdown-extension="mermaid"] pre').last()).toContainText('not a mermaid diagram');
    await expect(viewer.locator('[data-markdown-extension="graphviz"] svg')).toBeVisible();
});

test('dispose disconnects extension ResizeObservers and removes interactive output', async ({ page }) => {
    await openFixture(page);
    await page.evaluate(() => {
        const NativeResizeObserver = window.ResizeObserver;
        const active = new Set<object>();
        class TrackedResizeObserver implements ResizeObserver {
            private readonly native: ResizeObserver;
            public constructor(callback: ResizeObserverCallback) {
                this.native = new NativeResizeObserver(callback);
            }
            public observe(target: Element, options?: ResizeObserverOptions): void {
                active.add(this);
                this.native.observe(target, options);
            }
            public unobserve(target: Element): void {
                this.native.unobserve(target);
            }
            public disconnect(): void {
                active.delete(this);
                this.native.disconnect();
            }
        }
        window.ResizeObserver = TrackedResizeObserver;
        window.markdownResizeObservers = active;

        const viewer = document.createElement('markdown-document');
        viewer.engine = window.markdownTestApi!.createEducationalMarkdownEngine({ features: ['maps', 'vega-lite'] });
        viewer.markdown = `# Disposable resources

\`\`\`geojson
{"type":"Point","coordinates":[-46.63,-23.55]}
\`\`\`

\`\`\`vega-lite
{"data":{"values":[{"x":"A","y":1}]},"mark":"bar","encoding":{"x":{"field":"x"},"y":{"field":"y","type":"quantitative"}}}
\`\`\``;
        document.body.append(viewer);
        window.markdownLifecycle = { viewer, aborted: [] };
    });

    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('.leaflet-container')).toBeVisible();
    await expect(viewer.locator('[data-markdown-extension="vega-lite"] canvas, [data-markdown-extension="vega-lite"] svg').first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.markdownResizeObservers!.size)).toBeGreaterThanOrEqual(2);

    await page.evaluate(() => window.markdownLifecycle!.viewer.dispose());
    await expect(viewer).toHaveAttribute('state', 'empty');
    await expect(viewer.locator('.leaflet-container, canvas, [data-markdown-extension]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.markdownResizeObservers!.size)).toBe(0);
});

test('dispose cancels the Three.js animation loop and removes its WebGL canvas', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Playwright Firefox does not provide the WebGL implementation required by Three.js on this test host.');
    await openFixture(page);
    const hasWebGL = await page.evaluate(() => Boolean(document.createElement('canvas').getContext('webgl2') ?? document.createElement('canvas').getContext('webgl')));
    test.skip(!hasWebGL, 'This browser runtime does not provide a WebGL context.');
    await page.evaluate(() => {
        const nativeRequest = window.requestAnimationFrame.bind(window);
        const nativeCancel = window.cancelAnimationFrame.bind(window);
        const active = new Set<number>();
        window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
            const id = nativeRequest((time) => {
                active.delete(id);
                callback(time);
            });
            active.add(id);
            return id;
        };
        window.cancelAnimationFrame = (id: number): void => {
            active.delete(id);
            nativeCancel(id);
        };
        window.markdownAnimationFrames = active;

        const viewer = document.createElement('markdown-document');
        viewer.engine = window.markdownTestApi!.createEducationalMarkdownEngine({ features: ['model-3d'] });
        viewer.markdown = `# Disposable animated model

\`\`\`gltf
{
  "asset": {"version": "2.0"},
  "scene": 0,
  "scenes": [{"nodes": [0]}],
  "nodes": [{}],
  "buffers": [{"byteLength": 32, "uri": "data:application/octet-stream;base64,AAAAAAAAgD8AAAAAAAAAAAAAAAAAAIA/AAAAAAAAAAA="}],
  "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": 8}, {"buffer": 0, "byteOffset": 8, "byteLength": 24}],
  "accessors": [
    {"bufferView": 0, "componentType": 5126, "count": 2, "type": "SCALAR", "min": [0], "max": [1]},
    {"bufferView": 1, "componentType": 5126, "count": 2, "type": "VEC3"}
  ],
  "animations": [{"samplers": [{"input": 0, "output": 1}], "channels": [{"sampler": 0, "target": {"node": 0, "path": "translation"}}]}]
}
\`\`\``;
        document.body.append(viewer);
        window.markdownLifecycle = { viewer, aborted: [] };
    });

    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('[data-markdown-extension="model-3d"] canvas')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.markdownAnimationFrames!.size)).toBeGreaterThan(0);

    await page.evaluate(() => window.markdownLifecycle!.viewer.dispose());
    await expect(viewer).toHaveAttribute('state', 'empty');
    await expect(viewer.locator('canvas')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.markdownAnimationFrames!.size)).toBe(0);
});

declare global {
    interface Window {
        markdownTestApi?: typeof import('../../src/markdown-document');
        markdownLifecycle?: { viewer: import('../../src/components/markdown-document/markdown-document.component').MarkdownDocumentElement; aborted: string[] };
        markdownResizeObservers?: Set<object>;
        markdownAnimationFrames?: Set<number>;
    }
}
