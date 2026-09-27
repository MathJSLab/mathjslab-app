import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';

export const mathJaxManifest = {
    name: 'mathjax',
    description: 'GitHub-compatible TeX expressions rendered as SVG by MathJax.',
    dependencies: ['mathjax'],
    fences: [{ language: 'math', className: 'mathjax-pending' }],
    interactive: true,
    styles: `
.mathjax-pending { box-sizing: border-box; max-width: 100%; overflow-x: auto; }
.mathjax-pending > svg { height: auto; max-width: 100%; }
.mathjax-error { color: var(--calc-error, var(--red-text, #b42318)); white-space: pre-wrap; }
`,
} as const satisfies MarkdownExtensionManifest;
