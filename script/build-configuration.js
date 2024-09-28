/**
 * build-configuration.js: This script creates the
 * 'src/build-configuration.json' file with relevant build information about
 * the version.
 */
const fs = require('node:fs');
const path = require('node:path');

console.log(`Running ${__filename} ...`);
console.warn('Setting build configuration...');
const package = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json')).toString());
const debug = Boolean(process.env.DEBUG ?? false);
const buildConfiguration = {
    buildMessage: `MathJSLab Calculator v${package.version} built at ${new Date().toUTCString()}.${debug ? ` Debug flag enable.` : ``} Homepage: ${package.homepage}, License: ${package.license}`,
    debug,
}
fs.writeFileSync(path.resolve(__dirname, '..', 'src', 'build-configuration.json'), JSON.stringify(buildConfiguration, null, 2));
console.warn('Setting build configuration done.');
console.log(`Running ${__filename} done.`);
