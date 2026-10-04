import type { MarkdownExtension, MarkdownExtensionManifest } from '../MarkdownEngine';
import { abcExtension } from './extensions/abc/extension';
import { abcManifest } from './extensions/abc/manifest';
import { graphvizExtension } from './extensions/graphviz/extension';
import { graphvizManifest } from './extensions/graphviz/manifest';
import { headingIdsExtension } from './extensions/heading-ids/extension';
import { headingIdsManifest } from './extensions/heading-ids/manifest';
import { mapsExtension } from './extensions/maps/extension';
import { mapsManifest } from './extensions/maps/manifest';
import { mathJaxExtension } from './extensions/mathjax/extension';
import { mathJaxManifest } from './extensions/mathjax/manifest';
import { mathJSLabManifest } from './extensions/mathjslab/manifest';
import { mermaidExtension } from './extensions/mermaid/extension';
import { mermaidManifest } from './extensions/mermaid/manifest';
import { model3DExtension } from './extensions/model-3d/extension';
import { model3DManifest } from './extensions/model-3d/manifest';
import { molecule3DExtension } from './extensions/molecule-3d/extension';
import { molecule3DManifest } from './extensions/molecule-3d/manifest';
import { relativeUrlsExtension } from './extensions/relative-urls/extension';
import { relativeUrlsManifest } from './extensions/relative-urls/manifest';
import { smilesExtension } from './extensions/smiles/extension';
import { smilesManifest } from './extensions/smiles/manifest';
import { syntaxHighlightExtension } from './extensions/syntax-highlight/extension';
import { syntaxHighlightManifest } from './extensions/syntax-highlight/manifest';
import { vegaLiteExtension } from './extensions/vega-lite/extension';
import { vegaLiteManifest } from './extensions/vega-lite/manifest';
import { verovioExtension } from './extensions/verovio/extension';
import { verovioManifest } from './extensions/verovio/manifest';

export type EducationalMarkdownFeature = 'abc' | 'graphviz' | 'maps' | 'mermaid' | 'model-3d' | 'molecule-3d' | 'smiles' | 'vega-lite' | 'verovio';

export type MarkdownExtensionCatalogEntry = {
    readonly manifest: MarkdownExtensionManifest;
    /** Available when the extension can be created without an injected runtime. */
    readonly create?: () => MarkdownExtension;
    readonly educational?: boolean;
};

/**
 * Single load-free inventory of the built-in extension manifests and factories.
 * Optional renderer libraries remain dynamically imported by their factories.
 */
export const markdownExtensionCatalog: Readonly<Record<string, MarkdownExtensionCatalogEntry>> = Object.freeze({
    abc: { manifest: abcManifest, create: abcExtension, educational: true },
    graphviz: { manifest: graphvizManifest, create: graphvizExtension, educational: true },
    'heading-ids': { manifest: headingIdsManifest, create: headingIdsExtension },
    maps: { manifest: mapsManifest, create: mapsExtension, educational: true },
    mathjax: { manifest: mathJaxManifest, create: mathJaxExtension },
    // MathJSLab requires an integrator-provided executor and is created from its adapter.
    mathjslab: { manifest: mathJSLabManifest },
    mermaid: { manifest: mermaidManifest, create: mermaidExtension, educational: true },
    'model-3d': { manifest: model3DManifest, create: model3DExtension, educational: true },
    'molecule-3d': { manifest: molecule3DManifest, create: molecule3DExtension, educational: true },
    'relative-urls': { manifest: relativeUrlsManifest, create: relativeUrlsExtension },
    smiles: { manifest: smilesManifest, create: smilesExtension, educational: true },
    'syntax-highlight': { manifest: syntaxHighlightManifest, create: syntaxHighlightExtension },
    'vega-lite': { manifest: vegaLiteManifest, create: vegaLiteExtension, educational: true },
    verovio: { manifest: verovioManifest, create: verovioExtension, educational: true },
} satisfies Record<string, MarkdownExtensionCatalogEntry>);

export const educationalMarkdownFeatures = Object.freeze(
    Object.entries(markdownExtensionCatalog)
        .filter(([, entry]) => entry.educational)
        .map(([name]) => name as EducationalMarkdownFeature),
);

export const createEducationalMarkdownExtension = (feature: EducationalMarkdownFeature): MarkdownExtension => {
    const entry = markdownExtensionCatalog[feature];
    if (!entry) throw new Error(`Unknown educational Markdown feature: ${feature}`);
    if (!entry.create) throw new Error(`Markdown extension cannot be created without an adapter: ${feature}`);
    return entry.create();
};
