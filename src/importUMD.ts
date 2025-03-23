/**
 * importUMD
 *
 * source: https://copyprogramming.com/howto/import-umd-javascript-modules-into-browser
 */
export default async (url: string, module = { exports: {} }) => (Function('module', 'exports', await (await fetch(url)).text()).call(module, module, module.exports), module).exports;
