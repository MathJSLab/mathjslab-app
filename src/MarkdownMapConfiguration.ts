import { markdownMapProviders, type MarkdownMapOptions } from 'mathjslab-markdown/extensions';

/** Application defaults; rendering and provider selection live in the canonical engine. */
export const markdownMapConfiguration: MarkdownMapOptions = {
    defaultProvider: 'openstreetmap',
    providers: markdownMapProviders,
    showSelector: true,
};
