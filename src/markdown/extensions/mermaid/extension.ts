import type { MarkdownExtension } from '../../../MarkdownEngine';
import { mermaidManifest } from './manifest';

type MermaidApi = typeof import('mermaid').default;

export const mermaidExtension = (): MarkdownExtension => {
    let sequence = 0;
    let loading: Promise<MermaidApi> | undefined;
    const rendered = new Set<Element>();

    const load = (): Promise<MermaidApi> => {
        loading ??= import(/* webpackChunkName: "markdown-mermaid" */ 'mermaid').then(({ default: mermaid }) => {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'neutral',
                securityLevel: 'loose',
                suppressErrorRendering: true,
            });
            return mermaid;
        });
        return loading;
    };

    const render = async (container: Element, source: string): Promise<void> => {
        try {
            const mermaid = await load();
            const { svg, bindFunctions } = await mermaid.render(`mathjslab-mermaid-${++sequence}`, source);
            container.innerHTML = svg;
            bindFunctions?.(container);
            rendered.add(container);
        } catch (error) {
            const message = document.createElement('pre');
            message.className = 'mermaid-error';
            message.setAttribute('role', 'alert');
            message.textContent = `Mermaid: ${error instanceof Error ? error.message : String(error)}`;
            const code = document.createElement('pre');
            code.textContent = source;
            container.replaceChildren(message, code);
        }
    };

    const disposeContainer = (container: Element): void => {
        rendered.delete(container);
        container.replaceChildren();
    };

    return {
        name: mermaidManifest.name,
        manifest: mermaidManifest,
        fences: [{ ...mermaidManifest.fences[0], render, dispose: disposeContainer }],
        dispose() {
            for (const container of rendered) container.replaceChildren();
            rendered.clear();
            loading = undefined;
        },
    };
};
