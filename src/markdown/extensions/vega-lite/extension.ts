import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine';
import { assertSourceSize, fetchResource, observeElementResize, readResourceText, renderExtensionError } from '../../extensionUtils';
import { markdownDiagnosticCodes } from '../../diagnostics';
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
        let result: VegaResult | undefined;
        let disconnect = (): void => undefined;
        try {
            assertSourceSize(source, context);
            const spec = JSON.parse(source) as Record<string, unknown>;
            await inlineDataUrls(spec, context);
            if (context.signal?.aborted) return;
            const { default: embed } = await import(/* webpackChunkName: "markdown-vega-lite" */ 'vega-embed');
            dispose(container);
            result = (await embed(container as HTMLElement, spec, {
                mode: 'vega-lite',
                renderer: 'svg',
                actions: false,
                theme: context.theme === 'dark' ? 'dark' : undefined,
            })) as unknown as VegaResult;
            if (context.signal?.aborted) {
                result.finalize();
                result = undefined;
                container.replaceChildren();
                return;
            }
            disconnect = observeElementResize(container, context, () => {
                if (context.signal?.aborted) return;
                result?.view.resize();
                void result?.view.runAsync().catch((error) =>
                    context.onDiagnostic?.({
                        extension: vegaLiteManifest.name,
                        language: 'vega-lite',
                        code: markdownDiagnosticCodes.vegaResizeError,
                        category: 'extension',
                        severity: 'warning',
                        ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
                        message: error instanceof Error ? error.message : String(error),
                        cause: error,
                    }),
                );
            });
            results.set(container, { result, disconnect });
            result = undefined;
            disconnect = (): void => undefined;
        } catch (error) {
            disconnect();
            try {
                result?.finalize();
            } catch {
                /* Preserve the original render diagnostic. */
            }
            results.delete(container);
            container.replaceChildren();
            if (!context.signal?.aborted) renderExtensionError(container, 'Vega-Lite', 'vega-lite', source, error, context);
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
