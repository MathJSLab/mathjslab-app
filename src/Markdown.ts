import { appEngine } from './appEngine';
import { MarkdownEngine, type MarkdownDocument, type MarkdownDocumentContext, type MarkdownExtension } from './MarkdownEngine';
import { abcExtension } from './markdown/extensions/abc/extension';
import { graphvizExtension } from './markdown/extensions/graphviz/extension';
import { mapsExtension } from './markdown/extensions/maps/extension';
import { mathJSLabExtension } from './markdown/extensions/mathjslab/extension';
import { createBrowserMathJSLabWorkerExecutor } from './markdown/extensions/mathjslab/browserWorkerExecutor';
import { MarkdownNavigator } from './markdown/MarkdownNavigator';
import { mermaidExtension } from './markdown/extensions/mermaid/extension';
import { model3DExtension } from './markdown/extensions/model-3d/extension';
import { molecule3DExtension } from './markdown/extensions/molecule-3d/extension';
import { smilesExtension } from './markdown/extensions/smiles/extension';
import { vegaLiteExtension } from './markdown/extensions/vega-lite/extension';
import { verovioExtension } from './markdown/extensions/verovio/extension';
import type { MarkedOptions } from 'marked';
import { withActiveInterpreter } from './InterpreterRuntime';

const engine = new MarkdownEngine({
    extensions: [
        mermaidExtension(),
        smilesExtension(),
        graphvizExtension(),
        abcExtension(),
        verovioExtension(),
        vegaLiteExtension(),
        mapsExtension(),
        molecule3DExtension(),
        model3DExtension(),
        mathJSLabExtension(
            createBrowserMathJSLabWorkerExecutor({
                toMathML: (source, display) => withActiveInterpreter(appEngine.interpreter, () => appEngine.interpreter.ToMathML(source, display)),
                timeoutMs: 10000,
            }),
        ),
    ],
});

/**
 * Backward-compatible facade for the application Markdown engine.
 */
abstract class Markdown {
    private static readonly navigators = new Map<HTMLElement, MarkdownNavigator>();

    public static initialize(): Promise<void> {
        return engine.initialize();
    }

    public static registerExtension(extension: MarkdownExtension): void {
        engine.registerExtension(extension);
    }

    public static parse(src: string, options?: MarkedOptions<string, string> | null): string {
        return engine.parse(src, options);
    }

    public static renderHTML(src: string, context: MarkdownDocumentContext = {}): Promise<string> {
        return engine.renderHTML(src, context);
    }

    public static typeset(element: ParentNode = document, context: MarkdownDocumentContext = {}): Promise<void> {
        return engine.typeset(element, context);
    }

    public static async render(src: string, container: HTMLElement, context: MarkdownDocumentContext = {}): Promise<void> {
        await this.renderDocument(src, container, context);
    }

    public static async renderDocument(src: string, container: HTMLElement, context: MarkdownDocumentContext = {}): Promise<MarkdownDocument> {
        this.navigators.get(container)?.dispose();
        this.navigators.delete(container);
        const document = await engine.renderDocument(src, container, context);
        if (typeof container.addEventListener === 'function') this.navigators.set(container, new MarkdownNavigator(document));
        return document;
    }

    public static getNavigator(container: HTMLElement): MarkdownNavigator | undefined {
        return this.navigators.get(container);
    }

    public static async dispose(container?: ParentNode): Promise<void> {
        if (container instanceof HTMLElement) {
            this.navigators.get(container)?.dispose();
            this.navigators.delete(container);
        } else if (!container) {
            for (const navigator of this.navigators.values()) navigator.dispose();
            this.navigators.clear();
        }
        await engine.dispose(container);
    }
}

export type {
    MarkdownDiagnostic,
    MarkdownDocument,
    MarkdownDocumentContext,
    MarkdownExecutionPolicies,
    MarkdownExecutionPolicy,
    MarkdownEngineOptions,
    MarkdownEngineServices,
    MarkdownExtension,
    MarkdownExtensionCapability,
    MarkdownExtensionManifest,
    MarkdownFence,
    MarkdownProfile,
    MarkdownRenderMode,
    MarkdownResourcePolicy,
    MarkdownResourceService,
    MarkdownSecurityMode,
} from './MarkdownEngine';
export { MarkdownEngine, markdownProfiles } from './MarkdownEngine';
export { MarkdownNavigator } from './markdown/MarkdownNavigator';
export { createMarkdownOutline, MarkdownDocumentModel } from './markdown/MarkdownDocumentModel';
export { MarkdownDocumentController } from './markdown/MarkdownDocumentController';
export type { MarkdownControllerSnapshot, MarkdownControllerState, MarkdownDocumentControllerOptions } from './markdown/MarkdownDocumentController';
export type {
    MarkdownCollectionManifest,
    MarkdownCollectionTocItem,
    MarkdownDocumentMetadata,
    MarkdownDocumentNode,
    MarkdownDocumentNodeDefinition,
    MarkdownGroup,
    MarkdownGroupDefinition,
    MarkdownOutlineItem,
    MarkdownOutlineOptions,
    MarkdownPage,
    MarkdownPageDefinition,
} from './markdown/MarkdownDocumentModel';
export type { MarkdownNavigationBehavior, MarkdownNavigationChange, MarkdownNavigationEntry, MarkdownNavigationOptions, MarkdownNavigationState } from './markdown/MarkdownNavigator';
export { abcExtension } from './markdown/extensions/abc/extension';
export { abcManifest } from './markdown/extensions/abc/manifest';
export { graphvizExtension } from './markdown/extensions/graphviz/extension';
export { graphvizManifest } from './markdown/extensions/graphviz/manifest';
export { headingIdsExtension } from './markdown/extensions/heading-ids/extension';
export { headingIdsManifest } from './markdown/extensions/heading-ids/manifest';
export { mathJSLabExtension } from './markdown/extensions/mathjslab/extension';
export { mathJSLabManifest } from './markdown/extensions/mathjslab/manifest';
export type {
    MathJSLabExecutionResult,
    MathJSLabExecutionSession,
    MathJSLabExecutionStatus,
    MathJSLabExecutor,
    MathJSLabHTMLOutput,
    MathJSLabMathMLOutput,
    MathJSLabNodeOutput,
    MathJSLabOutput,
    MathJSLabOutputState,
    MathJSLabParseResult,
    MathJSLabStatementContext,
    MathJSLabTextOutput,
} from './markdown/extensions/mathjslab/executor';
export { createTransportMathJSLabExecutor } from './markdown/extensions/mathjslab/transportExecutor';
export type { MathJSLabTransportExecutorOptions, MathJSLabTransportRequestOptions, MathJSLabWorkerTransport } from './markdown/extensions/mathjslab/transportExecutor';
export { createWorkerMathJSLabTransport, WorkerMathJSLabTransport } from './markdown/extensions/mathjslab/workerTransport';
export type { MathJSLabWorkerEndpoint, MathJSLabWorkerFactory, MathJSLabWorkerResourceReader, MathJSLabWorkerTransportOptions } from './markdown/extensions/mathjslab/workerTransport';
export { MathJSLabWorkerRuntime } from './markdown/extensions/mathjslab/workerRuntime';
export type { MathJSLabWorkerResources, MathJSLabWorkerRuntimeHandler, MathJSLabWorkerScope, MathJSLabWorkerSession } from './markdown/extensions/mathjslab/workerRuntime';
export { deserializeMathJSLabWorkerError, mathJSLabWorkerProtocolVersion, serializeMathJSLabWorkerError, snapshotMathJSLabContext } from './markdown/extensions/mathjslab/workerProtocol';
export type {
    MathJSLabWorkerCancel,
    MathJSLabWorkerCommand,
    MathJSLabWorkerDocumentContext,
    MathJSLabWorkerError,
    MathJSLabWorkerExecutionResult,
    MathJSLabWorkerInboundMessage,
    MathJSLabWorkerMessage,
    MathJSLabWorkerOutput,
    MathJSLabWorkerOutboundMessage,
    MathJSLabWorkerRequest,
    MathJSLabWorkerRequestId,
    MathJSLabWorkerResourceRequest,
    MathJSLabWorkerResourceResponse,
    MathJSLabWorkerResponse,
    MathJSLabWorkerSessionId,
    MathJSLabWorkerStatementContext,
    MathJSLabWorkerSuccess,
} from './markdown/extensions/mathjslab/workerProtocol';
export { mathJaxExtension } from './markdown/extensions/mathjax/extension';
export { mathJaxManifest } from './markdown/extensions/mathjax/manifest';
export { mapsExtension } from './markdown/extensions/maps/extension';
export { mapsManifest } from './markdown/extensions/maps/manifest';
export { mermaidExtension } from './markdown/extensions/mermaid/extension';
export { mermaidManifest } from './markdown/extensions/mermaid/manifest';
export { model3DExtension } from './markdown/extensions/model-3d/extension';
export { model3DManifest } from './markdown/extensions/model-3d/manifest';
export { molecule3DExtension } from './markdown/extensions/molecule-3d/extension';
export { molecule3DManifest } from './markdown/extensions/molecule-3d/manifest';
export { relativeUrlsExtension } from './markdown/extensions/relative-urls/extension';
export { relativeUrlsManifest } from './markdown/extensions/relative-urls/manifest';
export { smilesExtension } from './markdown/extensions/smiles/extension';
export { smilesManifest } from './markdown/extensions/smiles/manifest';
export { syntaxHighlightExtension } from './markdown/extensions/syntax-highlight/extension';
export { syntaxHighlightManifest } from './markdown/extensions/syntax-highlight/manifest';
export { vegaLiteExtension } from './markdown/extensions/vega-lite/extension';
export { vegaLiteManifest } from './markdown/extensions/vega-lite/manifest';
export { verovioExtension } from './markdown/extensions/verovio/extension';
export { verovioManifest } from './markdown/extensions/verovio/manifest';
export { Markdown, engine as markdownEngine };
export default { Markdown, markdownEngine: engine };
