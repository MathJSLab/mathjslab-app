import { appEngine } from './appEngine';
import mermaid from 'mermaid';
import { marked, MarkedOptions } from 'marked';

let renderMermaid: boolean = false;

abstract class Markdown {
    public static initialize(): void {
        const renderer = {
            code: (token: { lang?: string; text: string }): string => {
                switch (token.lang) {
                    case 'mermaid':
                        renderMermaid = true;
                        return `<div class="mermaid" align="center">${token.text}</div>`;
                    default:
                        return `<pre><code>${token.text}</code></pre>`;
                }
            },
            codespan: (token: { text: string }): string => {
                const text = token.text.trim();
                const singleMatch = text.match(/^%([\s\S]*?)%$/);
                const doubleMatch = text.match(/^%%([\s\S]*?)%%$/);
                if (doubleMatch) {
                    return appEngine.evaluator.toMathML(doubleMatch[1], 'block');
                } else if (singleMatch) {
                    return appEngine.evaluator.toMathML(singleMatch[1], 'inline');
                } else {
                    return `<code>${token.text}</code>`;
                }
            },
        };
        marked.use({
            renderer,
            breaks: false,
        });
        mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose',
        });
    }

    /**
     *
     * @param src
     * @param options
     * @returns
     */
    public static parse: (src: string, options?: MarkedOptions<string, string> | null | undefined) => string = (src: string, options?: MarkedOptions | null): string =>
        marked.parse(src, options) as string;

    /**
     *
     * @param element
     */
    public static typeset(element?: HTMLDivElement): void {
        if (renderMermaid) {
            const found: Element[] = [];
            const walker = (node: ParentNode) => {
                node.querySelectorAll('.mermaid').forEach((el) => found.push(el));
                node.querySelectorAll('*').forEach((el) => {
                    if (el.shadowRoot) walker(el.shadowRoot);
                });
            };
            walker(element ?? document);
            found.map(async (m, i) => {
                const textarea = document.createElement('textarea');
                textarea.innerHTML = m.innerHTML;
                const { svg, bindFunctions } = await mermaid.render(`mermaid-${i + 1}-${element!.id}`, textarea.value);
                m.innerHTML = svg;
                bindFunctions?.(m);
            });
            renderMermaid = false;
        }
    }
}
export { Markdown };
export default { Markdown };
