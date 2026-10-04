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

type HostedDocument = { readonly element: MarkdownDocumentElement; cancelMount: () => void };
const hostedDocuments = new WeakMap<HTMLElement, HostedDocument>();
const mountRevisions = new WeakMap<HTMLElement, number>();
const hostDisposals = new WeakMap<HTMLElement, Promise<void>>();

const abortError = (): DOMException => new DOMException('Markdown document mount was cancelled', 'AbortError');

const disposeHostedContent = (container: HTMLElement): Promise<void> => {
    const disposing = hostDisposals.get(container);
    if (disposing) return disposing;
    const hosted = hostedDocuments.get(container);
    if (!hosted) return Promise.resolve();
    hostedDocuments.delete(container);
    hosted.cancelMount();
    const disposal = Promise.resolve()
        .then(() => hosted.element.dispose())
        .then(() => undefined)
        .finally(() => {
            if (hostDisposals.get(container) === disposal) hostDisposals.delete(container);
        });
    hostDisposals.set(container, disposal);
    return disposal;
};

/**
 * Mount the reusable Markdown component in an existing application surface.
 */
export const mountMarkdownDocument = async (container: HTMLElement, options: MarkdownDocumentHostOptions): Promise<MarkdownDocumentElement> => {
    const revision = (mountRevisions.get(container) ?? 0) + 1;
    mountRevisions.set(container, revision);
    await disposeHostedContent(container);
    if (mountRevisions.get(container) !== revision) throw abortError();

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

    let cancelMount!: () => void;
    let hosted!: HostedDocument;
    let observer: MutationObserver | undefined;
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
            observer?.disconnect();
        };
        cancelMount = () => {
            cleanup();
            if (hostedDocuments.get(container) === hosted) hostedDocuments.delete(container);
            reject(abortError());
        };
        element.addEventListener('markdown-ready', ready);
        element.addEventListener('markdown-error', error);
    });

    observer =
        typeof MutationObserver === 'undefined'
            ? undefined
            : new MutationObserver(() => {
                  if (!container.contains(element)) cancelMount();
              });
    hosted = { element, cancelMount };
    observer?.observe(container, { childList: true });
    hostedDocuments.set(container, hosted);
    container.replaceChildren(element);
    return completion;
};

/** Release the component currently owned by an application surface. */
export const disposeMarkdownDocument = async (container: HTMLElement): Promise<void> => {
    mountRevisions.set(container, (mountRevisions.get(container) ?? 0) + 1);
    const element = hostedDocuments.get(container)?.element;
    await disposeHostedContent(container);
    if (!element) {
        container.replaceChildren();
        return;
    }
    if (element.parentNode === container) element.remove();
};

export const getHostedMarkdownDocument = (container: HTMLElement): MarkdownDocumentElement | undefined => hostedDocuments.get(container)?.element;
