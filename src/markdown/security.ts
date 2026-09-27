import type { MarkdownDocumentContext, MarkdownResourcePolicy, MarkdownResourceService, MarkdownSecurityMode } from '../MarkdownEngine';
import { DEFAULT_MAX_RESOURCE_BYTES } from './extensionUtils';

const DEFAULT_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const;

type EffectiveResourcePolicy = Required<Omit<MarkdownResourcePolicy, 'allowedOrigins'>> & { allowedOrigins: readonly string[] | undefined };

const effectivePolicy = (context: MarkdownDocumentContext, defaults: MarkdownResourcePolicy): EffectiveResourcePolicy => ({
    allowNetwork: context.resourcePolicy?.allowNetwork ?? defaults.allowNetwork ?? true,
    allowDataUrls: context.resourcePolicy?.allowDataUrls ?? defaults.allowDataUrls ?? true,
    allowedProtocols: context.resourcePolicy?.allowedProtocols ?? defaults.allowedProtocols ?? DEFAULT_PROTOCOLS,
    allowedOrigins: context.resourcePolicy?.allowedOrigins ?? defaults.allowedOrigins,
    cache: context.resourcePolicy?.cache ?? defaults.cache ?? 'memory',
    maxResourceBytes: context.maxResourceBytes ?? context.resourcePolicy?.maxResourceBytes ?? defaults.maxResourceBytes ?? DEFAULT_MAX_RESOURCE_BYTES,
});

const byteLength = (value: string): number => new TextEncoder().encode(value).byteLength;

export class DefaultMarkdownResourceService implements MarkdownResourceService {
    private readonly textCache = new Map<string, Promise<string>>();
    private readonly objectUrls = new Set<string>();

    public constructor(private readonly defaults: MarkdownResourcePolicy = {}) {}

    public resolve(reference: string, context: MarkdownDocumentContext): URL {
        const url = context.resolveUrl ? context.resolveUrl(reference, context) : new URL(reference, context.sourceUrl ?? document.baseURI);
        return this.validate(url, context);
    }

    private validate(url: URL, context: MarkdownDocumentContext): URL {
        const policy = effectivePolicy(context, this.defaults);
        if (!policy.allowedProtocols.includes(url.protocol)) throw new Error(`Protocol is not allowed: ${url.protocol}`);
        if (url.protocol === 'data:' && !policy.allowDataUrls) throw new Error('Data URLs are not allowed');
        if ((url.protocol === 'http:' || url.protocol === 'https:') && !policy.allowNetwork) throw new Error('Network access is not allowed');
        if ((url.protocol === 'http:' || url.protocol === 'https:') && policy.allowedOrigins && !policy.allowedOrigins.includes(url.origin)) {
            throw new Error(`Origin is not allowed: ${url.origin}`);
        }
        return url;
    }

    public async fetch(reference: string | URL, context: MarkdownDocumentContext): Promise<Response> {
        const url = reference instanceof URL ? this.validate(reference, context) : this.resolve(reference, context);
        if (context.signal?.aborted) throw context.signal.reason ?? new DOMException('Aborted', 'AbortError');
        const init: RequestInit = context.signal ? { signal: context.signal } : {};
        const response = context.fetchResource ? await context.fetchResource(url, init, context) : await fetch(url, init);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const length = Number(response.headers.get('content-length'));
        const limit = effectivePolicy(context, this.defaults).maxResourceBytes;
        if (Number.isFinite(length) && length > limit) throw new Error(`Resource exceeds the configured limit (${length} bytes)`);
        return response;
    }

    public readText(reference: string | URL, context: MarkdownDocumentContext): Promise<string> {
        const url = reference instanceof URL ? this.validate(reference, context) : this.resolve(reference, context);
        const policy = effectivePolicy(context, this.defaults);
        const load = async (): Promise<string> => {
            const response = await this.fetch(url, context);
            const text = await response.text();
            const bytes = byteLength(text);
            if (bytes > policy.maxResourceBytes) throw new Error(`Resource exceeds the configured limit (${bytes} bytes)`);
            return text;
        };
        if (policy.cache !== 'memory') return load();
        let pending = this.textCache.get(url.href);
        if (!pending) {
            pending = load().catch((error) => {
                this.textCache.delete(url.href);
                throw error;
            });
            this.textCache.set(url.href, pending);
        }
        return pending;
    }

    public createObjectURL(blob: Blob): string {
        const url = URL.createObjectURL(blob);
        this.objectUrls.add(url);
        return url;
    }

    public revokeObjectURL(url: string): void {
        if (!this.objectUrls.delete(url)) return;
        URL.revokeObjectURL(url);
    }

    public dispose(): void {
        this.textCache.clear();
        for (const url of this.objectUrls) URL.revokeObjectURL(url);
        this.objectUrls.clear();
    }
}

export const sanitizeMarkdownHTML = async (html: string, mode: MarkdownSecurityMode): Promise<string> => {
    if (mode === 'trusted') return html;
    const { default: DOMPurify } = await import('dompurify');
    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'meta', 'link', 'base', 'foreignObject'],
        FORBID_ATTR: ['srcdoc'],
    });
};
