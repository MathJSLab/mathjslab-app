import { headingIdsExtension } from './markdown/extensions/heading-ids/extension';
import { mathJaxExtension } from './markdown/extensions/mathjax/extension';
import { relativeUrlsExtension } from './markdown/extensions/relative-urls/extension';
import { syntaxHighlightExtension } from './markdown/extensions/syntax-highlight/extension';
import { DefaultMarkdownResourceService, sanitizeMarkdownHTML } from './markdown/security';
import { cleanupAll, notifyMarkdownDocumentDispose } from './markdown/lifecycle';
import { markdownDiagnosticCategory, markdownDiagnosticCodes } from './markdown/diagnostics';
import type { MarkdownDiagnostic } from './markdown/diagnostics';
import { Marked, type MarkedExtension, type MarkedOptions } from 'marked';

export { markdownDiagnosticCategory, markdownDiagnosticCodes } from './markdown/diagnostics';
export type { MarkdownDiagnostic, MarkdownDiagnosticCategory, MarkdownDiagnosticCode, MarkdownDiagnosticEventDetail } from './markdown/diagnostics';

const escapeHTML = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export type MarkdownRenderMode = 'eager' | 'visible';
export type MarkdownSecurityMode = 'trusted' | 'sanitized' | 'strict';
export type MarkdownExecutionPolicy = {
    enabled?: boolean;
    allowInRestrictedMode?: boolean;
    maxSourceBytes?: number;
    maxBlocks?: number;
    maxStatements?: number;
    timeoutMs?: number;
};
export type MarkdownExecutionPolicies = Readonly<Record<string, MarkdownExecutionPolicy>>;
export type MarkdownResourcePolicy = {
    allowNetwork?: boolean;
    allowDataUrls?: boolean;
    allowedProtocols?: readonly string[];
    allowedOrigins?: readonly string[];
    cache?: 'none' | 'memory';
    maxResourceBytes?: number;
};
export interface MarkdownResourceService {
    resolve(reference: string, context: MarkdownDocumentContext): URL;
    fetch(reference: string | URL, context: MarkdownDocumentContext): Promise<Response>;
    readText(reference: string | URL, context: MarkdownDocumentContext): Promise<string>;
    createObjectURL(blob: Blob): string;
    revokeObjectURL(url: string): void;
    dispose(): void;
}
export type MarkdownDocumentContext = {
    sourceUrl?: URL;
    signal?: AbortSignal;
    theme?: 'light' | 'dark';
    locale?: string;
    width?: number;
    height?: number;
    enableAudio?: boolean;
    renderMode?: MarkdownRenderMode;
    securityMode?: MarkdownSecurityMode;
    executionPolicy?: MarkdownExecutionPolicies;
    resourcePolicy?: MarkdownResourcePolicy;
    allowedCapabilities?: readonly MarkdownExtensionCapability[];
    resources?: MarkdownResourceService;
    maxSourceBytes?: number;
    maxResourceBytes?: number;
    resolveUrl?: (reference: string, context: MarkdownDocumentContext) => URL;
    fetchResource?: (url: URL, init: RequestInit, context: MarkdownDocumentContext) => Promise<Response>;
    observeResize?: (element: Element, callback: (width: number, height: number) => void) => (() => void) | void;
    createMapBaseLayer?: (leaflet: unknown, context: MarkdownDocumentContext) => { addTo(map: unknown): unknown } | void;
    onDiagnostic?: (diagnostic: MarkdownDiagnostic) => void;
};
export type MarkdownExtensionCapability = 'audio' | 'interactive' | 'network' | 'wasm' | 'webgl';
export type MarkdownProfile = 'core' | 'gfm';
export type MarkdownFence = {
    language: string;
    className: string;
    render: (container: Element, source: string, context: MarkdownDocumentContext) => Promise<void>;
    dispose?: (container: Element) => void | Promise<void>;
};
export type MarkdownExtensionManifest = {
    name: string;
    description: string;
    dependencies: readonly string[];
    fences: readonly { language: string; className: string }[];
    styles?: string;
    interactive?: boolean;
    capabilities?: readonly MarkdownExtensionCapability[];
    formats?: readonly { language: string; mimeTypes?: readonly string[]; extensions?: readonly string[] }[];
};
export type MarkdownEngineServices = { readonly parser: Marked; readonly profile: MarkdownProfile };
export type MarkdownExtension = {
    name: string;
    manifest?: MarkdownExtensionManifest;
    marked?: MarkedExtension;
    fences?: MarkdownFence[];
    initialize?: (services: MarkdownEngineServices) => void | Promise<void>;
    prepare?: (container: ParentNode, context: MarkdownDocumentContext) => void | Promise<void>;
    typeset?: (container: ParentNode, context: MarkdownDocumentContext) => void | Promise<void>;
    /** Release resources owned by a document, including non-fence hooks. */
    disposeContainer?: (container: ParentNode) => void | Promise<void>;
    dispose?: () => void | Promise<void>;
};
export type MarkdownEngineOptions = {
    profile?: MarkdownProfile;
    extensions?: MarkdownExtension[];
    maxConcurrentRenders?: number;
    securityMode?: MarkdownSecurityMode;
    resourcePolicy?: MarkdownResourcePolicy;
    executionPolicy?: MarkdownExecutionPolicies;
    allowedCapabilities?: readonly MarkdownExtensionCapability[];
};
export interface MarkdownDocument {
    readonly container: HTMLElement;
    readonly sourceUrl: URL | undefined;
    readonly signal: AbortSignal;
    readonly disposed: boolean;
    update(source: string, context?: MarkdownDocumentContext): Promise<void>;
    navigate(reference: string, context?: MarkdownDocumentContext): Promise<void>;
    dispose(): Promise<void>;
}

export const markdownProfiles: Readonly<Record<MarkdownProfile, Readonly<MarkedOptions>>> = {
    core: { gfm: false, breaks: false, pedantic: false },
    gfm: { gfm: true, breaks: false, pedantic: false },
};

type FenceEntry = { extension: MarkdownExtension; fence: MarkdownFence };
type DeferredRendering = { observer: IntersectionObserver; removeAbortListener: () => void };
type ScheduledRendering = { signal?: AbortSignal; task: () => Promise<void>; resolve: () => void; reject: (reason: unknown) => void; unlink: () => void };

const belongsTo = (root: ParentNode, candidate: Node): boolean => {
    let node: Node | null = candidate;
    while (node) {
        if (node === root) return true;
        if (node.parentNode) node = node.parentNode;
        else {
            const currentRoot: Node | null = typeof node.getRootNode === 'function' ? node.getRootNode() : null;
            node = currentRoot && 'host' in currentRoot ? (currentRoot as ShadowRoot).host : null;
        }
    }
    return false;
};

const linkedController = (external?: AbortSignal): { controller: AbortController; unlink: () => void } => {
    const controller = new AbortController();
    if (!external) return { controller, unlink: () => undefined };
    const abort = (): void => controller.abort(external.reason);
    if (external.aborted) abort();
    else external.addEventListener('abort', abort, { once: true });
    return { controller, unlink: () => external.removeEventListener('abort', abort) };
};

class MarkdownDocumentSession implements MarkdownDocument {
    private context: MarkdownDocumentContext;
    private operation: Promise<void> = Promise.resolve();
    private controller = new AbortController();
    private unlink = (): void => undefined;
    private revision = 0;
    private readonly resources: MarkdownResourceService;
    private disposal?: Promise<void>;
    public disposed = false;

    public constructor(
        private readonly engine: MarkdownEngine,
        public readonly container: HTMLElement,
        context: MarkdownDocumentContext,
        ready: Promise<void> = Promise.resolve(),
    ) {
        this.context = { ...context };
        // Signals belong to an operation; an aborted first load must allow retry.
        delete this.context.signal;
        this.resources = engine.createResourceService();
        this.operation = ready;
    }
    public get sourceUrl(): URL | undefined {
        return this.context.sourceUrl;
    }
    public get signal(): AbortSignal {
        return this.controller.signal;
    }
    public update(source: string, context: MarkdownDocumentContext = this.context): Promise<void> {
        return this.start(async (activeContext) => ({ source, context: activeContext }), context);
    }
    public navigate(reference: string, context: MarkdownDocumentContext = this.context): Promise<void> {
        return this.start(async (activeContext) => {
            const url = this.resources.resolve(reference, activeContext);
            const source = await this.resources.readText(url, activeContext);
            return { source, context: { ...activeContext, sourceUrl: url } };
        }, context);
    }
    public dispose(): Promise<void> {
        if (this.disposal) return this.disposal;
        this.disposed = true;
        this.disposal = Promise.resolve().then(async () => {
            await this.operation.catch(() => undefined);
            try {
                await this.engine.disposeContainer(this.container);
            } finally {
                this.resources.dispose();
                this.container.replaceChildren();
                this.engine.releaseSession(this);
            }
        });
        notifyMarkdownDocumentDispose(this);
        this.cancel();
        return this.disposal;
    }
    private start(producer: (context: MarkdownDocumentContext) => Promise<{ source: string; context: MarkdownDocumentContext }>, context: MarkdownDocumentContext): Promise<void> {
        if (this.disposed) return Promise.reject(new Error('Markdown document is disposed'));
        this.cancel();
        const previous = this.operation.catch(() => undefined);
        const revision = ++this.revision;
        const linked = linkedController(context.signal);
        this.controller = linked.controller;
        this.unlink = linked.unlink;
        const activeContext: MarkdownDocumentContext = { ...context, signal: linked.controller.signal, resources: this.resources };
        this.operation = (async () => {
            await previous;
            if (activeContext.signal?.aborted || revision !== this.revision) return;
            let next: { source: string; context: MarkdownDocumentContext };
            try {
                next = await producer(activeContext);
            } catch (error) {
                if (activeContext.signal?.aborted || revision !== this.revision) return;
                throw error;
            }
            if (activeContext.signal?.aborted || revision !== this.revision) return;
            await this.engine.disposeContainer(this.container);
            if (activeContext.signal?.aborted || revision !== this.revision) return;
            const html = await this.engine.renderHTML(next.source, next.context);
            if (activeContext.signal?.aborted || revision !== this.revision) {
                this.releaseImageObjectUrls(html);
                return;
            }
            const persistentContext = { ...next.context };
            delete persistentContext.signal;
            this.context = persistentContext;
            this.releaseImageObjectUrls(this.container);
            this.container.innerHTML = html;
            await this.engine.typeset(this.container, next.context);
        })();
        return this.operation;
    }
    private cancel(): void {
        this.controller.abort();
        this.unlink();
        this.unlink = () => undefined;
    }
    private releaseImageObjectUrls(root: ParentNode | string): void {
        const template = document.createElement('template');
        if (typeof root === 'string') template.innerHTML = root;
        const container = typeof root === 'string' ? template.content : root;
        for (const image of container.querySelectorAll('img, source, image')) {
            const urls = [
                image.getAttribute('src') ?? '',
                image.getAttribute('href') ?? '',
                image.getAttribute('xlink:href') ?? '',
                ...(image.getAttribute('srcset') ?? '').split(',').map((candidate) => candidate.trim().split(/\s+/)[0] ?? ''),
            ];
            for (const url of urls) if (url.startsWith('blob:')) this.resources.revokeObjectURL(url);
        }
    }
}

export class MarkdownEngine {
    public readonly parser = new Marked();
    public readonly profile: MarkdownProfile;
    private configured = false;
    private initialization?: Promise<void>;
    private disposed = false;
    private disposal?: Promise<void>;
    private readonly renderings = new Map<Element, Promise<void>>();
    private readonly rendered = new Map<Element, MarkdownFence>();
    private readonly deferred = new Map<Element, DeferredRendering>();
    private readonly hookOperations = new Set<{ root: ParentNode; controller: AbortController; unlink: () => void; operation: Promise<void> }>();
    private readonly containerDisposals = new Map<ParentNode, Promise<void>>();
    private readonly sessions = new Map<HTMLElement, MarkdownDocumentSession>();
    private readonly extensions = new Map<string, MarkdownExtension>();
    private readonly fences = new Map<string, FenceEntry>();
    private readonly maxConcurrentRenders: number;
    private readonly securityMode: MarkdownSecurityMode;
    private readonly resourcePolicy: MarkdownResourcePolicy;
    private readonly executionPolicy: MarkdownExecutionPolicies;
    private readonly allowedCapabilities: readonly MarkdownExtensionCapability[] | undefined;
    private activeRenders = 0;
    private readonly renderQueue: ScheduledRendering[] = [];
    private parsingSource = '';
    private parsingCursor = 0;

    public constructor(options: MarkdownEngineOptions = {}) {
        this.profile = options.profile ?? 'gfm';
        this.securityMode = options.securityMode ?? 'trusted';
        this.resourcePolicy = options.resourcePolicy ?? {};
        this.executionPolicy = options.executionPolicy ?? {};
        this.allowedCapabilities = options.allowedCapabilities;
        this.maxConcurrentRenders = Math.max(1, Math.floor(options.maxConcurrentRenders ?? 4));
        if (this.profile === 'gfm') {
            this.registerExtension(headingIdsExtension());
            this.registerExtension(mathJaxExtension());
        }
        this.registerExtension(relativeUrlsExtension());
        this.registerExtension(syntaxHighlightExtension());
        for (const extension of options.extensions ?? []) this.registerExtension(extension);
    }
    public registerExtension(extension: MarkdownExtension): void {
        if (this.disposed) throw new Error('Markdown engine is disposed');
        if (extension.manifest?.name !== undefined && extension.manifest.name !== extension.name) throw new Error(`Markdown extension manifest name does not match: ${extension.name}`);
        for (const value of [extension.name, ...(extension.fences ?? []).flatMap(({ language, className }) => [language, className])]) {
            if (!/^[a-z][a-z0-9_-]*$/.test(value)) throw new Error(`Invalid Markdown extension identifier: ${value}`);
        }
        if (this.extensions.has(extension.name)) throw new Error(`Markdown extension already registered: ${extension.name}`);
        for (const fence of extension.fences ?? []) if (this.fences.has(fence.language)) throw new Error(`Markdown fence already registered: ${fence.language}`);
        this.extensions.set(extension.name, extension);
        for (const fence of extension.fences ?? []) this.fences.set(fence.language, { extension, fence });
        if (this.configured && extension.marked) this.parser.use(extension.marked);
        if (this.initialization) this.initialization = this.initialization.then(async () => extension.initialize?.(this.services()));
    }
    public initialize(): Promise<void> {
        if (this.disposed) return Promise.reject(new Error('Markdown engine is disposed'));
        this.configure();
        if (!this.initialization) this.initialization = Promise.all(Array.from(this.extensions.values(), (extension) => extension.initialize?.(this.services()))).then(() => undefined);
        return this.initialization;
    }
    public parse(src: string, options?: MarkedOptions<string, string> | null): string {
        this.configure();
        this.parsingSource = src;
        this.parsingCursor = 0;
        try {
            return this.parser.parse(src, options) as string;
        } finally {
            this.parsingSource = '';
            this.parsingCursor = 0;
        }
    }
    public async renderHTML(src: string, context: MarkdownDocumentContext = {}): Promise<string> {
        const mode = context.securityMode ?? this.securityMode;
        const options: MarkedOptions<string, string> | undefined =
            mode === 'strict'
                ? {
                      walkTokens: (token) => {
                          if (token.type !== 'html') return;
                          const html = token as typeof token & { raw: string; text: string; type: string };
                          html.type = 'text';
                          html.text = escapeHTML(html.text);
                          html.raw = html.text;
                      },
                  }
                : undefined;
        return sanitizeMarkdownHTML(this.parse(src, options), mode, { ...context, securityMode: mode }, this.resourcePolicy);
    }
    public async renderDocument(src: string, container: HTMLElement, context: MarkdownDocumentContext = {}): Promise<MarkdownDocument> {
        if (this.disposed) throw new Error('Markdown engine is disposed');
        const previous = this.sessions.get(container);
        let releasePrevious!: () => void;
        let rejectPrevious!: (cause: unknown) => void;
        const ready = new Promise<void>((resolve, reject) => {
            releasePrevious = resolve;
            rejectPrevious = reject;
        });
        const session = new MarkdownDocumentSession(this, container, context, ready);
        this.sessions.set(container, session);
        const operation = session.update(src, context);
        // Reserve ownership and start the operation before abort can invoke host callbacks.
        void (previous?.dispose() ?? Promise.resolve()).then(releasePrevious, rejectPrevious);
        await operation;
        return session;
    }
    public async render(src: string, container: HTMLElement, context: MarkdownDocumentContext = {}): Promise<void> {
        const session = this.sessions.get(container);
        if (session) await session.update(src, context);
        else await this.renderDocument(src, container, context);
    }
    public typeset(element: ParentNode = document, context: MarkdownDocumentContext = {}): Promise<void> {
        if (this.disposed) return Promise.reject(new Error('Markdown engine is disposed'));
        const root = element as Node;
        if (Array.from(this.containerDisposals.keys()).some((disposing) => belongsTo(disposing, root) || belongsTo(element, disposing as Node))) return Promise.resolve();
        const linked = linkedController(context.signal);
        const entry = { root: element, ...linked, operation: Promise.resolve() };
        this.hookOperations.add(entry);
        entry.operation = this.typesetActive(element, { ...context, signal: linked.controller.signal }).finally(() => {
            linked.unlink();
            this.hookOperations.delete(entry);
        });
        return entry.operation;
    }
    private async typesetActive(element: ParentNode, context: MarkdownDocumentContext): Promise<void> {
        await this.initialize();
        const executionPolicy = Object.fromEntries(
            Array.from(new Set([...Object.keys(this.executionPolicy), ...Object.keys(context.executionPolicy ?? {})]), (name) => [
                name,
                { ...this.executionPolicy[name], ...context.executionPolicy?.[name] },
            ]),
        );
        const defaultCapabilities = this.allowedCapabilitiesFor(context.securityMode ?? this.securityMode);
        const allowedCapabilities =
            context.allowedCapabilities && this.allowedCapabilities
                ? context.allowedCapabilities.filter((capability) => this.allowedCapabilities?.includes(capability))
                : (context.allowedCapabilities ?? this.allowedCapabilities ?? defaultCapabilities);
        const activeContext: MarkdownDocumentContext = {
            ...context,
            securityMode: context.securityMode ?? this.securityMode,
            executionPolicy,
            allowedCapabilities,
        };
        if (activeContext.signal?.aborted) return;
        for (const extension of this.extensions.values()) {
            if (activeContext.signal?.aborted || this.disposed) return;
            if (!this.extensionAllowed(extension, activeContext)) continue;
            await extension.prepare?.(element, activeContext);
        }
        if (activeContext.signal?.aborted || this.disposed) return;
        const found = this.findRenderables(element);
        await Promise.all(
            Array.from(found, async (renderable) => {
                const entry = this.fences.get(renderable.getAttribute('data-markdown-language') ?? '');
                if (!entry) return;
                if (!this.extensionAllowed(entry.extension, activeContext)) {
                    const source = renderable.querySelector('.markdown-extension-source')?.textContent ?? '';
                    const fallback = document.createElement('pre');
                    fallback.textContent = source;
                    renderable.replaceChildren(fallback);
                    const blocked = (entry.extension.manifest?.capabilities ?? []).filter((capability) => !activeContext.allowedCapabilities?.includes(capability));
                    const line = this.sourceLineFromElement(renderable);
                    activeContext.onDiagnostic?.({
                        extension: entry.extension.name,
                        language: entry.fence.language,
                        code: markdownDiagnosticCodes.extensionCapabilityBlocked,
                        category: 'policy',
                        severity: 'warning',
                        ...(line !== undefined ? { line } : {}),
                        ...(activeContext.sourceUrl ? { sourceUrl: activeContext.sourceUrl } : {}),
                        message: `Extension requires capabilities that are not allowed: ${blocked.join(', ')}`,
                    });
                    return;
                }
                if (this.shouldDefer(entry.extension, activeContext)) this.deferRendering(renderable, entry, activeContext);
                else await this.renderElement(renderable, entry, activeContext);
            }),
        );
        if (activeContext.signal?.aborted) return;
        for (const extension of this.extensions.values()) {
            if (activeContext.signal?.aborted || this.disposed) return;
            if (!this.extensionAllowed(extension, activeContext)) continue;
            await extension.typeset?.(element, activeContext);
        }
        if (activeContext.signal?.aborted || this.disposed) return;
        for (const renderable of found) {
            const extension = this.extensions.get(renderable.getAttribute('data-markdown-extension') ?? '');
            if (extension) this.installLocalStyles(renderable, extension);
        }
    }
    public async dispose(container?: ParentNode): Promise<void> {
        if (container) {
            if (container instanceof HTMLElement) {
                const session = this.sessions.get(container);
                if (session) return session.dispose();
            }
            await this.disposeContainer(container);
            return;
        }
        if (this.disposal) return this.disposal;
        this.disposed = true;
        const sessions: Promise<void>[] = [];
        this.disposal = Promise.resolve().then(async () => {
            await this.initialization?.catch(() => undefined);
            await cleanupAll([
                ...sessions.map((session) => () => session),
                ...Array.from(this.hookOperations, (entry) => () => this.disposeContainer(entry.root)),
                () => this.disposeContainer(document),
                async () => {
                    for (const entry of this.deferred.values()) {
                        entry.observer.disconnect();
                        entry.removeAbortListener();
                    }
                    this.deferred.clear();
                    await Promise.all(Array.from(this.renderings.values(), (rendering) => rendering.catch(() => undefined)));
                    const fences = Array.from(this.rendered.entries()).reverse();
                    this.rendered.clear();
                    this.renderings.clear();
                    await cleanupAll(
                        fences.map(
                            ([element, fence]) =>
                                () =>
                                    fence.dispose?.(element),
                        ),
                    );
                },
                ...Array.from(this.extensions.values())
                    .reverse()
                    .map((extension) => () => extension.dispose?.()),
            ]);
        });
        for (const scheduled of this.renderQueue.splice(0)) {
            scheduled.unlink();
            scheduled.resolve();
        }
        // Cache disposal before abort callbacks, and cancel all documents before waiting.
        sessions.push(...Array.from(this.sessions.values(), (session) => session.dispose()));
        for (const entry of this.hookOperations) entry.controller.abort();
        return this.disposal;
    }
    /** @internal */
    public disposeContainer(container: ParentNode): Promise<void> {
        const previous = this.containerDisposals.get(container);
        if (previous) return previous;
        const hooks = Array.from(this.hookOperations).filter((entry) => belongsTo(container, entry.root as Node));
        const operation = Promise.resolve().then(async () => {
            try {
                await this.clearContainer(container, hooks);
            } finally {
                this.containerDisposals.delete(container);
            }
        });
        this.containerDisposals.set(container, operation);
        for (const entry of hooks) {
            entry.controller.abort();
            entry.unlink();
        }
        return operation;
    }
    private async clearContainer(container: ParentNode, hooks: Array<{ root: ParentNode; operation: Promise<void> }>): Promise<void> {
        await Promise.all(hooks.map((entry) => entry.operation.catch(() => undefined)));
        for (const entry of Array.from(this.hookOperations)) if (hooks.includes(entry)) this.hookOperations.delete(entry);
        for (const [element, entry] of Array.from(this.deferred.entries()).filter(([element]) => belongsTo(container, element))) {
            entry.observer.disconnect();
            entry.removeAbortListener();
            this.deferred.delete(element);
            this.renderings.delete(element);
        }
        const pending = Array.from(this.renderings.entries()).filter(([element]) => belongsTo(container, element));
        await Promise.all(pending.map(([, rendering]) => rendering.catch(() => undefined)));
        const fences = Array.from(this.rendered.entries())
            .filter(([element]) => belongsTo(container, element))
            .reverse();
        for (const [element] of fences) {
            this.rendered.delete(element);
            this.renderings.delete(element);
        }
        await cleanupAll([
            ...fences.map(
                ([element, fence]) =>
                    () =>
                        fence.dispose?.(element),
            ),
            ...Array.from(this.extensions.values())
                .reverse()
                .map((extension) => () => extension.disposeContainer?.(container)),
        ]);
    }
    /** @internal */
    public releaseSession(session: MarkdownDocumentSession): void {
        if (this.sessions.get(session.container) === session) this.sessions.delete(session.container);
    }
    /** @internal */
    public createResourceService(): MarkdownResourceService {
        return new DefaultMarkdownResourceService(this.resourcePolicy);
    }
    private configure(): void {
        if (this.configured) return;
        const renderer = {
            code: (token: { lang?: string; text: string }): string | false => {
                const language = token.lang?.trim().split(/\s+/)[0] ?? '';
                const entry = this.fences.get(language);
                if (!entry) return false;
                const raw = (token as typeof token & { raw?: string }).raw;
                const line = this.sourceLineForToken(raw);
                const sourceLocation = line === undefined ? '' : ` data-markdown-line="${line}"`;
                return `<div class="${entry.fence.className}" data-markdown-extension="${entry.extension.name}" data-markdown-language="${language}"${sourceLocation}><pre class="markdown-extension-source">${escapeHTML(token.text)}</pre></div>`;
            },
        };
        this.parser.options(markdownProfiles[this.profile]);
        for (const extension of this.extensions.values()) if (extension.marked) this.parser.use(extension.marked);
        this.parser.use({ renderer });
        this.configured = true;
    }
    private findRenderables(element: ParentNode): Set<Element> {
        const found = new Set<Element>();
        const walker = (node: ParentNode): void => {
            if (node instanceof Element) {
                if (node.hasAttribute('data-markdown-extension')) found.add(node);
                if (node.shadowRoot) walker(node.shadowRoot);
            }
            node.querySelectorAll('[data-markdown-extension]').forEach((child) => found.add(child));
            node.querySelectorAll('*').forEach((child) => {
                if (child.shadowRoot) walker(child.shadowRoot);
            });
        };
        walker(element);
        return found;
    }
    private shouldDefer(extension: MarkdownExtension, context: MarkdownDocumentContext): boolean {
        if (context.renderMode !== 'visible' || typeof IntersectionObserver === 'undefined') return false;
        const capabilities = extension.manifest?.capabilities ?? [];
        return capabilities.some((capability) => capability === 'audio' || capability === 'interactive' || capability === 'wasm' || capability === 'webgl');
    }
    private allowedCapabilitiesFor(mode: MarkdownSecurityMode): readonly MarkdownExtensionCapability[] {
        if (mode === 'trusted') return ['audio', 'interactive', 'network', 'wasm', 'webgl'];
        if (mode === 'sanitized') return ['interactive', 'wasm'];
        return [];
    }
    private extensionAllowed(extension: MarkdownExtension, context: MarkdownDocumentContext): boolean {
        return (extension.manifest?.capabilities ?? []).every((capability) => context.allowedCapabilities?.includes(capability) ?? true);
    }
    private deferRendering(renderable: Element, entry: FenceEntry, context: MarkdownDocumentContext): void {
        if (this.disposed || this.rendered.has(renderable) || this.renderings.has(renderable) || this.deferred.has(renderable) || context.signal?.aborted) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (this.disposed || context.signal?.aborted || this.deferred.get(renderable)?.observer !== observer) return;
                if (!entries.some(({ isIntersecting }) => isIntersecting)) return;
                observer.disconnect();
                this.deferred.get(renderable)?.removeAbortListener();
                this.deferred.delete(renderable);
                void this.renderElement(renderable, entry, context).catch((cause) =>
                    this.withFenceDiagnosticContext(context, renderable).onDiagnostic?.({
                        extension: entry.extension.name,
                        language: entry.fence.language,
                        code: markdownDiagnosticCodes.extensionRenderError,
                        category: 'extension',
                        severity: 'error',
                        ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
                        message: cause instanceof Error ? cause.message : String(cause),
                        cause,
                    }),
                );
            },
            { rootMargin: '300px' },
        );
        const abort = (): void => {
            observer.disconnect();
            context.signal?.removeEventListener('abort', abort);
            this.deferred.delete(renderable);
        };
        context.signal?.addEventListener('abort', abort, { once: true });
        observer.observe(renderable);
        this.deferred.set(renderable, { observer, removeAbortListener: () => context.signal?.removeEventListener('abort', abort) });
    }
    private renderElement(renderable: Element, entry: FenceEntry, context: MarkdownDocumentContext): Promise<void> {
        if (this.disposed || context.signal?.aborted) return Promise.resolve();
        const previous = this.renderings.get(renderable);
        if (previous) return previous;
        const source = renderable.querySelector('.markdown-extension-source')?.textContent ?? '';
        const diagnosticContext = this.withFenceDiagnosticContext(context, renderable);
        const pending = this.schedule(async () => {
            if (context.signal?.aborted || this.disposed) return;
            this.rendered.set(renderable, entry.fence);
            try {
                await entry.fence.render(renderable, source, diagnosticContext);
            } catch (error) {
                try {
                    await entry.fence.dispose?.(renderable);
                } finally {
                    this.rendered.delete(renderable);
                }
                throw error;
            }
        }, context.signal).catch((error) => {
            this.renderings.delete(renderable);
            throw error;
        });
        this.renderings.set(renderable, pending);
        void pending.then(
            () => {
                if (context.signal?.aborted) this.renderings.delete(renderable);
            },
            () => undefined,
        );
        return pending;
    }
    private withFenceDiagnosticContext(context: MarkdownDocumentContext, renderable: Element): MarkdownDocumentContext {
        const line = this.sourceLineFromElement(renderable);
        return {
            ...context,
            onDiagnostic: (diagnostic) => {
                if (this.disposed || context.signal?.aborted) return;
                const code = diagnostic.code ?? markdownDiagnosticCodes.extensionDiagnostic;
                context.onDiagnostic?.({
                    ...diagnostic,
                    code,
                    category: diagnostic.category ?? markdownDiagnosticCategory(code),
                    ...(!diagnostic.sourceUrl && context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
                    ...(diagnostic.line === undefined && line !== undefined ? { line } : {}),
                });
            },
        };
    }
    private sourceLineFromElement(renderable: Element): number | undefined {
        const line = Number(renderable.getAttribute('data-markdown-line'));
        return Number.isInteger(line) && line > 0 ? line : undefined;
    }
    private sourceLineForToken(raw?: string): number | undefined {
        if (!raw) return undefined;
        let index = this.parsingSource.indexOf(raw, this.parsingCursor);
        if (index < 0) index = this.parsingSource.indexOf(raw);
        if (index < 0) return undefined;
        this.parsingCursor = index + raw.length;
        let line = 1;
        for (let cursor = 0; cursor < index; cursor++) if (this.parsingSource.charCodeAt(cursor) === 10) line++;
        return line;
    }
    private schedule(task: () => Promise<void>, signal?: AbortSignal): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (signal?.aborted || this.disposed) {
                resolve();
                return;
            }
            const scheduled: ScheduledRendering = { ...(signal ? { signal } : {}), task, resolve, reject, unlink: () => signal?.removeEventListener('abort', abort) };
            const abort = (): void => {
                const index = this.renderQueue.indexOf(scheduled);
                if (index < 0) return;
                this.renderQueue.splice(index, 1);
                scheduled.unlink();
                resolve();
            };
            signal?.addEventListener('abort', abort, { once: true });
            this.renderQueue.push(scheduled);
            this.pumpQueue();
        });
    }
    private pumpQueue(): void {
        while (this.activeRenders < this.maxConcurrentRenders && this.renderQueue.length) {
            const scheduled = this.renderQueue.shift()!;
            scheduled.unlink();
            if (scheduled.signal?.aborted || this.disposed) {
                scheduled.resolve();
                continue;
            }
            this.activeRenders++;
            void scheduled
                .task()
                .then(scheduled.resolve, scheduled.reject)
                .finally(() => {
                    this.activeRenders--;
                    this.pumpQueue();
                });
        }
    }
    private services(): MarkdownEngineServices {
        return { parser: this.parser, profile: this.profile };
    }
    private installLocalStyles(container: Element, extension: MarkdownExtension): void {
        const styles = extension.manifest?.styles;
        const installed = Array.from(container.children).some((child) => child.tagName === 'STYLE' && child.getAttribute('data-markdown-extension-style') === extension.name);
        if (!styles || installed) return;
        const style = document.createElement('style');
        style.setAttribute('data-markdown-extension-style', extension.name);
        style.textContent = styles;
        container.append(style);
    }
}

export default MarkdownEngine;
