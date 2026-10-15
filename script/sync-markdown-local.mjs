import { cpSync, readFileSync, existsSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only copy the canonical compiled modules. Compatibility facades in src
// continue to delegate to the package and never carry a second implementation.
const root = fileURLToPath(new URL('../', import.meta.url));
const canonical = resolve(root, '../mathjslab-markdown');
const installed = resolve(root, 'node_modules/mathjslab-markdown');
const sourcePackage = JSON.parse(readFileSync(resolve(canonical, 'package.json'), 'utf8'));
const targetPackage = JSON.parse(readFileSync(resolve(installed, 'package.json'), 'utf8'));
if (sourcePackage.name !== 'mathjslab-markdown' || sourcePackage.version !== targetPackage.version) throw new Error('Canonical and installed Markdown package versions must match');
if (realpathSync(canonical) === realpathSync(installed)) {
    console.log('Canonical mathjslab-markdown is already linked locally; no copy needed');
} else {
    for (const directory of ['source', 'types']) {
        const source = resolve(canonical, 'dist', directory);
        if (!existsSync(source)) throw new Error('Run npm run build:types in mathjslab-markdown first');
        cpSync(source, resolve(installed, 'dist', directory), { recursive: true });
    }
    console.log(`Synchronized canonical mathjslab-markdown ${sourcePackage.version} into the app`);
}
