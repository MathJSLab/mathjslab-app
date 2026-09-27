import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';
import { extensionStyles } from '../../extensionUtils';

export const graphvizManifest = {
    name: 'graphviz',
    description: 'Graphviz graphs rendered from the DOT language.',
    dependencies: ['@viz-js/viz', 'dompurify'],
    fences: [
        { language: 'dot', className: 'graphviz' },
        { language: 'graphviz', className: 'graphviz' },
    ],
    interactive: true,
    capabilities: ['wasm'],
    formats: [{ language: 'dot', mimeTypes: ['text/vnd.graphviz'], extensions: ['.dot', '.gv'] }],
    styles: extensionStyles('graphviz'),
} as const satisfies MarkdownExtensionManifest;
