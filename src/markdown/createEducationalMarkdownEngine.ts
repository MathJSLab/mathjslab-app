import { MarkdownEngine, type MarkdownEngineOptions, type MarkdownExtension } from '../MarkdownEngine';
import { createEducationalMarkdownExtension, educationalMarkdownFeatures, type EducationalMarkdownFeature } from './extensionCatalog';

export { educationalMarkdownFeatures } from './extensionCatalog';
export type { EducationalMarkdownFeature } from './extensionCatalog';

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
        extensions: [...unique.map((feature) => createEducationalMarkdownExtension(feature)), ...extensions],
    });
};
