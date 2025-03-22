// import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// import { globSync } from 'glob';

import EleventyUtil from './script/helper/EleventyUtil.mjs';

/**
 * This filename.
 */
const scriptName = path.basename(fileURLToPath(import.meta.url));

/**
 * The `data/builddata.json` data parsed.
 */
const builddata = JSON.parseFileSync(path.resolve('.', 'data', 'builddata.json'));

/**
 * Get Eleventy configuration option.
 * @param {*} s Build step.
 * @returns Eleventy configuration for build step `s`.
 */
const getStepOption = (s) => ({
    ...builddata.build.eleventy.steps[s].options,
    ...builddata.build.eleventy.commonOptions,
});

/**
 * Build step options and configuration.
 */
const stepData = [
    {
        options: getStepOption(0),
        config: async function (eleventyConfig) {
            const filters = {
                ...EleventyUtil.utilFilters,
            };
            const shortcodes = {
                ...EleventyUtil.utilShortcodes,
            };
            EleventyUtil.configAddTemplateFormat(eleventyConfig, ['njk'], '\\./');
            EleventyUtil.configAddEntries(eleventyConfig, filters, 'addFilter');
            EleventyUtil.configAddEntries(eleventyConfig, shortcodes, 'addShortcode');
            EleventyUtil.configAddRenderTemplateTools(eleventyConfig, true);
            // EleventyUtil.configAddFileContentAsGlobalData(eleventyConfig, path.resolve('./data/files'));
            return stepData[0].options;
            // return getStepOption(0);
        },
    },
];

/**
 * Run Eleventy static build.
 */
EleventyUtil.console.log(`Building ${builddata.dataset} project repository (build script: ${scriptName}) ...`);
EleventyUtil.console.log(`Running step01 ...`);
EleventyUtil.run(stepData[0].config, stepData[0].options, () => {
    EleventyUtil.console.log(`Running step01 done.`);
    EleventyUtil.console.log(`Building ${builddata.dataset} project repository (build script: ${scriptName}) done.`);
});
// .then()
// .catch();
