import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';
import { extensionStyles } from '../../extensionUtils';

export const mapsManifest = {
    name: 'maps',
    description: 'Offline vector maps from GeoJSON and TopoJSON.',
    dependencies: ['leaflet', 'topojson-client'],
    fences: [
        { language: 'geojson', className: 'markdown-map' },
        { language: 'topojson', className: 'markdown-map' },
    ],
    interactive: true,
    capabilities: ['interactive', 'network'],
    formats: [
        { language: 'geojson', mimeTypes: ['application/geo+json'], extensions: ['.geojson'] },
        { language: 'topojson', mimeTypes: ['application/topo+json'], extensions: ['.topojson'] },
    ],
    styles: `${extensionStyles('markdown-map')}
.markdown-map { background: #eef2f3; height: min(28rem, 70vh); min-height: 18rem; }
.markdown-map .leaflet-container { height: 100%; width: 100%; }
`,
} as const satisfies MarkdownExtensionManifest;
