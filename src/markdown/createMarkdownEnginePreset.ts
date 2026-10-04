import { MarkdownEngine, type MarkdownEngineOptions } from '../MarkdownEngine';
import { educationalMarkdownFeatures, type EducationalMarkdownFeature } from './extensionCatalog';
import { createEducationalMarkdownEngine } from './createEducationalMarkdownEngine';

export type MarkdownEnginePreset = 'core' | 'gfm' | 'education-basic' | 'education-full' | 'trusted-local' | 'safe-remote';

export type MarkdownEnginePresetDefinition = {
    /** Markdown syntax only; authorization is controlled by the independent policy fields. */
    readonly profile: NonNullable<MarkdownEngineOptions['profile']>;
    readonly securityMode: NonNullable<MarkdownEngineOptions['securityMode']>;
    readonly features: readonly EducationalMarkdownFeature[];
    readonly resourcePolicy?: MarkdownEngineOptions['resourcePolicy'];
};

export type MarkdownEnginePresetOptions = Omit<MarkdownEngineOptions, 'extensions'> & {
    readonly extensions?: MarkdownEngineOptions['extensions'];
    /** Override the preset's optional renderer selection without changing its security defaults. */
    readonly features?: readonly EducationalMarkdownFeature[] | 'all';
};

const noFeatures = Object.freeze([] as EducationalMarkdownFeature[]);
const basicFeatures = Object.freeze(['smiles'] as const satisfies readonly EducationalMarkdownFeature[]);

/** Explicit syntax and security defaults; these dimensions remain independently overridable. */
export const markdownEnginePresets: Readonly<Record<MarkdownEnginePreset, MarkdownEnginePresetDefinition>> = Object.freeze({
    core: Object.freeze({ profile: 'core', securityMode: 'strict', features: noFeatures }),
    gfm: Object.freeze({ profile: 'gfm', securityMode: 'sanitized', features: noFeatures }),
    'education-basic': Object.freeze({ profile: 'gfm', securityMode: 'sanitized', features: basicFeatures }),
    'education-full': Object.freeze({ profile: 'gfm', securityMode: 'sanitized', features: educationalMarkdownFeatures }),
    'trusted-local': Object.freeze({ profile: 'gfm', securityMode: 'trusted', features: educationalMarkdownFeatures }),
    'safe-remote': Object.freeze({
        profile: 'gfm',
        securityMode: 'sanitized',
        features: noFeatures,
        // Sanitized resource validation further limits network URLs to the document origin.
        resourcePolicy: Object.freeze({ allowNetwork: true, allowDataUrls: false }),
    }),
});

/** Create a reusable engine from a named, inspectable preset. */
export const createMarkdownEnginePreset = (preset: MarkdownEnginePreset, options: MarkdownEnginePresetOptions = {}): MarkdownEngine => {
    const definition = markdownEnginePresets[preset];
    const { features = definition.features, extensions = [], resourcePolicy, ...engineOptions } = options;
    return createEducationalMarkdownEngine({
        ...definition,
        ...engineOptions,
        resourcePolicy: { ...definition.resourcePolicy, ...resourcePolicy },
        features,
        extensions,
    });
};
