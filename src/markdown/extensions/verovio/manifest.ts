import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';
import { extensionStyles } from '../../extensionUtils';

export const verovioManifest = {
    name: 'verovio-music',
    description: 'Academic music scores rendered from MEI or MusicXML.',
    dependencies: ['verovio', 'dompurify'],
    fences: [
        { language: 'mei', className: 'verovio-music' },
        { language: 'musicxml', className: 'verovio-music' },
    ],
    capabilities: ['wasm'],
    formats: [
        { language: 'mei', mimeTypes: ['application/mei+xml'], extensions: ['.mei'] },
        { language: 'musicxml', mimeTypes: ['application/vnd.recordare.musicxml+xml'], extensions: ['.musicxml', '.xml'] },
    ],
    styles: extensionStyles('verovio-music'),
} as const satisfies MarkdownExtensionManifest;
