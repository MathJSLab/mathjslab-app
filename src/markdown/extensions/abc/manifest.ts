import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';
import { extensionStyles } from '../../extensionUtils';

export const abcManifest = {
    name: 'abc-music',
    description: 'Music notation rendered from ABC source.',
    dependencies: ['abcjs', 'dompurify'],
    fences: [{ language: 'abc', className: 'abc-music' }],
    interactive: false,
    capabilities: ['audio'],
    formats: [{ language: 'abc', mimeTypes: ['text/vnd.abc'], extensions: ['.abc'] }],
    styles: extensionStyles('abc-music'),
} as const satisfies MarkdownExtensionManifest;
