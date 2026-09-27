import type { MarkdownExtension } from '../../../MarkdownEngine';
import { assertSourceSize, renderExtensionError, sanitizeSVG } from '../../extensionUtils';
import { verovioManifest } from './manifest';

type Toolkit = { loadData(data: string): boolean; renderToSVG(page: number, options?: object): string; setOptions(options: object): void; destroy(): void };

export const verovioExtension = (): MarkdownExtension => {
    const toolkits = new Map<Element, Toolkit>();
    let loading: Promise<{ module: unknown; Toolkit: new (module: unknown) => Toolkit }> | undefined;
    const load = () =>
        (loading ??= Promise.all([import(/* webpackChunkName: "markdown-verovio" */ 'verovio/wasm'), import(/* webpackChunkName: "markdown-verovio" */ 'verovio/esm')]).then(
            async ([wasm, esm]) => ({
                module: await wasm.default(),
                Toolkit: esm.VerovioToolkit as unknown as new (module: unknown) => Toolkit,
            }),
        ));
    const dispose = (container: Element): void => {
        toolkits.get(container)?.destroy();
        toolkits.delete(container);
        container.replaceChildren();
    };
    const render = async (container: Element, source: string, context: Parameters<NonNullable<MarkdownExtension['fences']>[number]['render']>[2]): Promise<void> => {
        const language = container.getAttribute('data-markdown-language') ?? 'mei';
        let toolkit: Toolkit | undefined;
        try {
            assertSourceSize(source, context);
            const { module, Toolkit } = await load();
            if (context.signal?.aborted) return;
            dispose(container);
            toolkit = new Toolkit(module);
            toolkit.setOptions({ inputFrom: language, svgViewBox: true, adjustPageHeight: true, scale: 35 });
            if (!toolkit.loadData(source)) throw new Error('The score could not be parsed');
            container.innerHTML = await sanitizeSVG(toolkit.renderToSVG(1, {}));
            const image = container.querySelector('svg');
            image?.setAttribute('role', 'img');
            image?.setAttribute('aria-label', language === 'mei' ? 'MEI musical score' : 'MusicXML musical score');
            toolkits.set(container, toolkit);
        } catch (error) {
            toolkit?.destroy();
            renderExtensionError(container, 'Verovio', language, source, error, context);
        }
    };
    return {
        name: verovioManifest.name,
        manifest: verovioManifest,
        fences: verovioManifest.fences.map((fence) => ({ ...fence, render, dispose })),
        dispose() {
            for (const container of Array.from(toolkits.keys())) dispose(container);
            loading = undefined;
        },
    };
};
