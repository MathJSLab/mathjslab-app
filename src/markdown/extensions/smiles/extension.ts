import type { MarkdownExtension } from '../../../MarkdownEngine';
import { smilesManifest } from './manifest';

type SmilesDrawerApi = typeof import('smiles-drawer').default;

export const smilesExtension = (): MarkdownExtension => {
    let sequence = 0;
    let loading: Promise<SmilesDrawerApi> | undefined;
    const rendered = new Set<Element>();

    const load = (): Promise<SmilesDrawerApi> => {
        loading ??= import(/* webpackChunkName: "markdown-smiles" */ 'smiles-drawer').then(({ default: SmilesDrawer }) => SmilesDrawer);
        return loading;
    };

    const render = async (container: Element, source: string): Promise<void> => {
        try {
            const SmilesDrawer = await load();
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.id = `mathjslab-smiles-${++sequence}`;
            const drawer = new SmilesDrawer.SvgDrawer({ width: 500, height: 300 });
            await new Promise<void>((resolve, reject) => {
                SmilesDrawer.parse(
                    source.trim(),
                    (tree) => {
                        try {
                            drawer.draw(tree, svg, 'light');
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    },
                    reject,
                );
            });
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-label', `SMILES: ${source.trim()}`);
            container.replaceChildren(svg);
            rendered.add(container);
        } catch (error) {
            const message = document.createElement('pre');
            message.className = 'smiles-error';
            message.setAttribute('role', 'alert');
            message.textContent = `SMILES: ${error instanceof Error ? error.message : String(error)}`;
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
        name: smilesManifest.name,
        manifest: smilesManifest,
        fences: [{ ...smilesManifest.fences[0], render, dispose: disposeContainer }],
        dispose() {
            for (const container of rendered) container.replaceChildren();
            rendered.clear();
            loading = undefined;
        },
    };
};
