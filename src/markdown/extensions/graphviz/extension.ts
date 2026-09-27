import type { MarkdownExtension } from '../../../MarkdownEngine';
import { assertSourceSize, renderExtensionError, sanitizeSVG } from '../../extensionUtils';
import { graphvizManifest } from './manifest';

type Viz = Awaited<ReturnType<typeof import('@viz-js/viz').instance>>;

export const graphvizExtension = (): MarkdownExtension => {
    let loading: Promise<Viz> | undefined;
    const rendered = new Set<Element>();
    const load = (): Promise<Viz> => (loading ??= import(/* webpackChunkName: "markdown-graphviz" */ '@viz-js/viz').then(({ instance }) => instance()));

    const render = async (container: Element, source: string, context: Parameters<NonNullable<MarkdownExtension['fences']>[number]['render']>[2]): Promise<void> => {
        const language = container.getAttribute('data-markdown-language') ?? 'dot';
        try {
            assertSourceSize(source, context);
            if (context.signal?.aborted) return;
            const viz = await load();
            const svg = await sanitizeSVG(viz.renderString(source, { format: 'svg', engine: 'dot' }));
            if (context.signal?.aborted) return;
            container.innerHTML = svg;
            const image = container.querySelector('svg');
            image?.setAttribute('role', 'img');
            image?.setAttribute('aria-label', 'Graphviz diagram');
            rendered.add(container);
        } catch (error) {
            renderExtensionError(container, 'Graphviz', language, source, error, context);
        }
    };

    return {
        name: graphvizManifest.name,
        manifest: graphvizManifest,
        fences: graphvizManifest.fences.map((fence) => ({ ...fence, render, dispose: (container) => container.replaceChildren() })),
        dispose() {
            for (const container of rendered) container.replaceChildren();
            rendered.clear();
            loading = undefined;
        },
    };
};
