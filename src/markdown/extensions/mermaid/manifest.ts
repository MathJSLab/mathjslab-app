import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';

export const mermaidManifest = {
    name: 'mermaid',
    description: 'Mermaid diagrams rendered as SVG.',
    dependencies: ['mermaid'],
    fences: [{ language: 'mermaid', className: 'mermaid' }],
    interactive: true,
    styles: `
.mermaid { box-sizing: border-box; max-width: 100%; overflow-x: auto; }
.mermaid > svg { display: block; height: auto; max-width: 100%; }
.mermaid-error { color: var(--calc-error, var(--red-text, #b42318)); white-space: pre-wrap; }
`,
} as const satisfies MarkdownExtensionManifest;
