import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';

export const headingIdsManifest = {
    name: 'gfm-heading-ids',
    description: 'GitHub-compatible identifiers for Markdown headings.',
    dependencies: ['marked-gfm-heading-id'],
    fences: [],
} as const satisfies MarkdownExtensionManifest;
