import type { MarkdownDocument } from '../MarkdownEngine';

export type MarkdownNavigationState = 'idle' | 'loading' | 'error' | 'disposed';
export type MarkdownNavigationEntry = { readonly url: URL };
export type MarkdownNavigationChange = {
    state: MarkdownNavigationState;
    url: URL;
    cause?: unknown;
};
export type MarkdownNavigationOptions = {
    isNavigable?: (url: URL, currentUrl: URL, anchor?: HTMLAnchorElement) => boolean;
    scrollToFragment?: (fragment: string, target: Element | null, container: HTMLElement) => void;
    onStateChange?: (change: MarkdownNavigationChange) => void;
    onCurrentChange?: (entry: MarkdownNavigationEntry, navigator: MarkdownNavigator) => void;
};
export type MarkdownNavigationBehavior = { history?: 'push' | 'replace' | 'none' };

const sameDocument = (left: URL, right: URL): boolean => {
    const first = new URL(left);
    const second = new URL(right);
    first.hash = '';
    second.hash = '';
    return first.href === second.href;
};

const defaultNavigable = (url: URL, current: URL): boolean => url.origin === current.origin && (sameDocument(url, current) || /\.md(?:own)?$/i.test(url.pathname));

const anchorFromEvent = (event: MouseEvent, container: HTMLElement): HTMLAnchorElement | undefined => {
    for (const node of event.composedPath()) {
        if (node === container) break;
        if (node instanceof HTMLAnchorElement) return node;
    }
    const target = event.target instanceof Element ? event.target.closest('a') : null;
    return target instanceof HTMLAnchorElement && container.contains(target) ? target : undefined;
};

export class MarkdownNavigator {
    private readonly entries: MarkdownNavigationEntry[] = [];
    private index = -1;
    private state: MarkdownNavigationState = 'idle';
    private disposed = false;
    private revision = 0;

    public constructor(
        public readonly document: MarkdownDocument,
        private readonly options: MarkdownNavigationOptions = {},
    ) {
        if (document.sourceUrl) {
            this.entries.push({ url: new URL(document.sourceUrl) });
            this.index = 0;
        }
        document.container.addEventListener('click', this.handleClick);
    }

    public get current(): MarkdownNavigationEntry | undefined {
        return this.entries[this.index];
    }

    public get history(): readonly MarkdownNavigationEntry[] {
        return this.entries;
    }

    public get canGoBack(): boolean {
        return this.index > 0;
    }

    public get canGoForward(): boolean {
        return this.index >= 0 && this.index < this.entries.length - 1;
    }

    public get navigationState(): MarkdownNavigationState {
        return this.state;
    }

    public async navigate(reference: string | URL, behavior: MarkdownNavigationBehavior = {}): Promise<void> {
        this.assertActive();
        const target = this.resolve(reference);
        const revision = ++this.revision;
        await this.load(target, revision);
        if (revision !== this.revision || this.disposed) return;
        this.commit(target, behavior.history ?? 'push');
        this.notifyCurrent();
    }

    public async back(): Promise<boolean> {
        this.assertActive();
        if (!this.canGoBack) return false;
        const nextIndex = this.index - 1;
        const revision = ++this.revision;
        await this.load(this.entries[nextIndex]!.url, revision);
        if (revision !== this.revision || this.disposed) return false;
        this.index = nextIndex;
        this.notifyCurrent();
        return true;
    }

    public async forward(): Promise<boolean> {
        this.assertActive();
        if (!this.canGoForward) return false;
        const nextIndex = this.index + 1;
        const revision = ++this.revision;
        await this.load(this.entries[nextIndex]!.url, revision);
        if (revision !== this.revision || this.disposed) return false;
        this.index = nextIndex;
        this.notifyCurrent();
        return true;
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.revision++;
        this.document.container.removeEventListener('click', this.handleClick);
        this.setState('disposed', this.current?.url ?? this.resolveBase());
    }

    private readonly handleClick = (event: MouseEvent): void => {
        if (this.disposed || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = anchorFromEvent(event, this.document.container);
        if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
        const href = anchor.getAttribute('href');
        if (!href) return;
        let target: URL;
        try {
            target = this.resolve(href);
        } catch {
            return;
        }
        const current = this.current?.url ?? this.resolveBase();
        if (!(this.options.isNavigable ?? defaultNavigable)(target, current, anchor)) return;
        event.preventDefault();
        void this.navigate(target).catch(() => undefined);
    };

    private async load(target: URL, revision: number): Promise<void> {
        const current = this.current?.url ?? this.document.sourceUrl;
        this.setState('loading', target);
        try {
            if (!current || !sameDocument(current, target)) await this.document.navigate(target.href);
            if (revision !== this.revision || this.disposed) return;
            this.scroll(target.hash);
            this.setState('idle', target);
        } catch (cause) {
            if (revision !== this.revision || this.disposed) return;
            this.setState('error', target, cause);
            throw cause;
        }
    }

    private commit(url: URL, behavior: NonNullable<MarkdownNavigationBehavior['history']>): void {
        if (behavior === 'none') return;
        const entry = { url: new URL(url) };
        if (behavior === 'replace' && this.index >= 0) {
            this.entries[this.index] = entry;
            return;
        }
        this.entries.splice(this.index + 1, this.entries.length, entry);
        this.index = this.entries.length - 1;
    }

    private resolve(reference: string | URL): URL {
        return reference instanceof URL ? new URL(reference) : new URL(reference, this.current?.url ?? this.resolveBase());
    }

    private resolveBase(): URL {
        return new URL(this.document.sourceUrl ?? globalThis.document.baseURI);
    }

    private scroll(hash: string): void {
        if (!hash) {
            this.document.container.scrollTo?.({ top: 0 });
            return;
        }
        let fragment: string;
        try {
            fragment = decodeURIComponent(hash.slice(1));
        } catch {
            fragment = hash.slice(1);
        }
        const target =
            Array.from(this.document.container.querySelectorAll('[id], a[name]')).find(
                (element) => element.id === fragment || (element instanceof HTMLAnchorElement && element.name === fragment),
            ) ?? null;
        if (this.options.scrollToFragment) this.options.scrollToFragment(fragment, target, this.document.container);
        else target?.scrollIntoView?.({ block: 'start' });
    }

    private setState(state: MarkdownNavigationState, url: URL, cause?: unknown): void {
        this.state = state;
        this.options.onStateChange?.({ state, url: new URL(url), ...(cause === undefined ? {} : { cause }) });
    }

    private notifyCurrent(): void {
        const current = this.current;
        if (current) this.options.onCurrentChange?.(current, this);
    }

    private assertActive(): void {
        if (this.disposed) throw new Error('Markdown navigator is disposed');
    }
}
