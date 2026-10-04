import { MarkdownEngine, markdownDiagnosticCodes, markdownDiagnosticCategory, type MarkdownDiagnostic } from '../../src/MarkdownEngine';

describe('Markdown diagnostic catalog and context', () => {
    it('publishes stable, unique codes and semantic categories', () => {
        const codes = Object.values(markdownDiagnosticCodes);
        expect(new Set(codes).size).toBe(codes.length);
        expect(markdownDiagnosticCategory(markdownDiagnosticCodes.resourceLoadError)).toBe('network');
        expect(markdownDiagnosticCategory(markdownDiagnosticCodes.extensionCapabilityBlocked)).toBe('policy');
        expect(markdownDiagnosticCategory(markdownDiagnosticCodes.mathJSLabExecutionTimeout)).toBe('execution');
        expect(markdownDiagnosticCategory('integrator-specific-code')).toBe('extension');
    });

    it('adds source URL and fence start line to extension diagnostics when available', async () => {
        const diagnostics: MarkdownDiagnostic[] = [];
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                {
                    name: 'diagnostic-fixture',
                    fences: [
                        {
                            language: 'diagnostic-fixture',
                            className: 'diagnostic-fixture',
                            render: async (_container, _source, context) => context.onDiagnostic?.({ extension: 'diagnostic-fixture', message: 'rendered' }),
                        },
                    ],
                },
            ],
        });
        const sourceUrl = new URL('https://course.test/lesson.md');
        const container = document.createElement('div');
        const session = await engine.renderDocument('# Lesson\n\n```diagnostic-fixture\ncontent\n```', container, { sourceUrl, onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });

        expect(diagnostics).toEqual([
            expect.objectContaining({
                extension: 'diagnostic-fixture',
                code: markdownDiagnosticCodes.extensionDiagnostic,
                category: 'extension',
                line: 3,
                sourceUrl,
            }),
        ]);
        await session.dispose();
        await engine.dispose();
    });

    it('suppresses diagnostics that arrive after their render operation was aborted', async () => {
        const diagnostics: MarkdownDiagnostic[] = [];
        let announceStart!: () => void;
        let finishRender!: () => void;
        const started = new Promise<void>((resolve) => (announceStart = resolve));
        const gate = new Promise<void>((resolve) => (finishRender = resolve));
        const engine = new MarkdownEngine({
            profile: 'core',
            extensions: [
                {
                    name: 'abort-diagnostic-fixture',
                    fences: [
                        {
                            language: 'abort-diagnostic-fixture',
                            className: 'abort-diagnostic-fixture',
                            async render(_container, _source, context) {
                                announceStart();
                                await gate;
                                context.onDiagnostic?.({ extension: 'abort-diagnostic-fixture', message: 'late result' });
                            },
                        },
                    ],
                },
            ],
        });
        const controller = new AbortController();
        const sessionPromise = engine.renderDocument('```abort-diagnostic-fixture\nsource\n```', document.createElement('div'), {
            signal: controller.signal,
            onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
        });
        await started;
        controller.abort();
        finishRender();
        const session = await sessionPromise;

        expect(diagnostics).toEqual([]);
        await session.dispose();
        await engine.dispose();
    });
});
