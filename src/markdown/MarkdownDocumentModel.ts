export type MarkdownDocumentMetadata = Readonly<Record<string, unknown>>;

export type MarkdownPageDefinition = {
    type: 'page';
    id?: string;
    title: string;
    source: string;
    description?: string;
    hidden?: boolean;
    metadata?: MarkdownDocumentMetadata;
};

export type MarkdownGroupDefinition = {
    type: 'group';
    id?: string;
    title: string;
    description?: string;
    hidden?: boolean;
    metadata?: MarkdownDocumentMetadata;
    children: readonly MarkdownDocumentNodeDefinition[];
};

export type MarkdownDocumentNodeDefinition = MarkdownPageDefinition | MarkdownGroupDefinition;

export type MarkdownCollectionManifest = {
    version: 1;
    title: string;
    baseUrl?: string;
    description?: string;
    locale?: string;
    metadata?: MarkdownDocumentMetadata;
    items: readonly MarkdownDocumentNodeDefinition[];
};

type MarkdownNodeBase = {
    readonly id: string;
    readonly title: string;
    readonly description?: string;
    readonly hidden: boolean;
    readonly metadata: MarkdownDocumentMetadata;
    readonly parent?: MarkdownGroup;
    readonly depth: number;
};

export type MarkdownPage = MarkdownNodeBase & {
    readonly type: 'page';
    readonly source: string;
    readonly url: URL;
    readonly index: number;
};

export type MarkdownGroup = MarkdownNodeBase & {
    readonly type: 'group';
    readonly children: readonly MarkdownDocumentNode[];
};

export type MarkdownDocumentNode = MarkdownPage | MarkdownGroup;

export type MarkdownOutlineItem = {
    readonly id: string;
    readonly title: string;
    readonly level: number;
    readonly href: string;
    readonly children: MarkdownOutlineItem[];
};

export type MarkdownOutlineOptions = {
    minLevel?: number;
    maxLevel?: number;
    include?: (heading: HTMLHeadingElement) => boolean;
};

export type MarkdownCollectionTocItem = {
    readonly id: string;
    readonly type: 'group' | 'page';
    readonly title: string;
    readonly href?: string;
    readonly children: readonly MarkdownCollectionTocItem[];
};

const slug = (value: string): string => {
    const result = value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase()
        .trim()
        .replace(/[^\p{Letter}\p{Number}\s_-]/gu, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
    return result || 'section';
};

const idPart = (definition: MarkdownDocumentNodeDefinition): string => {
    if (definition.id) return definition.id;
    if (definition.type === 'group') return slug(definition.title);
    const pathname = definition.source.split(/[?#]/, 1)[0] ?? definition.source;
    const filename = pathname
        .split('/')
        .filter(Boolean)
        .at(-1)
        ?.replace(/\.md(?:own)?$/i, '');
    return slug(filename || definition.title);
};

const validateId = (id: string): void => {
    if (!id || /^\s|\s$/.test(id) || /[?#]/.test(id)) throw new Error(`Invalid Markdown document id: ${id}`);
};

const withoutHash = (url: URL): string => {
    const normalized = new URL(url);
    normalized.hash = '';
    return normalized.href;
};

const defaultManifestUrl = (): string => (typeof document === 'undefined' ? 'file:///' : document.baseURI);

export class MarkdownDocumentModel {
    public readonly title: string;
    public readonly description: string | undefined;
    public readonly locale: string | undefined;
    public readonly metadata: MarkdownDocumentMetadata;
    public readonly baseUrl: URL;
    public readonly items: readonly MarkdownDocumentNode[];
    public readonly pages: readonly MarkdownPage[];
    public readonly tableOfContents: readonly MarkdownCollectionTocItem[];
    private readonly nodesById = new Map<string, MarkdownDocumentNode>();
    private readonly pagesByUrl = new Map<string, MarkdownPage>();

    public constructor(
        public readonly manifest: MarkdownCollectionManifest,
        manifestUrl: string | URL = defaultManifestUrl(),
    ) {
        if (manifest.version !== 1) throw new Error(`Unsupported Markdown collection version: ${String(manifest.version)}`);
        if (!manifest.title.trim()) throw new Error('Markdown collection title is required');
        if (!Array.isArray(manifest.items)) throw new Error('Markdown collection items must be an array');
        this.title = manifest.title;
        this.description = manifest.description;
        this.locale = manifest.locale;
        this.metadata = Object.freeze({ ...manifest.metadata });
        this.baseUrl = new URL(manifest.baseUrl ?? '.', manifestUrl);
        const pages: MarkdownPage[] = [];
        this.items = Object.freeze(this.build(manifest.items, undefined, 0, '', pages));
        this.pages = Object.freeze(pages);
        this.tableOfContents = Object.freeze(this.createTableOfContents());
    }

    public get(id: string): MarkdownDocumentNode | undefined {
        return this.nodesById.get(id);
    }

    public getPage(id: string): MarkdownPage | undefined {
        const node = this.get(id);
        return node?.type === 'page' ? node : undefined;
    }

    public findPage(reference: string | URL, current?: MarkdownPage | URL): MarkdownPage | undefined {
        if (typeof reference === 'string') {
            const page = this.getPage(reference);
            if (page) return page;
        }
        const base = current instanceof URL ? current : (current?.url ?? this.baseUrl);
        const url = reference instanceof URL ? reference : new URL(reference, base);
        return this.pagesByUrl.get(withoutHash(url));
    }

    public previous(page: MarkdownPage | string): MarkdownPage | undefined {
        const current = typeof page === 'string' ? this.getPage(page) : page;
        return current && current.index > 0 ? this.pages[current.index - 1] : undefined;
    }

    public next(page: MarkdownPage | string): MarkdownPage | undefined {
        const current = typeof page === 'string' ? this.getPage(page) : page;
        return current ? this.pages[current.index + 1] : undefined;
    }

    public isNavigable = (url: URL): boolean => this.pagesByUrl.has(withoutHash(url));

    public createTableOfContents(includeHidden = false): MarkdownCollectionTocItem[] {
        const visit = (nodes: readonly MarkdownDocumentNode[]): MarkdownCollectionTocItem[] =>
            nodes.flatMap((node) => {
                if (node.hidden && !includeHidden) return [];
                return [
                    Object.freeze({
                        id: node.id,
                        type: node.type,
                        title: node.title,
                        ...(node.type === 'page' ? { href: node.url.href } : {}),
                        children: Object.freeze(node.type === 'group' ? visit(node.children) : []),
                    }),
                ];
            });
        return visit(this.items);
    }

    private build(definitions: readonly MarkdownDocumentNodeDefinition[], parent: MarkdownGroup | undefined, depth: number, prefix: string, pages: MarkdownPage[]): MarkdownDocumentNode[] {
        return definitions.map((definition) => {
            if (definition.type !== 'page' && definition.type !== 'group') throw new Error(`Unsupported Markdown document node type: ${String((definition as { type?: unknown }).type)}`);
            if (!definition.title.trim()) throw new Error('Markdown document node title is required');
            const part = idPart(definition);
            validateId(part);
            const id = prefix ? `${prefix}/${part}` : part;
            if (this.nodesById.has(id)) throw new Error(`Duplicate Markdown document id: ${id}`);
            const common = {
                id,
                title: definition.title,
                ...(definition.description === undefined ? {} : { description: definition.description }),
                hidden: definition.hidden ?? false,
                metadata: Object.freeze({ ...definition.metadata }),
                ...(parent ? { parent } : {}),
                depth,
            };
            if (definition.type === 'page') {
                if (!definition.source.trim()) throw new Error(`Markdown page source is required: ${id}`);
                const page: MarkdownPage = Object.freeze({
                    ...common,
                    type: 'page',
                    source: definition.source,
                    url: new URL(definition.source, this.baseUrl),
                    index: pages.length,
                });
                if (this.pagesByUrl.has(withoutHash(page.url))) throw new Error(`Duplicate Markdown page URL: ${page.url.href}`);
                this.nodesById.set(id, page);
                this.pagesByUrl.set(withoutHash(page.url), page);
                pages.push(page);
                return page;
            }
            if (!Array.isArray(definition.children)) throw new Error(`Markdown group children must be an array: ${id}`);
            const group = {
                ...common,
                type: 'group' as const,
                children: [] as readonly MarkdownDocumentNode[],
            };
            this.nodesById.set(id, group as MarkdownGroup);
            group.children = Object.freeze(this.build(definition.children, group as MarkdownGroup, depth + 1, id, pages));
            return Object.freeze(group) as MarkdownGroup;
        });
    }
}

export const createMarkdownOutline = (container: ParentNode, options: MarkdownOutlineOptions = {}): MarkdownOutlineItem[] => {
    const minLevel = Math.min(6, Math.max(1, options.minLevel ?? 1));
    const maxLevel = Math.min(6, Math.max(minLevel, options.maxLevel ?? 6));
    const used = new Set(Array.from(container.querySelectorAll('[id]'), ({ id }) => id));
    const seen = new Set<string>();
    const roots: MarkdownOutlineItem[] = [];
    const stack: MarkdownOutlineItem[] = [];
    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6')).filter(
        (heading) => !heading.closest('[data-markdown-extension]') && (options.include?.(heading) ?? true),
    );
    for (const heading of headings) {
        const level = Number(heading.tagName.slice(1));
        if (level < minLevel || level > maxLevel) continue;
        const title = heading.textContent?.trim() ?? '';
        if (!title) continue;
        let id = heading.id;
        if (!id || seen.has(id)) {
            const base = slug(id || title);
            id = base;
            let suffix = 1;
            while (used.has(id) || seen.has(id)) id = `${base}-${++suffix}`;
            heading.id = id;
            used.add(id);
        }
        seen.add(id);
        const item: MarkdownOutlineItem = { id, title, level, href: `#${id}`, children: [] };
        while (stack.length && stack.at(-1)!.level >= level) stack.pop();
        if (stack.length) stack.at(-1)!.children.push(item);
        else roots.push(item);
        stack.push(item);
    }
    return roots;
};
