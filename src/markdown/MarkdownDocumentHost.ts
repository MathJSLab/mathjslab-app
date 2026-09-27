import type { MarkdownDocumentContext, MarkdownEngine } from '../MarkdownEngine';
import { defineMarkdownDocumentElement, MarkdownDocumentElement, type MarkdownDocumentReadyDetail } from '../components/markdown-document/markdown-document.component';

export type MarkdownDocumentHostOptions = {
    readonly engine: MarkdownEngine;
    readonly context?: MarkdownDocumentContext;
    readonly markdown?: string;
    readonly src?: string | URL;
    readonly locale?: string;
    readonly theme?: 'light' | 'dark';
    readonly security?: 'trusted' | 'sanitized' | 'strict';
    readonly presentation?: 'document' | 'embedded';
    readonly outline?: 'sidebar' | 'inline' | 'hidden';
    readonly externalLinks?: 'same-context' | 'new-tab';
};

const hostedDocuments = new WeakMap<HTMLElement, MarkdownDocumentElement>();

const disposeHostedContent = async (container: HTMLElement): Promise<void> => {
    const element = hostedDocuments.get(container);
    hostedDocuments.delete(container);
    if (element) await element.dispose();
};

/**
 * Mount the reusable Markdown component in an existing application surface.
 */
export const mountMarkdownDocument = async (container: HTMLElement, options: MarkdownDocumentHostOptions): Promise<MarkdownDocumentElement> => {
    await disposeHostedContent(container);

    defineMarkdownDocumentElement();
    const element = new MarkdownDocumentElement();
    element.engine = options.engine;
    element.context = options.context ?? {};
    if (options.locale) element.setAttribute('locale', options.locale);
    if (options.theme) element.setAttribute('theme', options.theme);
    if (options.security) element.setAttribute('security', options.security);
    if (options.presentation === 'embedded') element.setAttribute('presentation', 'embedded');
    if (options.outline && options.outline !== 'sidebar') element.setAttribute('outline', options.outline);
    if (options.externalLinks === 'new-tab') element.setAttribute('external-links', 'new-tab');
    if (options.src !== undefined) element.src = options.src.toString();
    else element.markdown = options.markdown ?? '';

    const completion = new Promise<MarkdownDocumentElement>((resolve, reject) => {
        const ready = (event: Event): void => {
            cleanup();
            const detail = (event as CustomEvent<MarkdownDocumentReadyDetail>).detail;
            resolve(detail.element);
        };
        const error = (event: Event): void => {
            cleanup();
            reject((event as CustomEvent<{ error: unknown }>).detail.error);
        };
        const cleanup = (): void => {
            element.removeEventListener('markdown-ready', ready);
            element.removeEventListener('markdown-error', error);
        };
        element.addEventListener('markdown-ready', ready);
        element.addEventListener('markdown-error', error);
    });

    hostedDocuments.set(container, element);
    container.replaceChildren(element);
    return completion;
};

/** Release the component currently owned by an application surface. */
export const disposeMarkdownDocument = async (container: HTMLElement): Promise<void> => {
    const element = hostedDocuments.get(container);
    await disposeHostedContent(container);
    if (!element) {
        container.replaceChildren();
        return;
    }
    if (element.parentNode === container) element.remove();
};

export const getHostedMarkdownDocument = (container: HTMLElement): MarkdownDocumentElement | undefined => hostedDocuments.get(container);
