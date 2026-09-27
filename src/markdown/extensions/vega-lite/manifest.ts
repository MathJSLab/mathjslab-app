import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';
import { extensionStyles } from '../../extensionUtils';

export const vegaLiteManifest = {
    name: 'vega-lite',
    description: 'Declarative statistical visualizations using Vega-Lite JSON.',
    dependencies: ['vega', 'vega-lite', 'vega-embed'],
    fences: [{ language: 'vega-lite', className: 'vega-lite' }],
    interactive: true,
    capabilities: ['interactive', 'network'],
    formats: [{ language: 'vega-lite', mimeTypes: ['application/vnd.vegalite.v6+json', 'application/json'], extensions: ['.vl.json'] }],
    styles: `${extensionStyles('vega-lite')}
.vega-lite .vega-embed { width: 100%; }
.vega-lite .vega-actions { font-size: .85rem; }
`,
} as const satisfies MarkdownExtensionManifest;
