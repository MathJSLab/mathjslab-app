import type { MarkdownExtensionManifest } from '../../../MarkdownEngine';

export const mathJSLabManifest = {
    name: 'mathjslab',
    description: 'MathJSLab expressions and executable command blocks.',
    dependencies: ['mathjslab'],
    fences: [{ language: 'mathjslab', className: 'mathjslab-execution' }],
    interactive: true,
    styles: `
.mathjslab-execution { box-sizing: border-box; max-width: 100%; min-width: 0; }
.mathjslab-result { box-sizing: border-box; max-width: 100%; overflow-x: auto; }
.mathjslab-error { color: var(--calc-error, var(--red-text, #b42318)); white-space: pre-wrap; }
`,
} as const satisfies MarkdownExtensionManifest;
