import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine';
import { assertSourceSize, observeElementResize, renderExtensionError } from '../../extensionUtils';
import { molecule3DManifest } from './manifest';
import type { GLViewer } from '3dmol';

type Entry = { viewer: GLViewer; disconnect: () => void };

export const molecule3DExtension = (): MarkdownExtension => {
    const viewers = new Map<Element, Entry>();
    const dispose = (container: Element): void => {
        const entry = viewers.get(container);
        entry?.disconnect();
        entry?.viewer.spin(false);
        entry?.viewer.removeAllModels();
        entry?.viewer.clear();
        viewers.delete(container);
        container.replaceChildren();
    };
    const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
        const language = container.getAttribute('data-markdown-language') ?? 'pdb';
        let viewer: GLViewer | undefined;
        let disconnect = (): void => undefined;
        try {
            assertSourceSize(source, context);
            const mol = await import(/* webpackChunkName: "markdown-molecule-3d" */ '3dmol');
            if (context.signal?.aborted) return;
            dispose(container);
            const viewport = document.createElement('div');
            viewport.style.width = '100%';
            viewport.style.height = '100%';
            viewport.setAttribute('role', 'application');
            viewport.setAttribute('aria-label', `Interactive ${language.toUpperCase()} molecular structure`);
            container.append(viewport);
            viewer = mol.createViewer(viewport, { backgroundColor: context.theme === 'dark' ? '#111827' : '#ffffff' });
            const entry = { viewer, disconnect };
            viewers.set(container, entry);
            viewer.addModel(source, language === 'mmcif' ? 'cif' : language);
            if (language === 'pdb' || language === 'cif' || language === 'mmcif') {
                viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
                viewer.setStyle({ hetflag: true }, { stick: { colorscheme: 'Jmol' } });
            } else {
                viewer.setStyle({}, { stick: { colorscheme: 'Jmol' }, sphere: { scale: 0.28, colorscheme: 'Jmol' } });
            }
            viewer.zoomTo();
            viewer.render();
            disconnect = observeElementResize(container, context, () => {
                if (!context.signal?.aborted) viewer?.resize();
            });
            entry.disconnect = disconnect;
            if (context.signal?.aborted) {
                dispose(container);
                return;
            }
            viewer = undefined;
            disconnect = (): void => undefined;
        } catch (error) {
            disconnect();
            if (viewer) {
                viewers.delete(container);
                try {
                    viewer.spin(false);
                } catch {
                    /* Continue releasing a partially initialized viewer. */
                }
                try {
                    viewer.removeAllModels();
                } catch {
                    /* Continue releasing a partially initialized viewer. */
                }
                try {
                    viewer.clear();
                } catch {
                    /* Continue releasing a partially initialized viewer. */
                }
            }
            container.replaceChildren();
            if (!context.signal?.aborted) renderExtensionError(container, '3Dmol', language, source, error, context);
        }
    };
    return {
        name: molecule3DManifest.name,
        manifest: molecule3DManifest,
        fences: molecule3DManifest.fences.map((fence) => ({ ...fence, render, dispose })),
        dispose() {
            for (const container of Array.from(viewers.keys())) dispose(container);
        },
    };
};
