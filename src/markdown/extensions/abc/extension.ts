import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine';
import { assertSourceSize, renderExtensionError, sanitizeSVG } from '../../extensionUtils';
import { abcManifest } from './manifest';

export const abcExtension = (): MarkdownExtension => {
    const rendered = new Map<Element, { stop?: () => void; remove?: () => void }>();
    const dispose = (container: Element): void => {
        const entry = rendered.get(container);
        entry?.stop?.();
        entry?.remove?.();
        rendered.delete(container);
        container.replaceChildren();
    };
    const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
        try {
            assertSourceSize(source, context);
            const abcjs = await import(/* webpackChunkName: "markdown-abc" */ 'abcjs');
            if (context.signal?.aborted) return;
            dispose(container);
            const tunes = abcjs.renderAbc(container, source, { responsive: 'resize', add_classes: true });
            if (!tunes.length) throw new Error('No score could be produced');
            container.innerHTML = await sanitizeSVG(container.innerHTML);
            const image = container.querySelector('svg');
            image?.setAttribute('role', 'img');
            image?.setAttribute('aria-label', context.locale?.startsWith('pt') ? 'Partitura musical' : 'Musical score');
            const entry: { stop?: () => void; remove?: () => void } = {};
            if (context.enableAudio && abcjs.synth.supportsAudio()) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'markdown-abc-play';
                button.textContent = context.locale?.startsWith('pt') ? 'Reproduzir partitura' : 'Play score';
                let synth: InstanceType<typeof abcjs.synth.CreateSynth> | undefined;
                const play = async (): Promise<void> => {
                    button.disabled = true;
                    try {
                        synth?.stop();
                        synth = new abcjs.synth.CreateSynth();
                        await synth.init({ visualObj: tunes[0] });
                        await synth.prime();
                        if (!context.signal?.aborted) synth.start();
                    } finally {
                        button.disabled = false;
                    }
                };
                button.addEventListener('click', play);
                container.append(button);
                entry.stop = () => synth?.stop();
                entry.remove = () => button.removeEventListener('click', play);
            }
            rendered.set(container, entry);
        } catch (error) {
            renderExtensionError(container, 'ABC', 'abc', source, error, context);
        }
    };
    return {
        name: abcManifest.name,
        manifest: abcManifest,
        fences: [{ ...abcManifest.fences[0], render, dispose }],
        dispose() {
            for (const container of Array.from(rendered.keys())) dispose(container);
        },
    };
};
