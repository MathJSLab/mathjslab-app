import path from 'node:path';

/**
 * Shared Eleventy data for localized MathJSLab examples.
 */
export default {
    languages: ['en', 'es', 'pt'],

    pagination: {
        data: 'languages',
        size: 1,
        alias: 'lang',
    },

    eleventyExcludeFromCollections: true,

    permalink(data) {
        const exampleDirectory = path.resolve('example');

        const inputPath = path.resolve(data.page.inputPath);

        const relativeInputPath = path.relative(exampleDirectory, inputPath);

        const outputRelativePath = relativeInputPath
            .replace(/\.njk$/u, '')
            .split(path.sep)
            .join('/');

        return `dist/example/${data.lang}/` + outputRelativePath;
    },
};
