import type { MarkdownExtension } from '../../../MarkdownEngine';
import { mathJaxManifest } from './manifest';

type MathToken = {
    type: 'github-math-inline' | 'github-math-block';
    raw: string;
    text: string;
    display: boolean;
};

type MathJaxApi = {
    startup?: { promise?: Promise<void> };
    typesetPromise?: (elements?: Element[]) => Promise<void>;
    typesetClear?: (elements?: Element[]) => void;
};

const loadMathJaxComponent = (path: string): Promise<unknown> => {
    if (path.endsWith('/@mathjax/mathjax-mhchem-font-extension/svg.js')) {
        return import(/* webpackChunkName: "markdown-mathjax" */ '@mathjax/mathjax-mhchem-font-extension/svg.js');
    }
    if (path.endsWith('/input/tex/extensions/boldsymbol.js')) return import(/* webpackChunkName: "markdown-mathjax" */ 'mathjax/input/tex/extensions/boldsymbol.js');
    if (path.endsWith('/input/tex/extensions/mhchem.js')) return import(/* webpackChunkName: "markdown-mathjax" */ 'mathjax/input/tex/extensions/mhchem.js');
    if (path.endsWith('/input/tex/extensions/mathtools.js')) return import(/* webpackChunkName: "markdown-mathjax" */ 'mathjax/input/tex/extensions/mathtools.js');
    if (path.endsWith('/input/tex/extensions/physics.js')) return import(/* webpackChunkName: "markdown-mathjax" */ 'mathjax/input/tex/extensions/physics.js');
    if (path.endsWith('/input/tex/extensions/units.js')) return import(/* webpackChunkName: "markdown-mathjax" */ 'mathjax/input/tex/extensions/units.js');
    if (path.endsWith('/ui/safe.js')) return import(/* webpackChunkName: "markdown-mathjax" */ 'mathjax/ui/safe.js');
    return Promise.reject(new Error(`Unsupported MathJax component: ${path}`));
};

declare global {
    var MathJax: MathJaxApi | Record<string, unknown> | undefined;
}

const escapeHTML = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const placeholder = (source: string, display: boolean): string =>
    `<${display ? 'div' : 'span'} class="mathjax-pending" data-markdown-extension="mathjax" data-math-display="${display ? 'block' : 'inline'}"><span class="mathjax-source" hidden>${escapeHTML(source)}</span></${display ? 'div' : 'span'}>`;

const protectedInline = {
    name: 'github-math-protected-inline',
    level: 'inline' as const,
    start: (src: string): number | undefined => {
        const index = src.indexOf('$`');
        return index >= 0 ? index : undefined;
    },
    tokenizer: (src: string): MathToken | undefined => {
        const match = /^\$`([^`\r\n]+)`\$/.exec(src);
        if (!match) return;
        return { type: 'github-math-inline', raw: match[0], text: match[1]!, display: false };
    },
    renderer: (token: MathToken): string => placeholder(token.text, token.display),
};

const inlineMath = {
    name: 'github-math-inline',
    level: 'inline' as const,
    start: (src: string): number | undefined => {
        const index = src.indexOf('$');
        return index >= 0 ? index : undefined;
    },
    tokenizer: (src: string): MathToken | undefined => {
        const match = /^\$(?![\s$`])((?:\\.|[^\\$\r\n])+?)(?<!\s)\$(?!\d)/.exec(src);
        if (!match) return;
        return { type: 'github-math-inline', raw: match[0], text: match[1]!, display: false };
    },
    renderer: (token: MathToken): string => placeholder(token.text, token.display),
};

const blockMath = {
    name: 'github-math-block',
    level: 'block' as const,
    start: (src: string): number | undefined => {
        const match = /^ {0,3}\$\$/m.exec(src);
        return match?.index;
    },
    tokenizer: (src: string): MathToken | undefined => {
        const multiline = /^ {0,3}\$\$[ \t]*\r?\n([\s\S]*?)\r?\n {0,3}\$\$[ \t]*(?:\r?\n|$)/.exec(src);
        const singleLine = /^ {0,3}\$\$([^\r\n]+?)\$\$[ \t]*(?:\r?\n|$)/.exec(src);
        const match = multiline ?? singleLine;
        if (!match) return;
        return { type: 'github-math-block', raw: match[0], text: match[1]!.trim(), display: true };
    },
    renderer: (token: MathToken): string => placeholder(token.text, token.display),
};

export const mathJaxExtension = (): MarkdownExtension => {
    let mathJaxLoading: Promise<MathJaxApi> | undefined;
    let mathJax: MathJaxApi | undefined;
    const rendered = new Set<Element>();

    const loadMathJax = async (): Promise<MathJaxApi> => {
        if (globalThis.MathJax && typeof (globalThis.MathJax as MathJaxApi).typesetPromise === 'function') {
            mathJax = globalThis.MathJax as MathJaxApi;
            return mathJax;
        }
        if (!mathJaxLoading) {
            globalThis.MathJax = {
                loader: {
                    load: ['[tex]/mhchem', '[tex]/mathtools', '[tex]/physics', '[tex]/units', 'ui/safe'],
                    require: loadMathJaxComponent,
                },
                tex: {
                    packages: { '[+]': ['mhchem', 'mathtools', 'physics', 'units'] },
                    processEscapes: true,
                    require: {
                        defaultAllow: true,
                        allow: { base: false, autoload: false, configmacros: false, setoptions: false, tagformat: false, texhtml: false },
                    },
                },
                options: {
                    enableMenu: false,
                    enableEnrichment: false,
                    enableSpeech: false,
                    enableBraille: false,
                    menuOptions: { settings: { enrich: false, speech: false, braille: false } },
                },
                startup: { typeset: false },
            };
            mathJaxLoading = import(/* webpackChunkName: "markdown-mathjax" */ 'mathjax/tex-svg.js').then(async () => {
                const api = globalThis.MathJax as MathJaxApi;
                await api.startup?.promise;
                if (typeof api.typesetPromise !== 'function') throw new Error('MathJax failed to initialize');
                return api;
            });
        }
        mathJax = await mathJaxLoading;
        return mathJax;
    };

    return {
        name: mathJaxManifest.name,
        manifest: mathJaxManifest,
        marked: { extensions: [blockMath, protectedInline, inlineMath] },
        fences: [{ language: 'math', className: 'mathjax-pending', render: async () => undefined }],
        async typeset(container, context) {
            const elements = Array.from(container.querySelectorAll('.mathjax-pending')).filter((element) => !element.hasAttribute('data-mathjax-rendered'));
            if (elements.length === 0 || context.signal?.aborted) return;
            const mathJax = await loadMathJax();
            if (context.signal?.aborted) return;
            for (const element of elements) {
                const source = element.querySelector('.mathjax-source, .markdown-extension-source')?.textContent ?? '';
                const display = element.getAttribute('data-math-display') === 'block' || element.getAttribute('data-markdown-language') === 'math';
                element.replaceChildren(document.createTextNode(display ? `\\[${source}\\]` : `\\(${source}\\)`));
                element.setAttribute('data-mathjax-rendered', '');
            }
            try {
                await mathJax.typesetPromise!(elements);
                elements.forEach((element) => rendered.add(element));
            } catch (error) {
                for (const element of elements) {
                    const message = document.createElement('pre');
                    message.className = 'mathjax-error';
                    message.setAttribute('role', 'alert');
                    message.textContent = `MathJax: ${error instanceof Error ? error.message : String(error)}`;
                    element.replaceChildren(message);
                }
            }
        },
        dispose() {
            mathJax?.typesetClear?.(Array.from(rendered));
            for (const element of rendered) element.replaceChildren();
            rendered.clear();
            mathJaxLoading = undefined;
            mathJax = undefined;
        },
    };
};
