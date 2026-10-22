/** Keep runtime JSON manifests out of Eleventy's local data cascade.
 * Global JSON in data/ remains enabled; local data must opt in via .11tydata.
 */
export function configureEleventyData(eleventyConfig) {
    eleventyConfig.setDataFileSuffixes(['.11tydata']);
}
