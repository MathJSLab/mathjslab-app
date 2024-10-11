/**
 * save-bundle.js: This script saves the bundle in the project root directory.
 */
const fs = require('node:fs');
const path = require('node:path');

console.log(`Running ${__filename} ...`);
console.warn('Copying resulting bundle to project root directory...');
fs.copyFileSync(path.resolve(__dirname, '..', 'dist', 'mathjslab-app.js'), path.resolve(__dirname, '..', 'mathjslab-app.min.js'));
console.warn('Copying resulting bundle to project root directory done.');
console.log(`Running ${__filename} done.`);
