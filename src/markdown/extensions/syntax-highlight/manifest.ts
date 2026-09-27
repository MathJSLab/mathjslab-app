import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';

export const syntaxHighlightManifest = {
    name: 'syntax-highlight',
    description: 'Syntax highlighting for source-code fences.',
    dependencies: ['marked-highlight', 'highlight.js'],
    fences: [],
} as const satisfies MarkdownExtensionManifest;
