import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';

export const smilesManifest = {
    name: 'smiles',
    description: 'Two-dimensional molecular structures from SMILES notation.',
    dependencies: ['smiles-drawer'],
    fences: [{ language: 'smiles', className: 'smiles' }],
    styles: `
.smiles { box-sizing: border-box; max-width: 100%; overflow-x: auto; }
.smiles > svg { background: white; display: block; height: auto; max-width: 100%; }
.smiles-error { color: var(--calc-error, var(--red-text, #b42318)); white-space: pre-wrap; }
`,
} as const satisfies MarkdownExtensionManifest;
