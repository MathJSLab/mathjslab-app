import { MarkdownEngine, type MarkdownEngineOptions, type MarkdownExtension } from '../MarkdownEngine';
import { abcExtension } from './extensions/abc/extension';
import { graphvizExtension } from './extensions/graphviz/extension';
import { mapsExtension } from './extensions/maps/extension';
import { mermaidExtension } from './extensions/mermaid/extension';
import { model3DExtension } from './extensions/model-3d/extension';
import { molecule3DExtension } from './extensions/molecule-3d/extension';
import { smilesExtension } from './extensions/smiles/extension';
import { vegaLiteExtension } from './extensions/vega-lite/extension';
import { verovioExtension } from './extensions/verovio/extension';

export type EducationalMarkdownFeature = 'abc' | 'graphviz' | 'maps' | 'mermaid' | 'model-3d' | 'molecule-3d' | 'smiles' | 'vega-lite' | 'verovio';

export const educationalMarkdownFeatures = Object.freeze([
    'abc',
    'graphviz',
    'maps',
    'mermaid',
    'model-3d',
    'molecule-3d',
    'smiles',
    'vega-lite',
    'verovio',
] as const satisfies readonly EducationalMarkdownFeature[]);

const factories: Readonly<Record<EducationalMarkdownFeature, () => MarkdownExtension>> = {
    abc: abcExtension,
    graphviz: graphvizExtension,
    maps: mapsExtension,
    mermaid: mermaidExtension,
    'model-3d': model3DExtension,
    'molecule-3d': molecule3DExtension,
    smiles: smilesExtension,
    'vega-lite': vegaLiteExtension,
    verovio: verovioExtension,
};

export type EducationalMarkdownEngineOptions = Omit<MarkdownEngineOptions, 'extensions'> & {
    /** Educational renderers to register. Their libraries remain dynamically loaded. */
    readonly features?: readonly EducationalMarkdownFeature[] | 'all';
    /** Integrator-owned extensions, such as an injected MathJSLab executor. */
    readonly extensions?: readonly MarkdownExtension[];
};

/** Create the reusable engine without importing MathJSLab application state. */
export const createEducationalMarkdownEngine = (options: EducationalMarkdownEngineOptions = {}): MarkdownEngine => {
    const { features = [], extensions = [], ...engineOptions } = options;
    const selected = features === 'all' ? educationalMarkdownFeatures : features;
    const unique = Array.from(new Set(selected));
    return new MarkdownEngine({
        ...engineOptions,
        extensions: [...unique.map((feature) => factories[feature]()), ...extensions],
    });
};
