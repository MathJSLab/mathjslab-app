/**
 * component.include.ts: Component inclusion engine.
 * Uses: component.include.json
 * This script loads templates used in project, at `template` and `templateString`, and generates `components.ts` file (to be imported by project).
 * This script is used at build time (in `webpack.config.ts`).
 */

import fs from 'node:fs';
import path from 'node:path';
import components from './component.include.json';

/* eslint-disable-next-line  no-console */
console.log('Loading Web components ...');
const templates = '\n' + components.include.map((component) => fs.readFileSync(path.join(__dirname, component, component + '.template.html'), 'utf-8')).join('\n') + '\n';
// Compare normalized line endings so formatting on Windows does not trigger a rewrite.
// Stable content keeps validation builds read-only and avoids unnecessary watcher updates.
const componentFile = path.join(__dirname, 'components.ts');
const componentSource =
    '/* Web components. Generated from component.include.json. */\n' + `${components.include.map((component) => `export * from './${component}/${component}.component';`).join('\n')}\n`;
if (!fs.existsSync(componentFile) || fs.readFileSync(componentFile, 'utf-8').replaceAll('\r\n', '\n') !== componentSource) fs.writeFileSync(componentFile, componentSource);
export { components, templates };
export default { components, templates };
/* eslint-disable-next-line  no-console */
console.log('Loading Web components done.');
