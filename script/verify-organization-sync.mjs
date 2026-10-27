import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
assert.ok(process.argv[2], 'Usage: node script/verify-organization-sync.mjs <organization checkout>');
const organization = path.resolve(process.argv[2]);
const manifestPath = 'resource/mathjslab-app/copy.repo.config.json';
const published = fs.readFileSync(path.join(organization, manifestPath));
assert.ok(published.equals(fs.readFileSync(path.join(organization, 'input', manifestPath))), 'Rebuild the organization manifest from its input source');
assert.ok(published.equals(fs.readFileSync(path.join(root, 'copy.repo.config.json'))), 'Local and organization app manifests must match');
const configuration = JSON.parse(published);
const ownedFiles = [
    'eleventy.build.mjs',
    'eslint.config.cjs',
    'src/PlotEngine.ts',
    'src/Markdown.ts',
    'src/mathjslab.worker.ts',
    'src/MarkdownHDLConfiguration.ts',
    'src/MarkdownMapConfiguration.ts',
];
const obsoleteFiles = ['src/outputFunction.ts', 'src/styles/constants.json.njk', 'src/styles/constants.json'];
const destination = (entry) => (typeof entry === 'string' ? entry : (entry.dest ?? entry.src));
for (const entry of configuration.files) assert.ok(![...ownedFiles, ...obsoleteFiles].includes(destination(entry)), `Unsafe synchronized file: ${destination(entry)}`);

// Reproduce a freshly fetched organization manifest and the actual clean/copy
// helper in an isolated checkout. No files in the real app are overwritten.
const reports = path.join(root, 'report');
fs.mkdirSync(reports, { recursive: true });
const fixture = fs.mkdtempSync(path.join(reports, 'organization-sync-'));
const app = path.join(fixture, 'app');
const repositories = path.join(fixture, 'repo');
const shared = path.join(repositories, configuration.repository);
const inside = (base, name) => {
    const filename = path.resolve(base, name);
    assert.ok(filename.startsWith(path.resolve(base) + path.sep), `Path outside fixture: ${name}`);
    return filename;
};
const copy = (source, target) => {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
};
for (const entry of configuration.files) {
    const source = typeof entry === 'string' ? entry : entry.src;
    copy(inside(organization, source), inside(shared, source));
    const local = inside(root, destination(entry));
    copy(fs.existsSync(local) ? local : inside(organization, source), inside(app, destination(entry)));
}
copy(path.join(organization, manifestPath), inside(shared, manifestPath));
const expected = new Map(ownedFiles.map((file) => [file, fs.readFileSync(inside(root, file))]));
for (const [file] of expected) copy(inside(root, file), inside(app, file));
const require = createRequire(import.meta.url);
const helper = path.join(root, 'script/helper/copy-repo-files.ts');
for (const mode of ['clean', 'copy']) {
    copy(inside(shared, manifestPath), path.join(app, 'copy.repo.config.json'));
    const output = execFileSync(process.execPath, [require.resolve('tsx/cli'), helper, mode, '--base-dir', repositories], { cwd: app, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    fs.writeFileSync(path.join(fixture, `${mode}.log`), output);
    assert.ok(published.equals(fs.readFileSync(path.join(app, 'copy.repo.config.json'))), 'Manifest refresh changed the selected resources');
    for (const [file, bytes] of expected) assert.ok(bytes.equals(fs.readFileSync(inside(app, file))), `${mode} overwrote or removed ${file}`);
    for (const file of obsoleteFiles) assert.ok(!fs.existsSync(inside(app, file)), `${mode} restored ${file}`);
}
for (const entry of configuration.files) {
    const source = typeof entry === 'string' ? entry : entry.src;
    assert.ok(fs.readFileSync(inside(shared, source)).equals(fs.readFileSync(inside(app, destination(entry)))), `Incomplete copy: ${destination(entry)}`);
}
console.log('Organization input, published manifest and local manifest are byte-identical.');
console.log(`Real clean/copy replay preserved ${ownedFiles.length} app-owned files and copied ${configuration.files.length} shared resources without restoring obsolete files.`);
console.log(`Evidence: ${fixture}`);
