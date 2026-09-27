import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine';
import { assertSourceSize, fetchResource, observeElementResize, readResourceText, renderExtensionError } from '../../extensionUtils';
import { vegaLiteManifest } from './manifest';

type VegaResult = { view: { resize(): unknown; runAsync(): Promise<unknown> }; finalize(): void };

const inlineDataUrls = async (value: unknown, context: MarkdownDocumentContext): Promise<void> => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
        await Promise.all(value.map((entry) => inlineDataUrls(entry, context)));
        return;
    }
    const record = value as Record<string, unknown>;
    if (record.data && typeof record.data === 'object' && typeof (record.data as Record<string, unknown>).url === 'string') {
        const data = record.data as Record<string, unknown>;
        const text = context.resources ? await context.resources.readText(data.url as string, context) : await readResourceText(await fetchResource(data.url as string, context), context);
        const { read } = await import(/* webpackChunkName: "markdown-vega-lite" */ 'vega');
        const format = (data.format as { type?: string } | undefined)?.type ?? (/\.csv(?:$|\?)/i.test(data.url as string) ? 'csv' : 'json');
        data.values = read(text, { type: format as 'csv' | 'json' });
        delete data.url;
    }
    await Promise.all(Object.values(record).map((entry) => inlineDataUrls(entry, context)));
};

export const vegaLiteExtension = (): MarkdownExtension => {
    const results = new Map<Element, { result: VegaResult; disconnect: () => void }>();
    const dispose = (container: Element): void => {
        const entry = results.get(container);
        entry?.disconnect();
        entry?.result.finalize();
        results.delete(container);
        container.replaceChildren();
    };
    const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
        try {
            assertSourceSize(source, context);
            const spec = JSON.parse(source) as Record<string, unknown>;
            await inlineDataUrls(spec, context);
            if (context.signal?.aborted) return;
            const { default: embed } = await import(/* webpackChunkName: "markdown-vega-lite" */ 'vega-embed');
            dispose(container);
            const result = (await embed(container as HTMLElement, spec, {
                mode: 'vega-lite',
                renderer: 'svg',
                actions: false,
                theme: context.theme === 'dark' ? 'dark' : undefined,
            })) as unknown as VegaResult;
            if (context.signal?.aborted) {
                result.finalize();
                container.replaceChildren();
                return;
            }
            const disconnect = observeElementResize(container, context, () => {
                result.view.resize();
                void result.view.runAsync();
            });
            results.set(container, { result, disconnect });
        } catch (error) {
            renderExtensionError(container, 'Vega-Lite', 'vega-lite', source, error, context);
        }
    };
    return {
        name: vegaLiteManifest.name,
        manifest: vegaLiteManifest,
        fences: [{ ...vegaLiteManifest.fences[0], render, dispose }],
        dispose() {
            for (const container of Array.from(results.keys())) dispose(container);
        },
    };
};
