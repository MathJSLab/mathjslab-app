import type { MarkdownDocumentContext, MarkdownResourcePolicy, MarkdownResourceService, MarkdownSecurityMode } from '../MarkdownEngine';
import { DEFAULT_MAX_RESOURCE_BYTES } from './extensionUtils';
import { markdownDiagnosticCategory, markdownDiagnosticCodes } from './diagnostics';

const DEFAULT_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const;

class MarkdownResourcePolicyError extends Error {
    public constructor(
        message: string,
        public readonly code: 'resource-url-blocked' | 'resource-size-limit',
    ) {
        super(message);
        this.name = 'MarkdownResourcePolicyError';
    }
}

const reportedResourceErrors = new WeakSet<object>();

const reportResourceError = (context: MarkdownDocumentContext, cause: unknown): Error => {
    const error = cause instanceof Error ? cause : new Error(String(cause), { cause });
    if (reportedResourceErrors.has(error)) return error;
    reportedResourceErrors.add(error);
    if (context.signal?.aborted) return error;
    const code = cause instanceof MarkdownResourcePolicyError ? cause.code : markdownDiagnosticCodes.resourceLoadError;
    context.onDiagnostic?.({
        extension: 'resource-service',
        code,
        category: markdownDiagnosticCategory(code),
        severity: code === 'resource-load-error' ? 'error' : 'warning',
        ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
        message: error.message,
        cause,
    });
    return error;
};

type EffectiveResourcePolicy = Required<Omit<MarkdownResourcePolicy, 'allowedOrigins'>> & { allowedOrigins: readonly string[] | undefined };

const effectivePolicy = (context: MarkdownDocumentContext, defaults: MarkdownResourcePolicy): EffectiveResourcePolicy => ({
    allowNetwork: context.resourcePolicy?.allowNetwork ?? defaults.allowNetwork ?? true,
    allowDataUrls: context.resourcePolicy?.allowDataUrls ?? defaults.allowDataUrls ?? (context.securityMode !== 'sanitized' && context.securityMode !== 'strict'),
    allowedProtocols: context.resourcePolicy?.allowedProtocols ?? defaults.allowedProtocols ?? DEFAULT_PROTOCOLS,
    allowedOrigins:
        context.resourcePolicy?.allowedOrigins ??
        defaults.allowedOrigins ??
        (context.securityMode === 'sanitized' || context.securityMode === 'strict' ? (context.sourceUrl ? [context.sourceUrl.origin] : []) : undefined),
    cache: context.resourcePolicy?.cache ?? defaults.cache ?? 'memory',
    maxResourceBytes: context.maxResourceBytes ?? context.resourcePolicy?.maxResourceBytes ?? defaults.maxResourceBytes ?? DEFAULT_MAX_RESOURCE_BYTES,
});

const byteLength = (value: string): number => new TextEncoder().encode(value).byteLength;

const readBoundedBytes = async (response: Response, limit: number): Promise<Uint8Array> => {
    if (!response.body) return new TextEncoder().encode(await response.text());
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > limit) {
                await reader.cancel();
                throw new MarkdownResourcePolicyError(`Resource exceeds the configured limit (${size} bytes)`, 'resource-size-limit');
            }
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    const result = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return result;
};

const readBoundedBlob = async (response: Response, limit: number): Promise<Blob> => {
    if (!response.body) {
        const blob = await response.blob();
        if (blob.size > limit) throw new MarkdownResourcePolicyError(`Resource exceeds the configured limit (${blob.size} bytes)`, 'resource-size-limit');
        return blob;
    }
    const bytes = await readBoundedBytes(response, limit);
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return new Blob([buffer], { type: response.headers.get('content-type') ?? '' });
};

export class DefaultMarkdownResourceService implements MarkdownResourceService {
    private readonly textCache = new Map<string, string>();
    private readonly objectUrls = new Set<string>();
    private disposed = false;
    private readonly controller = new AbortController();

    public constructor(private readonly defaults: MarkdownResourcePolicy = {}) {}

    public resolve(reference: string, context: MarkdownDocumentContext): URL {
        this.assertActive();
        try {
            const url = context.resolveUrl ? context.resolveUrl(reference, context) : new URL(reference, context.sourceUrl ?? document.baseURI);
            return this.validate(url, context);
        } catch (cause) {
            throw reportResourceError(context, cause);
        }
    }

    private validate(url: URL, context: MarkdownDocumentContext): URL {
        this.assertActive();
        const policy = effectivePolicy(context, this.defaults);
        if (!policy.allowedProtocols.includes(url.protocol)) throw new MarkdownResourcePolicyError(`Protocol is not allowed: ${url.protocol}`, 'resource-url-blocked');
        if (url.protocol === 'data:' && !policy.allowDataUrls) throw new MarkdownResourcePolicyError('Data URLs are not allowed', 'resource-url-blocked');
        if ((url.protocol === 'http:' || url.protocol === 'https:') && !policy.allowNetwork) throw new MarkdownResourcePolicyError('Network access is not allowed', 'resource-url-blocked');
        if ((url.protocol === 'http:' || url.protocol === 'https:') && policy.allowedOrigins && !policy.allowedOrigins.includes(url.origin)) {
            throw new MarkdownResourcePolicyError(`Origin is not allowed: ${url.origin} (allowed: ${policy.allowedOrigins.join(', ') || 'none'})`, 'resource-url-blocked');
        }
        return url;
    }

    public async fetch(reference: string | URL, context: MarkdownDocumentContext): Promise<Response> {
        try {
            return await this.fetchValidated(reference, context);
        } catch (cause) {
            if (context.signal?.aborted || this.controller.signal.aborted) throw cause;
            throw reportResourceError(context, cause);
        }
    }

    private async fetchValidated(reference: string | URL, context: MarkdownDocumentContext): Promise<Response> {
        let url = reference instanceof URL ? this.validate(reference, context) : this.resolve(reference, context);
        if (context.signal?.aborted) throw context.signal.reason ?? new DOMException('Aborted', 'AbortError');
        const signal = context.signal ? AbortSignal.any([context.signal, this.controller.signal]) : this.controller.signal;
        let response: Response;
        for (let redirects = 0; ; redirects++) {
            const init: RequestInit = { signal, redirect: 'manual' };
            response = context.fetchResource ? await context.fetchResource(url, init, { ...context, signal }) : await fetch(url, init);
            signal.throwIfAborted();
            if (response.type === 'opaqueredirect' || response.status === 0)
                throw new MarkdownResourcePolicyError('Opaque redirects are not allowed by the Markdown resource policy', 'resource-url-blocked');
            if ([301, 302, 303, 307, 308].includes(response.status)) {
                if (redirects >= 5) throw new MarkdownResourcePolicyError('Resource exceeded the redirect limit', 'resource-url-blocked');
                const location = response.headers.get('location');
                if (!location) throw new MarkdownResourcePolicyError('Resource redirect has no visible Location header', 'resource-url-blocked');
                url = this.validate(new URL(location, url), context);
                continue;
            }
            if (response.url) {
                const finalUrl = new URL(response.url);
                if (finalUrl.href !== url.href) this.validate(finalUrl, context);
            }
            break;
        }
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const length = Number(response.headers.get('content-length'));
        const limit = effectivePolicy(context, this.defaults).maxResourceBytes;
        if (Number.isFinite(length) && length > limit) throw new MarkdownResourcePolicyError(`Resource exceeds the configured limit (${length} bytes)`, 'resource-size-limit');
        return response;
    }

    public async readText(reference: string | URL, context: MarkdownDocumentContext): Promise<string> {
        const url = reference instanceof URL ? this.validate(reference, context) : this.resolve(reference, context);
        const policy = effectivePolicy(context, this.defaults);
        const cached = this.textCache.get(url.href);
        if (cached !== undefined) {
            if (byteLength(cached) > policy.maxResourceBytes)
                throw new MarkdownResourcePolicyError(`Resource exceeds the configured limit (${byteLength(cached)} bytes)`, 'resource-size-limit');
            return cached;
        }
        const response = await this.fetch(url, context);
        let text: string;
        try {
            text = response.body ? new TextDecoder().decode(await readBoundedBytes(response, policy.maxResourceBytes)) : await response.text();
            const bytes = byteLength(text);
            if (bytes > policy.maxResourceBytes) throw new MarkdownResourcePolicyError(`Resource exceeds the configured limit (${bytes} bytes)`, 'resource-size-limit');
        } catch (cause) {
            if (context.signal?.aborted || this.controller.signal.aborted) throw cause;
            throw reportResourceError(context, cause);
        }
        this.assertActive();
        context.signal?.throwIfAborted();
        // Cache completed content only: an in-flight request belongs to its caller's signal.
        if (policy.cache === 'memory') this.textCache.set(url.href, text);
        return text;
    }

    public createObjectURL(blob: Blob): string {
        this.assertActive();
        const url = URL.createObjectURL(blob);
        this.objectUrls.add(url);
        return url;
    }

    public revokeObjectURL(url: string): void {
        if (!this.objectUrls.delete(url)) return;
        URL.revokeObjectURL(url);
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.controller.abort();
        this.textCache.clear();
        for (const url of this.objectUrls) URL.revokeObjectURL(url);
        this.objectUrls.clear();
    }
    private assertActive(): void {
        if (this.disposed) throw new Error('Markdown resource service is disposed');
    }
}

export const sanitizeMarkdownHTML = async (html: string, mode: MarkdownSecurityMode, context: MarkdownDocumentContext = {}, defaults: MarkdownResourcePolicy = {}): Promise<string> => {
    let safeHTML = html;
    if (mode !== 'trusted') {
        const { default: DOMPurify } = await import('dompurify');
        safeHTML = DOMPurify.sanitize(html, {
            USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
            FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'audio', 'video', 'track', 'meta', 'link', 'base', 'foreignObject', 'style'],
            FORBID_ATTR: ['srcdoc', 'style', 'background'],
        });
    }

    // Validate URLs while the returned HTML is still inert. Once a caller assigns
    // it to innerHTML, the browser may start fetching images immediately.
    const template = document.createElement('template');
    template.innerHTML = safeHTML;
    const inertRoot = template.content ?? (template as unknown as ParentNode);
    const resources = context.resources ?? new DefaultMarkdownResourceService(defaults);
    const resolveImage = async (reference: string): Promise<string> => {
        const url = resources.resolve(reference, context);
        // Displaying a cross-origin image does not require CORS, but fetching it
        // here to create a blob URL does. Keep the validated URL so the browser
        // can load it as an image; same-origin resources remain mediated and
        // bounded by the resource service below.
        if (!context.fetchResource && (url.protocol === 'http:' || url.protocol === 'https:') && typeof location !== 'undefined' && url.origin !== location.origin) return url.href;
        if (!context.resources || (typeof fetch !== 'function' && !context.fetchResource)) return url.href;
        const response = await resources.fetch(url, context);
        const blob = await readBoundedBlob(response, effectivePolicy(context, defaults).maxResourceBytes);
        context.signal?.throwIfAborted();
        const limit = effectivePolicy(context, defaults).maxResourceBytes;
        if (blob.size > limit) throw new MarkdownResourcePolicyError(`Resource exceeds the configured limit (${blob.size} bytes)`, 'resource-size-limit');
        if (!blob.type.startsWith('image/')) throw new Error(`Image resource has an invalid media type: ${blob.type || 'unknown'}`);
        return resources.createObjectURL(blob);
    };
    const urlAttributes = ['href', 'src', 'xlink:href', 'poster', 'action', 'formaction', 'cite', 'background'];
    for (const element of inertRoot.querySelectorAll('*')) {
        for (const attribute of urlAttributes) {
            const value = element.getAttribute(attribute);
            if (!value || value.startsWith('#')) continue;
            try {
                const url = resources.resolve(value, context);
                const imageSource =
                    (attribute === 'src' && (element.tagName === 'IMG' || element.tagName === 'SOURCE')) ||
                    ((attribute === 'href' || attribute === 'xlink:href') && element.localName === 'image' && element.namespaceURI === 'http://www.w3.org/2000/svg');
                if (imageSource && context.resources && (typeof fetch === 'function' || context.fetchResource)) {
                    element.setAttribute(attribute, await resolveImage(value));
                } else if (imageSource && element.tagName === 'IMG') {
                    element.setAttribute(attribute, await resolveImage(value));
                } else {
                    element.setAttribute(attribute, url.href);
                }
                if (attribute === 'href' && element.tagName === 'A' && !element.hasAttribute('data-markdown-source-href')) {
                    element.setAttribute('data-markdown-source-href', value);
                }
            } catch (cause) {
                element.removeAttribute(attribute);
                if (!context.signal?.aborted) reportBlockedResource(context, cause);
            }
        }
        const srcset = element.getAttribute('srcset');
        if (srcset) {
            try {
                const resolved = await Promise.all(
                    srcset.split(',').map(async (candidate) => {
                        const [reference, ...descriptors] = candidate.trim().split(/\s+/);
                        if (!reference) throw new Error('Invalid srcset candidate');
                        return [await resolveImage(reference), ...descriptors].join(' ');
                    }),
                );
                element.setAttribute('srcset', resolved.join(', '));
            } catch (cause) {
                element.removeAttribute('srcset');
                if (!context.signal?.aborted) reportBlockedResource(context, cause);
            }
        }
    }
    return template.innerHTML;
};

const reportBlockedResource = (context: MarkdownDocumentContext, cause: unknown): void => {
    if (context.signal?.aborted) return;
    if (cause !== null && (typeof cause === 'object' || typeof cause === 'function') && reportedResourceErrors.has(cause)) return;
    context.onDiagnostic?.({
        extension: 'relative-urls',
        code: cause instanceof MarkdownResourcePolicyError ? cause.code : markdownDiagnosticCodes.resourceLoadError,
        category: markdownDiagnosticCategory(cause instanceof MarkdownResourcePolicyError ? cause.code : markdownDiagnosticCodes.resourceLoadError),
        severity: cause instanceof MarkdownResourcePolicyError ? 'warning' : 'error',
        ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
        message: cause instanceof Error ? cause.message : String(cause),
        cause,
    });
};
