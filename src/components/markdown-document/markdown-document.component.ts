import { MarkdownEngine, type MarkdownDocument, type MarkdownDocumentContext, type MarkdownSecurityMode } from '../../MarkdownEngine';
import { MarkdownDocumentController, type MarkdownControllerSnapshot } from '../../markdown/MarkdownDocumentController';
import {
    createMarkdownOutline,
    MarkdownDocumentModel,
    type MarkdownCollectionManifest,
    type MarkdownCollectionTocItem,
    type MarkdownOutlineItem,
} from '../../markdown/MarkdownDocumentModel';
import { MarkdownNavigator } from '../../markdown/MarkdownNavigator';

export type MarkdownDocumentElementState = 'empty' | 'loading' | 'ready' | 'error';
export type MarkdownDocumentReadyDetail = {
    readonly element: MarkdownDocumentElement;
    readonly document?: MarkdownDocument;
    readonly controller?: MarkdownDocumentController;
    readonly model?: MarkdownDocumentModel;
};
export type MarkdownDocumentStateDetail = { readonly state: MarkdownDocumentElementState; readonly error?: unknown };

type MarkdownDocumentMessages = {
    back: string;
    forward: string;
    previous: string;
    next: string;
    contents: string;
    onThisPage: string;
    sequentialNavigation: string;
    loading: string;
    empty: string;
    loaded: (title: string) => string;
    section: (title: string) => string;
};

const messages: Readonly<Record<'en' | 'es' | 'pt', MarkdownDocumentMessages>> = {
    en: {
        back: 'Back',
        forward: 'Forward',
        previous: 'Previous',
        next: 'Next',
        contents: 'Course contents',
        onThisPage: 'On this page',
        sequentialNavigation: 'Sequential navigation',
        loading: 'Loading…',
        empty: 'No Markdown content.',
        loaded: (title) => `Loaded ${title}`,
        section: (title) => `Section ${title}`,
    },
    es: {
        back: 'Atrás',
        forward: 'Adelante',
        previous: 'Anterior',
        next: 'Siguiente',
        contents: 'Contenido del curso',
        onThisPage: 'En esta página',
        sequentialNavigation: 'Navegación secuencial',
        loading: 'Cargando…',
        empty: 'No hay contenido Markdown.',
        loaded: (title) => `Cargado: ${title}`,
        section: (title) => `Sección: ${title}`,
    },
    pt: {
        back: 'Voltar',
        forward: 'Avançar',
        previous: 'Anterior',
        next: 'Próxima',
        contents: 'Sumário do curso',
        onThisPage: 'Nesta página',
        sequentialNavigation: 'Navegação sequencial',
        loading: 'Carregando…',
        empty: 'Nenhum conteúdo Markdown.',
        loaded: (title) => `Carregado: ${title}`,
        section: (title) => `Seção: ${title}`,
    },
};

const template = document.createElement('template');
template.innerHTML = `
<style>
    :host { box-sizing: border-box; container-type: inline-size; display: block; max-width: 100%; min-width: 0; width: 100%; }
    *, *::before, *::after { box-sizing: inherit; }
    [part="root"] { max-width: 100%; min-width: 0; }
    [part="status"] { padding: 0.75rem; }
    [part="announcer"] { clip: rect(0 0 0 0); clip-path: inset(50%); height: 1px; overflow: hidden; position: absolute; white-space: nowrap; width: 1px; }
    :host([state="ready"]) [part="status"] { display: none; }
    [part="layout"] { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr); max-width: 100%; }
    [part="layout"]:has(> [part="collection"]:not([hidden])) { grid-template-columns: minmax(11rem, 16rem) minmax(0, 1fr); }
    [part="layout"]:has(> [part="page-outline"]:not([hidden])) { grid-template-columns: minmax(0, 1fr) minmax(10rem, 14rem); }
    [part="layout"]:has(> [part="collection"]:not([hidden])):has(> [part="page-outline"]:not([hidden])) { grid-template-columns: minmax(11rem, 16rem) minmax(0, 1fr) minmax(10rem, 14rem); }
    [part="main"] { min-width: 0; }
    [part="collection"], [part="page-outline"] { align-self: start; max-height: 100vh; overflow: auto; position: sticky; top: 0; }
    [part="toolbar"], [part="sequence"] { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: space-between; margin-block: 0 1rem; }
    [part="sequence"] { margin-block: 1rem 0; }
    [part="history"] { display: flex; gap: 0.25rem; }
    button { background: var(--markdown-control-background, transparent); border: 1px solid var(--markdown-border-color, currentColor); border-radius: 0.25rem; color: inherit; cursor: pointer; font: inherit; padding: 0.35rem 0.6rem; text-align: start; }
    button:disabled { cursor: default; opacity: 0.45; }
    button[aria-current="page"], a[aria-current="location"] { background: var(--markdown-active-background, color-mix(in srgb, currentColor 12%, transparent)); font-weight: 600; }
    nav ul { list-style: none; margin: 0; padding-inline-start: 0.8rem; }
    nav > ul { padding-inline-start: 0; }
    [part="group-label"] { display: block; font-weight: 600; margin-block-start: 0.5rem; }
    [part="outline-link"] { color: inherit; display: block; padding: 0.2rem 0.35rem; text-decoration: none; }
    [part="content"] { max-width: 100%; min-width: 0; overflow-wrap: anywhere; }
    [part="content"] img, [part="content"] svg, [part="content"] canvas { max-width: 100%; }
    [part="content"] pre, [part="content"] table { max-width: 100%; overflow: auto; }
    :host([outline="hidden"]) [part="page-outline"] { display: none !important; }
    :host([outline="hidden"]) [part="layout"] { grid-template-columns: minmax(0, 1fr); }
    :host([outline="hidden"]) [part="layout"]:has(> [part="collection"]:not([hidden])) { grid-template-columns: minmax(11rem, 16rem) minmax(0, 1fr); }
    :host([outline="inline"]) [part="layout"] { grid-template-columns: minmax(0, 1fr); }
    :host([outline="inline"]) [part="main"] { display: contents; }
    :host([outline="inline"]) [part="toolbar"] { order: 1; }
    :host([outline="inline"]) [part="collection"] { max-height: none; order: 2; position: static; }
    :host([outline="inline"]) [part="page-outline"] { max-height: none; order: 3; position: static; }
    :host([outline="inline"]) [part="content"] { min-width: 0; order: 4; }
    :host([outline="inline"]) [part="sequence"] { order: 5; }
    :host([presentation="embedded"]) [part="layout"] { display: block; }
    :host([presentation="embedded"]) [part="collection"],
    :host([presentation="embedded"]) [part="page-outline"],
    :host([presentation="embedded"]) [part="toolbar"],
    :host([presentation="embedded"]) [part="sequence"] { display: none !important; }
    [hidden] { display: none !important; }
    @container (max-width: 54rem) {
        [part="layout"] { grid-template-columns: minmax(0, 1fr); }
        [part="collection"], [part="page-outline"] { max-height: none; position: static; }
        [part="collection"] { order: 1; }
        [part="main"] { order: 2; }
        [part="page-outline"] { order: 3; }
    }
    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
    }
</style>
<section part="root">
    <div part="status" role="status" aria-live="polite">No Markdown content.</div>
    <div part="announcer" aria-live="polite" aria-atomic="true"></div>
    <div part="layout">
        <nav part="collection" aria-label="Course contents" hidden></nav>
        <div part="main">
            <div part="toolbar" hidden>
                <div part="history">
                    <button part="back-button" type="button" data-action="back">Back</button>
                    <button part="forward-button" type="button" data-action="forward">Forward</button>
                </div>
            </div>
            <article part="content" tabindex="-1"></article>
            <nav part="sequence" aria-label="Sequential navigation" hidden>
                <button part="previous-button" type="button" data-action="previous"></button>
                <button part="next-button" type="button" data-action="next"></button>
            </nav>
        </div>
        <nav part="page-outline" aria-label="On this page" hidden></nav>
    </div>
</section>`;

const securityMode = (value: string | null): MarkdownSecurityMode | undefined => (value === 'trusted' || value === 'sanitized' || value === 'strict' ? value : undefined);
const isAbsoluteReference = (reference: string): boolean => /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference);

export class MarkdownDocumentElement extends HTMLElement {
    public static readonly tagName = 'markdown-document';
    public static readonly observedAttributes = ['src', 'manifest', 'initial-page', 'security', 'locale', 'theme'];

    private readonly contentElement: HTMLElement;
    private readonly statusElement: HTMLElement;
    private readonly announcerElement: HTMLElement;
    private readonly collectionElement: HTMLElement;
    private readonly outlineElement: HTMLElement;
    private readonly toolbarElement: HTMLElement;
    private readonly sequenceElement: HTMLElement;
    private readonly backButton: HTMLButtonElement;
    private readonly forwardButton: HTMLButtonElement;
    private readonly previousButton: HTMLButtonElement;
    private readonly nextButton: HTMLButtonElement;
    private internalEngine = new MarkdownEngine();
    private suppliedEngine: MarkdownEngine | undefined;
    private suppliedContext: MarkdownDocumentContext = {};
    private markdownSource: string | undefined;
    private manifestValue: MarkdownCollectionManifest | undefined;
    private activeDocument: MarkdownDocument | undefined;
    private activeNavigator: MarkdownNavigator | undefined;
    private activeController: MarkdownDocumentController | undefined;
    private activeModel: MarkdownDocumentModel | undefined;
    private operation = 0;
    private loadController: AbortController | undefined;
    private currentState: MarkdownDocumentElementState = 'empty';
    private lastSnapshot: MarkdownControllerSnapshot | undefined;
    private standaloneOutline: readonly MarkdownOutlineItem[] = [];
    private activeFragment = '';
    private sectionObserver: IntersectionObserver | undefined;
    private readonly sectionEntries = new Map<Element, IntersectionObserverEntry>();
    private lastNavigationUrl: URL | undefined;
    private sectionObservationPausedUntil = 0;

    public constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.append(template.content.cloneNode(true));
        this.contentElement = shadow.querySelector<HTMLElement>('[part="content"]')!;
        this.statusElement = shadow.querySelector<HTMLElement>('[part="status"]')!;
        this.announcerElement = shadow.querySelector<HTMLElement>('[part="announcer"]')!;
        this.collectionElement = shadow.querySelector<HTMLElement>('[part="collection"]')!;
        this.outlineElement = shadow.querySelector<HTMLElement>('[part="page-outline"]')!;
        this.toolbarElement = shadow.querySelector<HTMLElement>('[part="toolbar"]')!;
        this.sequenceElement = shadow.querySelector<HTMLElement>('[part="sequence"]')!;
        this.backButton = shadow.querySelector<HTMLButtonElement>('[data-action="back"]')!;
        this.forwardButton = shadow.querySelector<HTMLButtonElement>('[data-action="forward"]')!;
        this.previousButton = shadow.querySelector<HTMLButtonElement>('[data-action="previous"]')!;
        this.nextButton = shadow.querySelector<HTMLButtonElement>('[data-action="next"]')!;
        shadow.addEventListener('click', this.handleNavigationClick);
        shadow.addEventListener('keydown', this.handleKeyDown);
        this.localize();
    }

    public get engine(): MarkdownEngine {
        return this.suppliedEngine ?? this.internalEngine;
    }

    public set engine(value: MarkdownEngine) {
        if (value === this.suppliedEngine) return;
        this.suppliedEngine = value;
        this.requestLoad();
    }

    public get context(): MarkdownDocumentContext {
        return this.suppliedContext;
    }

    public set context(value: MarkdownDocumentContext) {
        this.suppliedContext = value;
        this.requestLoad();
    }

    public get markdown(): string | undefined {
        return this.markdownSource;
    }

    public set markdown(value: string | undefined) {
        this.markdownSource = value;
        if (value !== undefined) this.manifestValue = undefined;
        this.requestLoad();
    }

    public get manifest(): MarkdownCollectionManifest | undefined {
        return this.manifestValue;
    }

    public set manifest(value: MarkdownCollectionManifest | undefined) {
        this.manifestValue = value;
        if (value !== undefined) this.markdownSource = undefined;
        this.requestLoad();
    }

    public get src(): string | null {
        return this.getAttribute('src');
    }

    public set src(value: string | null) {
        if (value === null) this.removeAttribute('src');
        else this.setAttribute('src', value);
    }

    public get state(): MarkdownDocumentElementState {
        return this.currentState;
    }

    public get documentSession(): MarkdownDocument | undefined {
        return this.activeController?.document ?? this.activeDocument;
    }

    public get controller(): MarkdownDocumentController | undefined {
        return this.activeController;
    }

    public get model(): MarkdownDocumentModel | undefined {
        return this.activeModel;
    }

    public connectedCallback(): void {
        this.requestLoad();
    }

    public disconnectedCallback(): void {
        this.loadController?.abort();
        void this.release(++this.operation);
    }

    public attributeChangedCallback(name: string, previous: string | null, value: string | null): void {
        if (previous === value) return;
        if (name === 'locale') {
            this.localize();
            if (this.lastSnapshot) this.renderControllerNavigation(this.lastSnapshot);
            else if (this.activeDocument) this.renderStandaloneNavigation(this.activeDocument.sourceUrl);
            return;
        }
        this.requestLoad();
    }

    public async reload(): Promise<void> {
        if (!this.isConnected) return;
        const revision = ++this.operation;
        this.loadController?.abort();
        this.loadController = new AbortController();
        await this.release(revision, false);
        if (revision !== this.operation || !this.isConnected) return;
        const context = this.createContext(this.loadController.signal);
        this.setState('loading');
        try {
            if (this.manifestValue) await this.loadManifest(revision, context);
            else if (this.markdownSource !== undefined) await this.loadText(this.markdownSource, context);
            else if (this.hasAttribute('manifest')) await this.loadManifest(revision, context);
            else if (this.src) await this.loadSource(this.src, revision, context);
            else {
                this.contentElement.replaceChildren();
                this.setState('empty');
                return;
            }
            if (revision !== this.operation || context.signal?.aborted) return;
            this.setState('ready');
            this.dispatchEvent(
                new CustomEvent<MarkdownDocumentReadyDetail>('markdown-ready', {
                    detail: {
                        element: this,
                        ...(this.documentSession ? { document: this.documentSession } : {}),
                        ...(this.activeController ? { controller: this.activeController } : {}),
                        ...(this.activeModel ? { model: this.activeModel } : {}),
                    },
                    bubbles: true,
                    composed: true,
                }),
            );
        } catch (error) {
            if (revision !== this.operation || context.signal?.aborted) return;
            this.setState('error', error);
            this.dispatchEvent(new CustomEvent('markdown-error', { detail: { error }, bubbles: true, composed: true }));
        }
    }

    public async dispose(): Promise<void> {
        const revision = ++this.operation;
        this.loadController?.abort();
        await this.release(revision);
        this.setState('empty');
    }

    private requestLoad(): void {
        if (!this.isConnected) return;
        queueMicrotask(() => {
            if (this.isConnected) void this.reload();
        });
    }

    private async loadText(source: string, context: MarkdownDocumentContext): Promise<void> {
        this.activeDocument = await this.engine.renderDocument(source, this.contentElement, context);
        this.prepareLinkTargets();
        this.activeNavigator = new MarkdownNavigator(this.activeDocument, {
            ...(this.getAttribute('presentation') === 'embedded'
                ? {
                      isNavigable: (_url: URL, _current: URL, anchor?: HTMLAnchorElement) =>
                          Boolean(anchor && !isAbsoluteReference(anchor.getAttribute('data-markdown-source-href') ?? anchor.getAttribute('href') ?? '')),
                  }
                : {}),
            scrollToFragment: (_fragment, target) => this.scrollTarget(target),
            onStateChange: ({ state, cause }) => {
                if (state === 'loading') this.setState('loading');
                else if (state === 'error') this.setState('error', cause);
            },
            onCurrentChange: ({ url }) => {
                this.prepareLinkTargets();
                const changedDocument = this.lastNavigationUrl !== undefined && this.documentChanged(this.lastNavigationUrl, url);
                this.renderStandaloneNavigation(url);
                if (changedDocument) this.focusDocument();
                else if (this.activeFragment) this.announceSection(this.activeFragment);
                this.dispatchNavigation(url);
            },
        });
        this.renderStandaloneNavigation(this.activeDocument.sourceUrl);
    }

    private prepareLinkTargets(): void {
        if (this.getAttribute('presentation') !== 'embedded' && this.getAttribute('external-links') !== 'new-tab') return;
        for (const anchor of this.contentElement.querySelectorAll<HTMLAnchorElement>('a[href]')) {
            const reference = anchor.getAttribute('data-markdown-source-href') ?? anchor.getAttribute('href') ?? '';
            if (!isAbsoluteReference(reference)) continue;
            anchor.target = '_blank';
            const rel = new Set((anchor.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
            rel.add('noopener');
            rel.add('noreferrer');
            anchor.setAttribute('rel', [...rel].join(' '));
        }
    }

    private async loadSource(reference: string, revision: number, context: MarkdownDocumentContext): Promise<void> {
        const resources = this.engine.createResourceService();
        try {
            const url = resources.resolve(reference, context);
            const source = await resources.readText(url, { ...context, sourceUrl: url, resources });
            if (revision !== this.operation || context.signal?.aborted) return;
            await this.loadText(source, { ...context, sourceUrl: url });
        } finally {
            resources.dispose();
        }
    }

    private async loadManifest(revision: number, context: MarkdownDocumentContext): Promise<void> {
        let manifest = this.manifestValue;
        let manifestUrl: URL | undefined;
        if (!manifest) {
            const reference = this.getAttribute('manifest');
            if (!reference) throw new Error('Markdown manifest URL is empty');
            const resources = this.engine.createResourceService();
            try {
                manifestUrl = resources.resolve(reference, context);
                manifest = JSON.parse(await resources.readText(manifestUrl, { ...context, sourceUrl: manifestUrl, resources })) as MarkdownCollectionManifest;
            } finally {
                resources.dispose();
            }
        }
        if (revision !== this.operation || context.signal?.aborted) return;
        this.activeModel = new MarkdownDocumentModel(manifest, manifestUrl ?? context.sourceUrl ?? document.baseURI);
        this.activeController = await MarkdownDocumentController.create(this.engine, this.contentElement, this.activeModel, {
            context,
            ...(this.getAttribute('initial-page') ? { initialPage: this.getAttribute('initial-page')! } : {}),
            navigation: { scrollToFragment: (_fragment, target) => this.scrollTarget(target) },
            onChange: (snapshot) => this.handleControllerChange(snapshot),
        });
    }

    private createContext(signal: AbortSignal): MarkdownDocumentContext {
        const mode = securityMode(this.getAttribute('security'));
        const locale = this.getAttribute('locale') ?? undefined;
        const themeValue = this.getAttribute('theme');
        const theme = themeValue === 'light' || themeValue === 'dark' ? themeValue : undefined;
        return {
            ...this.suppliedContext,
            signal,
            ...(mode ? { securityMode: mode } : {}),
            ...(locale ? { locale } : {}),
            ...(theme ? { theme } : {}),
        };
    }

    private handleControllerChange(snapshot: MarkdownControllerSnapshot): void {
        if (snapshot.state === 'loading') this.setState('loading');
        else if (snapshot.state === 'error') this.setState('error', snapshot.error);
        else if (snapshot.state === 'idle') {
            const previous = this.lastSnapshot;
            const changedPage = previous !== undefined && previous.page?.id !== snapshot.page?.id;
            const changedFragment = previous !== undefined && this.fragment(previous.url) !== this.fragment(snapshot.url);
            this.lastSnapshot = snapshot;
            if (previous === undefined || changedPage) this.pauseSectionObservation();
            this.renderControllerNavigation(snapshot);
            this.setState('ready');
            if (changedPage) this.focusDocument();
            if (changedFragment && !changedPage && this.activeFragment) this.announceSection(this.activeFragment);
            else this.announce(this.dictionary.loaded(snapshot.page?.title ?? this.contentElement.querySelector('h1')?.textContent?.trim() ?? 'Markdown'));
            if (snapshot.url) this.dispatchNavigation(snapshot.url, snapshot);
        }
    }

    private dispatchNavigation(url: URL, snapshot?: MarkdownControllerSnapshot): void {
        this.dispatchEvent(new CustomEvent('markdown-navigate', { detail: { url: new URL(url), ...(snapshot ? { snapshot } : {}) }, bubbles: true, composed: true }));
    }

    private async release(revision: number, clear = true): Promise<void> {
        const controller = this.activeController;
        const navigator = this.activeNavigator;
        const documentSession = this.activeDocument;
        this.activeController = undefined;
        this.activeNavigator = undefined;
        this.activeDocument = undefined;
        this.activeModel = undefined;
        this.lastSnapshot = undefined;
        this.lastNavigationUrl = undefined;
        this.standaloneOutline = [];
        this.disconnectSectionObserver();
        this.resetNavigation();
        navigator?.dispose();
        await controller?.dispose();
        await documentSession?.dispose();
        if (clear && revision === this.operation) this.contentElement.replaceChildren();
    }

    private setState(state: MarkdownDocumentElementState, error?: unknown): void {
        this.currentState = state;
        this.setAttribute('state', state);
        this.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
        this.statusElement.textContent =
            state === 'loading' ? this.dictionary.loading : state === 'error' ? (error instanceof Error ? error.message : String(error)) : state === 'empty' ? this.dictionary.empty : '';
        this.dispatchEvent(
            new CustomEvent<MarkdownDocumentStateDetail>('markdown-state-change', {
                detail: { state, ...(error === undefined ? {} : { error }) },
                bubbles: true,
                composed: true,
            }),
        );
    }

    private readonly handleNavigationClick = (event: Event): void => {
        const target = event
            .composedPath()
            .find((node) => node instanceof HTMLElement && (node.hasAttribute('data-action') || node.hasAttribute('data-page-id') || node.hasAttribute('data-fragment')));
        if (!(target instanceof HTMLElement)) return;
        const action = target.getAttribute('data-action');
        const pageId = target.getAttribute('data-page-id');
        const fragment = target.getAttribute('data-fragment');
        if (!action && !pageId && fragment === null) return;
        event.preventDefault();
        if (action) this.runAction(action);
        else if (pageId) void this.navigateAction(() => this.activeController?.open(pageId));
        else if (fragment !== null) void this.openFragment(fragment);
    };

    private readonly handleKeyDown = (input: Event): void => {
        const event = input as KeyboardEvent;
        if (event.defaultPrevented) return;
        const origin = event.composedPath()[0];
        if (!(origin instanceof HTMLElement) || origin.matches('input, textarea, select') || origin.isContentEditable) return;
        if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            const action = event.key === 'ArrowLeft' ? 'back' : event.key === 'ArrowRight' ? 'forward' : event.key === 'PageUp' ? 'previous' : event.key === 'PageDown' ? 'next' : undefined;
            if (action) {
                event.preventDefault();
                this.runAction(action);
            }
            return;
        }
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        const navigation = origin.closest<HTMLElement>('nav');
        if (!navigation || (navigation !== this.collectionElement && navigation !== this.outlineElement)) return;
        const controls = Array.from(navigation.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')).filter((control) => !control.hidden);
        const index = controls.indexOf(origin);
        if (index < 0 || controls.length === 0) return;
        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + controls.length) % controls.length;
        controls[nextIndex]?.focus();
    };

    private runAction(action: string): void {
        if (action === 'back') void this.navigateAction(() => this.activeController?.back() ?? this.activeNavigator?.back());
        else if (action === 'forward') void this.navigateAction(() => this.activeController?.forward() ?? this.activeNavigator?.forward());
        else if (action === 'previous' || action === 'next') {
            const page = action === 'previous' ? this.model?.previous(this.lastSnapshot?.page ?? '') : this.model?.next(this.lastSnapshot?.page ?? '');
            if (page) void this.navigateAction(() => this.activeController?.open(page));
        }
    }

    private async navigateAction(action: () => Promise<unknown> | undefined): Promise<void> {
        try {
            await action();
        } catch (error) {
            this.setState('error', error);
        }
    }

    private async openFragment(fragment: string): Promise<void> {
        this.activeFragment = fragment;
        if (this.activeController && this.lastSnapshot?.url) {
            const url = new URL(this.lastSnapshot.url);
            url.hash = fragment;
            await this.navigateAction(() => this.activeController?.open(url));
            return;
        }
        if (this.activeNavigator && this.activeDocument?.sourceUrl) {
            await this.navigateAction(() => this.activeNavigator?.navigate(`#${fragment}`));
            return;
        }
        const heading = Array.from(this.contentElement.querySelectorAll('[id]')).find(({ id }) => id === fragment);
        this.scrollTarget(heading);
        this.updateActiveSection();
        this.announceSection(fragment);
    }

    private renderControllerNavigation(snapshot: MarkdownControllerSnapshot): void {
        this.activeFragment = this.fragment(snapshot.url);
        this.renderCollection(this.activeModel?.tableOfContents ?? [], snapshot.page?.id);
        this.renderOutline(snapshot.outline, this.activeFragment);
        this.backButton.disabled = !snapshot.canGoBack;
        this.forwardButton.disabled = !snapshot.canGoForward;
        this.toolbarElement.hidden = false;
        const previous = snapshot.page ? this.activeModel?.previous(snapshot.page) : undefined;
        const next = snapshot.page ? this.activeModel?.next(snapshot.page) : undefined;
        this.previousButton.hidden = !previous;
        this.previousButton.textContent = previous ? `${this.dictionary.previous}: ${previous.title}` : '';
        this.nextButton.hidden = !next;
        this.nextButton.textContent = next ? `${this.dictionary.next}: ${next.title}` : '';
        this.sequenceElement.hidden = !previous && !next;
        this.toggleNavigationAttribute();
    }

    private renderStandaloneNavigation(url?: URL): void {
        this.standaloneOutline = Object.freeze(createMarkdownOutline(this.contentElement));
        this.activeFragment = this.fragment(url);
        this.renderCollection([], undefined);
        this.renderOutline(this.standaloneOutline, this.activeFragment);
        this.backButton.disabled = !(this.activeNavigator?.canGoBack ?? false);
        this.forwardButton.disabled = !(this.activeNavigator?.canGoForward ?? false);
        this.toolbarElement.hidden = !this.activeDocument?.sourceUrl && this.getAttribute('outline') !== 'inline';
        this.sequenceElement.hidden = true;
        this.lastNavigationUrl = url ? new URL(url) : undefined;
        this.toggleNavigationAttribute();
    }

    private renderCollection(items: readonly MarkdownCollectionTocItem[], activePageId?: string): void {
        this.collectionElement.replaceChildren();
        this.collectionElement.hidden = items.length === 0;
        if (!items.length) return;
        const title = document.createElement('h2');
        title.textContent = this.activeModel?.title ?? this.dictionary.contents;
        this.collectionElement.append(title, this.collectionList(items, activePageId));
    }

    private collectionList(items: readonly MarkdownCollectionTocItem[], activePageId?: string): HTMLUListElement {
        const list = document.createElement('ul');
        for (const item of items) {
            const row = document.createElement('li');
            if (item.type === 'page') {
                const button = document.createElement('button');
                button.type = 'button';
                button.setAttribute('part', 'page-link');
                button.setAttribute('data-page-id', item.id);
                button.textContent = item.title;
                if (item.id === activePageId) button.setAttribute('aria-current', 'page');
                row.append(button);
            } else {
                const label = document.createElement('span');
                label.setAttribute('part', 'group-label');
                label.textContent = item.title;
                row.append(label);
            }
            if (item.children.length) row.append(this.collectionList(item.children, activePageId));
            list.append(row);
        }
        return list;
    }

    private renderOutline(items: readonly MarkdownOutlineItem[], activeFragment: string): void {
        this.outlineElement.replaceChildren();
        this.outlineElement.hidden = items.length === 0;
        if (!items.length) {
            this.disconnectSectionObserver();
            return;
        }
        const title = document.createElement('h2');
        title.textContent = this.dictionary.onThisPage;
        this.outlineElement.append(title, this.outlineList(items, activeFragment));
        this.observeSections(items);
    }

    private outlineList(items: readonly MarkdownOutlineItem[], activeFragment: string): HTMLUListElement {
        const list = document.createElement('ul');
        for (const item of items) {
            const row = document.createElement('li');
            const link = document.createElement('a');
            link.href = item.href;
            link.setAttribute('part', 'outline-link');
            link.setAttribute('data-fragment', item.id);
            link.textContent = item.title;
            if (item.id === activeFragment) link.setAttribute('aria-current', 'location');
            row.append(link);
            if (item.children.length) row.append(this.outlineList(item.children, activeFragment));
            list.append(row);
        }
        return list;
    }

    private get dictionary(): MarkdownDocumentMessages {
        const requested = (this.getAttribute('locale') ?? this.suppliedContext.locale ?? globalThis.navigator?.language ?? 'en').toLowerCase().split('-')[0];
        return requested === 'pt' || requested === 'es' ? messages[requested] : messages.en;
    }

    private localize(): void {
        const dictionary = this.dictionary;
        this.backButton.textContent = dictionary.back;
        this.forwardButton.textContent = dictionary.forward;
        this.backButton.setAttribute('aria-label', dictionary.back);
        this.forwardButton.setAttribute('aria-label', dictionary.forward);
        this.previousButton.setAttribute('aria-label', dictionary.previous);
        this.nextButton.setAttribute('aria-label', dictionary.next);
        this.backButton.setAttribute('aria-keyshortcuts', 'Alt+ArrowLeft');
        this.forwardButton.setAttribute('aria-keyshortcuts', 'Alt+ArrowRight');
        this.previousButton.setAttribute('aria-keyshortcuts', 'Alt+PageUp');
        this.nextButton.setAttribute('aria-keyshortcuts', 'Alt+PageDown');
        this.collectionElement.setAttribute('aria-label', dictionary.contents);
        this.outlineElement.setAttribute('aria-label', dictionary.onThisPage);
        this.sequenceElement.setAttribute('aria-label', dictionary.sequentialNavigation);
        if (this.currentState === 'empty') this.statusElement.textContent = dictionary.empty;
        else if (this.currentState === 'loading') this.statusElement.textContent = dictionary.loading;
    }

    private announce(value: string): void {
        this.announcerElement.textContent = '';
        queueMicrotask(() => {
            if (this.isConnected) this.announcerElement.textContent = value;
        });
    }

    private announceSection(fragment: string): void {
        const heading = Array.from(this.contentElement.querySelectorAll<HTMLElement>('[id]')).find(({ id }) => id === fragment);
        const title =
            heading?.textContent?.trim() ??
            Array.from(this.outlineElement.querySelectorAll<HTMLElement>('[data-fragment]'))
                .find((link) => link.dataset.fragment === fragment)
                ?.textContent?.trim();
        if (title) this.announce(this.dictionary.section(title));
    }

    private focusDocument(): void {
        queueMicrotask(() => {
            if (!this.isConnected) return;
            const target = this.contentElement.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6') ?? this.contentElement;
            if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
            target.focus({ preventScroll: true });
            this.scrollTarget(target);
        });
    }

    private scrollTarget(target: Element | null | undefined): void {
        if (!(target instanceof HTMLElement) && !(target instanceof SVGElement)) return;
        this.pauseSectionObservation();
        const reduceMotion = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView?.({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    private pauseSectionObservation(): void {
        this.sectionObservationPausedUntil = Date.now() + 1_200;
    }

    private documentChanged(previous: URL, current: URL): boolean {
        const left = new URL(previous);
        const right = new URL(current);
        left.hash = '';
        right.hash = '';
        return left.href !== right.href;
    }

    private observeSections(items: readonly MarkdownOutlineItem[]): void {
        this.disconnectSectionObserver();
        if (typeof globalThis.IntersectionObserver !== 'function') return;
        this.sectionObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) this.sectionEntries.set(entry.target, entry);
                if (Date.now() < this.sectionObservationPausedUntil) return;
                const visible = Array.from(this.sectionEntries.values())
                    .filter((entry) => entry.isIntersecting)
                    .sort((left, right) => Math.abs(left.boundingClientRect?.top ?? 0) - Math.abs(right.boundingClientRect?.top ?? 0))[0];
                const fragment = visible?.target.id;
                if (!fragment || fragment === this.activeFragment) return;
                this.activeFragment = fragment;
                this.updateActiveSection();
                this.announceSection(fragment);
            },
            { rootMargin: '0px 0px -65% 0px', threshold: [0, 1] },
        );
        for (const item of this.flattenOutline(items)) {
            const heading = Array.from(this.contentElement.querySelectorAll<HTMLElement>('[id]')).find(({ id }) => id === item.id);
            if (heading) this.sectionObserver.observe(heading);
        }
    }

    private flattenOutline(items: readonly MarkdownOutlineItem[]): readonly MarkdownOutlineItem[] {
        return items.flatMap((item) => [item, ...this.flattenOutline(item.children)]);
    }

    private updateActiveSection(): void {
        for (const link of this.outlineElement.querySelectorAll<HTMLElement>('[data-fragment]')) {
            if (link.dataset.fragment === this.activeFragment) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        }
    }

    private disconnectSectionObserver(): void {
        this.sectionObserver?.disconnect();
        this.sectionObserver = undefined;
        this.sectionEntries.clear();
    }

    private resetNavigation(): void {
        this.collectionElement.replaceChildren();
        this.outlineElement.replaceChildren();
        this.collectionElement.hidden = true;
        this.outlineElement.hidden = true;
        this.toolbarElement.hidden = true;
        this.sequenceElement.hidden = true;
        this.removeAttribute('has-navigation');
    }

    private toggleNavigationAttribute(): void {
        this.toggleAttribute('has-navigation', !this.collectionElement.hidden || !this.outlineElement.hidden || !this.toolbarElement.hidden || !this.sequenceElement.hidden);
    }

    private fragment(url?: URL): string {
        if (!url?.hash) return '';
        try {
            return decodeURIComponent(url.hash.slice(1));
        } catch {
            return url.hash.slice(1);
        }
    }
}

export const defineMarkdownDocumentElement = (tagName = MarkdownDocumentElement.tagName): void => {
    if (!customElements.get(tagName)) customElements.define(tagName, MarkdownDocumentElement);
};

declare global {
    interface HTMLElementTagNameMap {
        'markdown-document': MarkdownDocumentElement;
    }
}
