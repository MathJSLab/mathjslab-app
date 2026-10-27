import { createEducationalMarkdownEngine, MarkdownNavigator, type MarkdownDocument, type MarkdownDocumentContext, type MarkdownExtension } from 'mathjslab-markdown';
import { appEngine } from './appEngine';
import { PlotEngine, type PlotOutputRequest } from './PlotEngine';
import { mathJSLabExtension, createBrowserMathJSLabWorkerExecutor } from 'mathjslab-markdown/mathjslab';
// The package exposes this session-lifetime hook only through its compatibility
// export. Keep it isolated here: abort signals also fire during navigation.
import { onMarkdownDocumentDispose } from 'mathjslab-markdown/compat/markdown/lifecycle';
import type { MarkedOptions } from 'marked';
import { withActiveInterpreter } from './InterpreterRuntime';
import { markdownMapConfiguration } from './MarkdownMapConfiguration';
import { markdownHDLConfiguration } from './MarkdownHDLConfiguration';

declare const __webpack_public_path__: string;

// Follow the loaded bundle, including a deployment subpath.
const hdlConfiguration = markdownHDLConfiguration(new URL('hdl/', new URL(typeof __webpack_public_path__ === 'string' ? __webpack_public_path__ : './', document.baseURI)));

const engine = createEducationalMarkdownEngine({
    features: 'all',
    mapOptions: markdownMapConfiguration,
    executionPolicy: hdlConfiguration.executionPolicy,
    extensions: [
        ...hdlConfiguration.extensions,
        mathJSLabExtension(
            createBrowserMathJSLabWorkerExecutor({
                toMathML: (source, display) => withActiveInterpreter(appEngine.interpreter, () => appEngine.interpreter.ToMathML(source, display)),
                timeoutMs: 10000,
                workerFactory: () => new Worker(new URL('./mathjslab.worker.ts', import.meta.url), { type: 'module', name: 'mathjslab-markdown' }),
                plotRenderer: {
                    render: (container, request) => PlotEngine.render(container, request as PlotOutputRequest),
                    resize: (container) => PlotEngine.resize(container),
                    dispose: (container) => PlotEngine.dispose(container),
                },
            }),
        ),
    ],
});

/**
 * Application Markdown composition and legacy command rendering.
 * Reusable engine APIs are imported directly from mathjslab-markdown.
 */
abstract class Markdown {
    private static readonly navigators = new Map<HTMLElement, MarkdownNavigator>();
    private static readonly navigatorSubscriptions = new Map<HTMLElement, () => void>();
    private static readonly renderRevisions = new Map<HTMLElement, number>();

    private static releaseNavigator(container: HTMLElement): void {
        this.navigatorSubscriptions.get(container)?.();
        this.navigatorSubscriptions.delete(container);
        this.navigators.get(container)?.dispose();
        this.navigators.delete(container);
    }

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
        const revision = (this.renderRevisions.get(container) ?? 0) + 1;
        this.renderRevisions.set(container, revision);
        this.releaseNavigator(container);
        try {
            const rendered = await engine.renderDocument(src, container, context);
            if (this.renderRevisions.get(container) === revision && !rendered.disposed && !rendered.signal.aborted && typeof container.addEventListener === 'function') {
                this.releaseNavigator(container);
                const navigator = new MarkdownNavigator(rendered);
                this.navigators.set(container, navigator);
                this.navigatorSubscriptions.set(
                    container,
                    onMarkdownDocumentDispose(rendered, () => {
                        if (this.navigators.get(container) === navigator) this.releaseNavigator(container);
                    }),
                );
            }
            return rendered;
        } finally {
            if (this.renderRevisions.get(container) === revision) this.renderRevisions.delete(container);
        }
    }

    public static getNavigator(container: HTMLElement): MarkdownNavigator | undefined {
        return this.navigators.get(container);
    }

    public static async dispose(container?: ParentNode): Promise<void> {
        if (container instanceof HTMLElement) {
            this.renderRevisions.set(container, (this.renderRevisions.get(container) ?? 0) + 1);
            this.releaseNavigator(container);
        } else if (!container) {
            for (const element of this.navigators.keys()) {
                this.renderRevisions.set(element, (this.renderRevisions.get(element) ?? 0) + 1);
                this.releaseNavigator(element);
            }
        }
        await engine.dispose(container);
    }
}

export { Markdown, engine as markdownEngine };
