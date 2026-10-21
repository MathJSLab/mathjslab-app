import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const hash = (filename) => createHash('sha256').update(readFileSync(filename)).digest('hex');
const metadata = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const packageLock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url)));
const dependency = metadata.dependencies['mathjslab-markdown'];
if (dependency === 'file:../mathjslab-markdown') {
    const linked = packageLock.packages['node_modules/mathjslab-markdown'];
    assert.equal(linked.link, true, 'Run npm install to activate the sibling development link');
    assert.equal(linked.resolved, '../mathjslab-markdown');
    assert.equal(
        realpathSync(new URL('../node_modules/mathjslab-markdown', import.meta.url)),
        realpathSync(new URL('../../mathjslab-markdown', import.meta.url)),
        'The installed development dependency must resolve to the sibling checkout',
    );
} else if (dependency.startsWith('file:vendor/')) {
    const snapshot = JSON.parse(readFileSync(new URL('../vendor/markdown-local.json', import.meta.url)));
    assert.equal(dependency, 'file:vendor/' + snapshot.archive, 'HDL requires an explicit local distribution or sibling development link');
    assert.equal(hash(new URL('../vendor/' + snapshot.archive, import.meta.url)), snapshot.sha256, 'local tarball changed; prepare/install explicitly');
    assert.equal(packageLock.packages['node_modules/mathjslab-markdown'].resolved, dependency);
    assert.equal(
        packageLock.packages['node_modules/mathjslab-markdown'].integrity,
        'sha512-' +
            createHash('sha512')
                .update(readFileSync(new URL('../vendor/' + snapshot.archive, import.meta.url)))
                .digest('base64'),
        'Run npm install after explicitly refreshing the local snapshot',
    );
} else {
    assert.match(dependency, /^[~^]?\d+\.\d+\.\d+$/, 'Use an explicit registry version/range or supported local distribution');
    const locked = packageLock.packages['node_modules/mathjslab-markdown'];
    const installedMetadata = JSON.parse(readFileSync(path.resolve(path.dirname(require.resolve('mathjslab-markdown')), '../../package.json')));
    assert.equal(locked.link, undefined, 'Registry dependency must not resolve to a development link');
    assert.equal(installedMetadata.version, locked.version, 'Run npm ci to install the locked Markdown distribution');
    assert.equal(packageLock.packages[''].dependencies['mathjslab-markdown'], dependency);
    assert.equal(locked.resolved, `https://registry.npmjs.org/mathjslab-markdown/-/mathjslab-markdown-${locked.version}.tgz`);
    assert.match(locked.integrity, /^sha512-[A-Za-z0-9+/]+=*$/);
    assert.equal(realpathSync(new URL('../node_modules/mathjslab-markdown', import.meta.url)), path.resolve(fileURLToPath(new URL('../node_modules/mathjslab-markdown', import.meta.url))));
}
const installed = path.dirname(require.resolve('mathjslab-markdown/hdl/assets/browser-worker.mjs'));
const lock = JSON.parse(readFileSync(path.join(installed, 'toolchain.lock.json')));
for (const [name, expected] of Object.entries(lock.files)) assert.equal(hash(path.join(installed, name)), expected.sha256, name);
if (process.argv[2]) {
    const destination = path.resolve(process.argv[2]);
    const inventory = (directory, relative = '') =>
        readdirSync(directory, { withFileTypes: true })
            .flatMap((entry) => {
                const name = path.join(relative, entry.name);
                return entry.isDirectory() ? inventory(path.join(directory, entry.name), name) : [name];
            })
            .sort();
    const files = inventory(installed);
    assert.deepEqual(inventory(destination), files, 'Deployed HDL inventory must match the complete distribution');
    for (const name of files) assert.ok(readFileSync(path.join(destination, name)).equals(readFileSync(path.join(installed, name))), name);
    console.log(`${files.length} deployed HDL files are byte-identical (including Worker, loaders, lock and notices).`);
} else console.log(`Installed dependency (${dependency}) and pinned HDL assets verified.`);
