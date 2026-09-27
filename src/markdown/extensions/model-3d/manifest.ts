import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';
import { extensionStyles } from '../../extensionUtils';

export const model3DManifest = {
    name: 'model-3d',
    description: 'Interactive 3D models from ASCII STL, OBJ, and glTF JSON.',
    dependencies: ['three'],
    fences: [
        { language: 'stl', className: 'model-3d' },
        { language: 'obj', className: 'model-3d' },
        { language: 'gltf', className: 'model-3d' },
    ],
    interactive: true,
    capabilities: ['interactive', 'network', 'webgl'],
    formats: [
        { language: 'stl', mimeTypes: ['model/stl'], extensions: ['.stl'] },
        { language: 'obj', mimeTypes: ['model/obj'], extensions: ['.obj'] },
        { language: 'gltf', mimeTypes: ['model/gltf+json'], extensions: ['.gltf'] },
    ],
    styles: `${extensionStyles('model-3d')}
.model-3d { background: var(--calc-surface, #fff); height: min(30rem, 70vh); min-height: 20rem; }
.model-3d > canvas { height: 100% !important; width: 100% !important; }
`,
} as const satisfies MarkdownExtensionManifest;
