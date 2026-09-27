import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';
import { extensionStyles } from '../../extensionUtils';

const languages = ['pdb', 'cif', 'mmcif', 'sdf', 'mol2', 'xyz', 'cube'] as const;

export const molecule3DManifest = {
    name: 'molecule-3d',
    description: 'Interactive molecular structures rendered with 3Dmol.js.',
    dependencies: ['3dmol'],
    fences: languages.map((language) => ({ language, className: 'molecule-3d' })),
    interactive: true,
    capabilities: ['interactive', 'webgl'],
    formats: languages.map((language) => ({ language, extensions: [`.${language}`] })),
    styles: `${extensionStyles('molecule-3d')}
.molecule-3d { background: var(--calc-surface, #fff); height: min(30rem, 70vh); min-height: 20rem; }
.molecule-3d > canvas { height: 100% !important; width: 100% !important; }
`,
} as const satisfies MarkdownExtensionManifest;
