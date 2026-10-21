import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

// Run after building the sibling package. Packaging never publishes or builds it.
const root = path.resolve(import.meta.dirname, '..');
const sibling = path.resolve(root, '../mathjslab-markdown');
mkdirSync(path.join(root, 'vendor'), { recursive: true });
const npmCLI = process.env.npm_execpath;
if (!npmCLI) throw new Error('Run through npm run prepare:markdown:local');
execFileSync(process.execPath, [npmCLI, 'pack', sibling, '--ignore-scripts', '--pack-destination', path.join(root, 'vendor'), '--cache', path.join(root, '.npm')], {
    cwd: root,
    stdio: 'inherit',
});
const siblingMetadata = JSON.parse(readFileSync(path.join(sibling, 'package.json')));
const archive = `mathjslab-markdown-${siblingMetadata.version}.tgz`;
const sha256 = createHash('sha256')
    .update(readFileSync(path.join(root, 'vendor', archive)))
    .digest('hex');
writeFileSync(
    path.join(root, 'vendor/markdown-local.json'),
    JSON.stringify(
        {
            archive,
            sha256,
            source: '../mathjslab-markdown',
            version: siblingMetadata.version,
            localDevelopmentSnapshot: true,
        },
        null,
        2,
    ) + '\n',
);
console.log('Local snapshot prepared. Run npm install --ignore-scripts to update package-lock.json.');
