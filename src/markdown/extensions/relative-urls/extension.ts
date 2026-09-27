import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine';
import { resolveResourceUrl } from '../../extensionUtils';
import { relativeUrlsManifest } from './manifest';

const resolveAttribute = (element: Element, attribute: 'href' | 'src', context: MarkdownDocumentContext): void => {
    const value = element.getAttribute(attribute);
    if (!value || value.startsWith('#')) return;
    try {
        if (attribute === 'href' && !element.hasAttribute('data-markdown-source-href')) element.setAttribute('data-markdown-source-href', value);
        element.setAttribute(attribute, resolveResourceUrl(value, context).href);
    } catch (cause) {
        element.removeAttribute(attribute);
        context.onDiagnostic?.({
            extension: relativeUrlsManifest.name,
            code: 'resource-url-blocked',
            severity: 'warning',
            ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
            message: cause instanceof Error ? cause.message : String(cause),
            cause,
        });
    }
};

export const relativeUrlsExtension = (): MarkdownExtension => ({
    name: relativeUrlsManifest.name,
    manifest: relativeUrlsManifest,
    prepare(container, context) {
        container.querySelectorAll('a[href]').forEach((element) => resolveAttribute(element, 'href', context));
        container.querySelectorAll('img[src]').forEach((element) => resolveAttribute(element, 'src', context));
    },
});
