import type { MarkdownDocument, MarkdownDocumentContext, MarkdownEngine } from '../MarkdownEngine';
import { createMarkdownOutline, type MarkdownDocumentModel, type MarkdownOutlineItem, type MarkdownPage } from './MarkdownDocumentModel';
import { MarkdownNavigator, type MarkdownNavigationOptions, type MarkdownNavigationState } from './MarkdownNavigator';

export type MarkdownControllerState = MarkdownNavigationState | 'uninitialized';
export type MarkdownControllerSnapshot = {
    readonly state: MarkdownControllerState;
    readonly page?: MarkdownPage;
    readonly url?: URL;
    readonly targetUrl?: URL;
    readonly outline: readonly MarkdownOutlineItem[];
    readonly canGoBack: boolean;
    readonly canGoForward: boolean;
    readonly error?: unknown;
};
export type MarkdownDocumentControllerOptions = {
    context?: MarkdownDocumentContext;
    initialPage?: string | URL | MarkdownPage;
    outline?: Parameters<typeof createMarkdownOutline>[1];
    navigation?: Omit<MarkdownNavigationOptions, 'isNavigable' | 'onStateChange' | 'onCurrentChange'>;
    onChange?: (snapshot: MarkdownControllerSnapshot) => void;
};

const linkedSignal = (external?: AbortSignal): { controller: AbortController; unlink: () => void } => {
    const controller = new AbortController();
    if (!external) return { controller, unlink: () => undefined };
    const abort = (): void => controller.abort(external.reason);
    if (external.aborted) abort();
    else external.addEventListener('abort', abort, { once: true });
    return { controller, unlink: () => external.removeEventListener('abort', abort) };
};

export class MarkdownDocumentController {
    private session: MarkdownDocument | undefined;
    private navigator: MarkdownNavigator | undefined;
    private activePage: MarkdownPage | undefined;
    private activeUrl: URL | undefined;
    private targetUrl: URL | undefined;
    private activeOutline: readonly MarkdownOutlineItem[] = [];
    private state: MarkdownControllerState = 'uninitialized';
    private error: unknown = undefined;
    private disposed = false;
    private revision = 0;
    private loadingController: AbortController | undefined;
    private unlinkSignal = (): void => undefined;
    private readonly listeners = new Set<(snapshot: MarkdownControllerSnapshot) => void>();

    public constructor(
        public readonly engine: MarkdownEngine,
        public readonly container: HTMLElement,
        public readonly model: MarkdownDocumentModel,
        private readonly options: MarkdownDocumentControllerOptions = {},
    ) {
        if (options.onChange) this.listeners.add(options.onChange);
    }

    public static async create(
        engine: MarkdownEngine,
        container: HTMLElement,
        model: MarkdownDocumentModel,
        options: MarkdownDocumentControllerOptions = {},
    ): Promise<MarkdownDocumentController> {
        const controller = new MarkdownDocumentController(engine, container, model, options);
        await controller.initialize();
        return controller;
    }

    public get document(): MarkdownDocument | undefined {
        return this.session;
    }

    public get navigation(): MarkdownNavigator | undefined {
        return this.navigator;
    }

    public get snapshot(): MarkdownControllerSnapshot {
        return Object.freeze({
            state: this.state,
            ...(this.activePage ? { page: this.activePage } : {}),
            ...(this.activeUrl ? { url: new URL(this.activeUrl) } : {}),
            ...(this.targetUrl ? { targetUrl: new URL(this.targetUrl) } : {}),
            outline: this.activeOutline,
            canGoBack: this.navigator?.canGoBack ?? false,
            canGoForward: this.navigator?.canGoForward ?? false,
            ...(this.error === undefined ? {} : { error: this.error }),
        });
    }

    public subscribe(listener: (snapshot: MarkdownControllerSnapshot) => void, emitCurrent = true): () => void {
        this.assertActive();
        this.listeners.add(listener);
        if (emitCurrent) listener(this.snapshot);
        return () => this.listeners.delete(listener);
    }

    public async initialize(reference: string | URL | MarkdownPage | undefined = this.options.initialPage): Promise<void> {
        this.assertActive();
        if (this.session) return;
        const target = this.resolveTarget(reference ?? this.model.pages[0]);
        const revision = ++this.revision;
        this.cancelInitialLoad();
        const linked = linkedSignal(this.options.context?.signal);
        this.loadingController = linked.controller;
        this.unlinkSignal = linked.unlink;
        this.setState('loading', target.page, target.url);
        const resources = this.engine.createResourceService();
        const context: MarkdownDocumentContext = { ...this.options.context, sourceUrl: target.url, signal: linked.controller.signal, resources };
        try {
            const source = await resources.readText(target.url, context);
            if (revision !== this.revision || this.disposed || linked.controller.signal.aborted) return;
            const renderContext = { ...this.options.context, sourceUrl: target.url };
            this.session = await this.engine.renderDocument(source, this.container, renderContext);
            if (revision !== this.revision || this.disposed) {
                await this.session.dispose();
                this.session = undefined;
                return;
            }
            this.navigator = new MarkdownNavigator(this.session, {
                ...this.options.navigation,
                isNavigable: (url) => this.model.isNavigable(url),
                onStateChange: (change) => {
                    if (change.state === 'loading') this.setPendingState('loading', change.url);
                    else if (change.state === 'error') this.setPendingState('error', change.url, change.cause);
                },
                onCurrentChange: ({ url }) => this.synchronize(url),
            });
            this.synchronize(target.url);
            if (target.url.hash) await this.navigator.navigate(target.url, { history: 'replace' });
        } catch (cause) {
            if (revision === this.revision && !this.disposed && !linked.controller.signal.aborted) this.setState('error', target.page, target.url, cause);
            throw cause;
        } finally {
            resources.dispose();
            if (this.loadingController === linked.controller) {
                this.loadingController = undefined;
                this.unlinkSignal();
                this.unlinkSignal = () => undefined;
            }
        }
    }

    public async open(reference: string | URL | MarkdownPage): Promise<void> {
        this.assertActive();
        if (!this.session || !this.navigator) return this.initialize(reference);
        const target = this.resolveTarget(reference);
        await this.navigator.navigate(target.url);
    }

    public async back(): Promise<boolean> {
        this.assertActive();
        return (await this.navigator?.back()) ?? false;
    }

    public async forward(): Promise<boolean> {
        this.assertActive();
        return (await this.navigator?.forward()) ?? false;
    }

    public async dispose(): Promise<void> {
        if (this.disposed) return;
        this.disposed = true;
        this.revision++;
        this.cancelInitialLoad();
        this.navigator?.dispose();
        this.navigator = undefined;
        await this.session?.dispose();
        this.session = undefined;
        this.state = 'disposed';
        this.publish();
        this.listeners.clear();
    }

    private resolveTarget(reference: string | URL | MarkdownPage | undefined): { page: MarkdownPage; url: URL } {
        if (!reference) throw new Error('Markdown collection has no pages');
        if (typeof reference !== 'string' && !(reference instanceof URL)) return { page: reference, url: new URL(reference.url) };
        if (reference instanceof URL) {
            const page = this.model.findPage(reference);
            if (!page) throw new Error(`Markdown page is not part of the collection: ${reference.href}`);
            return { page, url: new URL(reference) };
        }
        const hashIndex = reference.indexOf('#');
        const identifier = hashIndex < 0 ? reference : reference.slice(0, hashIndex);
        const pageById = this.model.getPage(identifier);
        if (pageById) {
            const url = new URL(pageById.url);
            if (hashIndex >= 0) url.hash = reference.slice(hashIndex + 1);
            return { page: pageById, url };
        }
        const base = this.activeUrl ?? this.activePage?.url ?? this.model.baseUrl;
        const url = new URL(reference, base);
        const page = this.model.findPage(url);
        if (!page) throw new Error(`Markdown page is not part of the collection: ${url.href}`);
        return { page, url };
    }

    private synchronize(url: URL): void {
        const page = this.model.findPage(url);
        if (!page) return;
        this.activePage = page;
        this.activeUrl = new URL(url);
        this.activeOutline = Object.freeze(createMarkdownOutline(this.container, this.options.outline));
        this.setState('idle', page, url);
    }

    private setState(state: MarkdownControllerState, page?: MarkdownPage, url?: URL, cause?: unknown): void {
        this.state = state;
        this.activePage = page;
        this.activeUrl = url ? new URL(url) : this.activeUrl;
        this.targetUrl = undefined;
        this.error = cause;
        this.publish();
    }

    private setPendingState(state: 'loading' | 'error', targetUrl: URL, cause?: unknown): void {
        this.state = state;
        this.targetUrl = new URL(targetUrl);
        this.error = cause;
        this.publish();
    }

    private publish(): void {
        const snapshot = this.snapshot;
        for (const listener of this.listeners) listener(snapshot);
    }

    private cancelInitialLoad(): void {
        this.loadingController?.abort();
        this.loadingController = undefined;
        this.unlinkSignal();
        this.unlinkSignal = () => undefined;
    }

    private assertActive(): void {
        if (this.disposed) throw new Error('Markdown document controller is disposed');
    }
}
