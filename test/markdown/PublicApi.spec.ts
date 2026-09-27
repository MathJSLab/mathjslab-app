import * as api from '../../src/markdown-document';
import * as componentApi from '../../src/markdown-component';
import * as coreApi from '../../src/markdown-core';
import * as extensionApi from '../../src/markdown-extensions';
import * as mathJSLabApi from '../../src/markdown-mathjslab';
import * as workerApi from '../../src/markdown-mathjslab-worker';

describe('standalone Markdown public API', () => {
    test('exposes the engine, component, navigation and hosting entry points', () => {
        expect(api).toEqual(
            expect.objectContaining({
                MarkdownEngine: expect.any(Function),
                createEducationalMarkdownEngine: expect.any(Function),
                MarkdownDocumentElement: expect.any(Function),
                defineMarkdownDocumentElement: expect.any(Function),
                MarkdownDocumentController: expect.any(Function),
                MarkdownDocumentModel: expect.any(Function),
                MarkdownNavigator: expect.any(Function),
                mountMarkdownDocument: expect.any(Function),
                disposeMarkdownDocument: expect.any(Function),
            }),
        );
    });

    test.each([
        ['abcExtension', 'abcManifest'],
        ['graphvizExtension', 'graphvizManifest'],
        ['headingIdsExtension', 'headingIdsManifest'],
        ['mapsExtension', 'mapsManifest'],
        ['mathJaxExtension', 'mathJaxManifest'],
        ['mathJSLabExtension', 'mathJSLabManifest'],
        ['mermaidExtension', 'mermaidManifest'],
        ['model3DExtension', 'model3DManifest'],
        ['molecule3DExtension', 'molecule3DManifest'],
        ['relativeUrlsExtension', 'relativeUrlsManifest'],
        ['smilesExtension', 'smilesManifest'],
        ['syntaxHighlightExtension', 'syntaxHighlightManifest'],
        ['vegaLiteExtension', 'vegaLiteManifest'],
        ['verovioExtension', 'verovioManifest'],
    ])('exports %s together with %s', (factory, manifest) => {
        expect(api[factory as keyof typeof api]).toEqual(expect.any(Function));
        expect(api[manifest as keyof typeof api]).toEqual(expect.objectContaining({ name: expect.any(String), dependencies: expect.any(Array) }));
    });

    test('does not expose the application compatibility facade', () => {
        expect('Markdown' in api).toBe(false);
        expect('markdownEngine' in api).toBe(false);
    });

    test('keeps explicit subpath responsibilities separate', () => {
        expect(coreApi).toEqual(expect.objectContaining({ MarkdownEngine: expect.any(Function), MarkdownDocumentModel: expect.any(Function) }));
        expect('MarkdownDocumentElement' in coreApi).toBe(false);
        expect('mathJSLabExtension' in coreApi).toBe(false);

        expect(componentApi).toEqual(expect.objectContaining({ MarkdownDocumentElement: expect.any(Function), mountMarkdownDocument: expect.any(Function) }));
        expect('MarkdownEngine' in componentApi).toBe(false);

        expect(extensionApi).toEqual(expect.objectContaining({ mermaidExtension: expect.any(Function), mermaidManifest: expect.any(Object) }));
        expect('mathJSLabExtension' in extensionApi).toBe(false);

        expect(mathJSLabApi).toEqual(
            expect.objectContaining({ mathJSLabExtension: expect.any(Function), createBrowserMathJSLabWorkerExecutor: expect.any(Function), materializePlotlyOutput: expect.any(Function) }),
        );
        expect('MathJSLabWorkerRuntime' in mathJSLabApi).toBe(false);

        expect(workerApi).toEqual(expect.objectContaining({ MathJSLabWorkerRuntime: expect.any(Function), createWorkerMathJSLabTransport: expect.any(Function) }));
        expect('mathJSLabExtension' in workerApi).toBe(false);
    });

    test('locks the runtime export names for each stable surface', () => {
        expect(Object.keys(coreApi).sort()).toEqual(
            [
                'MarkdownDocumentController',
                'MarkdownDocumentModel',
                'MarkdownEngine',
                'MarkdownNavigator',
                'createEducationalMarkdownEngine',
                'createMarkdownOutline',
                'educationalMarkdownFeatures',
                'markdownProfiles',
                'markdownPublicApiVersion',
            ].sort(),
        );
        expect(Object.keys(componentApi).sort()).toEqual(
            ['MarkdownDocumentElement', 'defineMarkdownDocumentElement', 'disposeMarkdownDocument', 'getHostedMarkdownDocument', 'mountMarkdownDocument'].sort(),
        );
        expect(Object.keys(extensionApi).sort()).toEqual(
            [
                'abcExtension',
                'abcManifest',
                'graphvizExtension',
                'graphvizManifest',
                'headingIdsExtension',
                'headingIdsManifest',
                'mapsExtension',
                'mapsManifest',
                'mathJaxExtension',
                'mathJaxManifest',
                'mermaidExtension',
                'mermaidManifest',
                'model3DExtension',
                'model3DManifest',
                'molecule3DExtension',
                'molecule3DManifest',
                'relativeUrlsExtension',
                'relativeUrlsManifest',
                'smilesExtension',
                'smilesManifest',
                'syntaxHighlightExtension',
                'syntaxHighlightManifest',
                'vegaLiteExtension',
                'vegaLiteManifest',
                'verovioExtension',
                'verovioManifest',
            ].sort(),
        );
        expect(Object.keys(mathJSLabApi).sort()).toEqual(['createBrowserMathJSLabWorkerExecutor', 'materializePlotlyOutput', 'mathJSLabExtension', 'mathJSLabManifest'].sort());
        expect(Object.keys(workerApi).sort()).toEqual(
            [
                'MathJSLabWorkerRuntime',
                'WorkerMathJSLabTransport',
                'createTransportMathJSLabExecutor',
                'createWorkerMathJSLabTransport',
                'deserializeMathJSLabWorkerError',
                'mathJSLabWorkerProtocolVersion',
                'serializeMathJSLabWorkerError',
                'snapshotMathJSLabContext',
            ].sort(),
        );
        expect(coreApi.markdownPublicApiVersion).toBe(1);
    });
});
