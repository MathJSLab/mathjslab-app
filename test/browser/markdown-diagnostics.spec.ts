import { expect, test } from '@playwright/test';

declare global {
    interface Window {
        markdownTestApi?: typeof import('mathjslab-markdown/browser');
    }
}

test('dispatches source-aware diagnostics across the component boundary', async ({ page }) => {
    await page.goto('/test/browser/fixtures/lifecycle.html');
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');

    const result = await page.evaluate(async () => {
        const api = window.markdownTestApi!;
        const callbackDiagnostics: unknown[] = [];
        const eventDiagnostics: Array<{ code: string; category: string; line?: number; sourceUrl?: string; bubbles: boolean; composed: boolean }> = [];
        const engine = new api.MarkdownEngine({
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
        const viewer = document.createElement('markdown-document');
        viewer.engine = engine;
        viewer.context = { sourceUrl: new URL('https://course.test/lesson.md'), onDiagnostic: (diagnostic) => callbackDiagnostics.push(diagnostic) };
        viewer.markdown = '# Lesson\n\n```diagnostic-fixture\ncontent\n```';
        document.addEventListener('markdown-diagnostic', (event) => {
            const detail = (event as CustomEvent<{ code: string; category: string; line?: number; sourceUrl?: URL }>).detail;
            const { sourceUrl, ...rest } = detail;
            eventDiagnostics.push({ ...rest, ...(sourceUrl ? { sourceUrl: sourceUrl.href } : {}), bubbles: event.bubbles, composed: event.composed });
        });
        const ready = new Promise<void>((resolve) => viewer.addEventListener('markdown-ready', () => resolve(), { once: true }));
        document.body.append(viewer);
        await ready;
        await viewer.dispose();
        await engine.dispose();
        return { callbackDiagnostics, eventDiagnostics };
    });

    expect(result.callbackDiagnostics).toHaveLength(1);
    expect(result.eventDiagnostics).toHaveLength(1);
    expect(result.eventDiagnostics[0]).toMatchObject({
        code: 'extension-capability-blocked',
        category: 'policy',
        line: 3,
        sourceUrl: 'https://course.test/lesson.md',
        bubbles: true,
        composed: true,
    });
});
