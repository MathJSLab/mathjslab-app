import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'dist', 'markdown-document');
if (!fs.existsSync(path.join(output, 'markdown-document.js'))) {
    throw new Error('Build the standalone Markdown component before measuring its chunks.');
}

const walk = (directory) =>
    fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const absolute = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(absolute) : [absolute];
    });

const assets = walk(output)
    .filter((file) => /\.(?:js|wasm)$/i.test(file))
    .map((file) => {
        const content = fs.readFileSync(file);
        return {
            name: path.relative(output, file).replaceAll('\\', '/'),
            bytes: content.byteLength,
            gzipBytes: gzipSync(content, { level: 9 }).byteLength,
        };
    })
    .sort((left, right) => left.name.localeCompare(right.name));

const featureNames = ['abc', 'graphviz', 'maps', 'mathjax', 'mermaid', 'model-3d', 'molecule-3d', 'smiles', 'vega-lite', 'verovio'];
const summarize = (files) => ({
    bytes: files.reduce((total, file) => total + file.bytes, 0),
    gzipBytes: files.reduce((total, file) => total + file.gzipBytes, 0),
    files,
});

const initial = summarize(assets.filter((asset) => asset.name === 'markdown-document.js'));
const resources = Object.fromEntries(
    featureNames.map((feature) => {
        const marker = `markdown-${feature}`;
        return [feature, summarize(assets.filter((asset) => asset.name.includes(marker)))];
    }),
);
const assigned = new Set([...(initial.files ?? []), ...Object.values(resources).flatMap((resource) => resource.files)]);
const shared = summarize(assets.filter((asset) => !assigned.has(asset)));
const report = {
    generatedAt: new Date().toISOString(),
    mode: 'production-minified',
    output: path.relative(root, output).replaceAll('\\', '/'),
    initial,
    resources,
    shared,
};
const destination = path.join(root, 'test', 'markdown', 'chunk-baseline.json');
fs.writeFileSync(destination, `${JSON.stringify(report, null, 4)}\n`);

const rows = { initial, ...resources, shared };
console.table(
    Object.fromEntries(
        Object.entries(rows).map(([name, value]) => [
            name,
            {
                files: value.files.length,
                KiB: Math.round(value.bytes / 1024),
                'gzip KiB': Math.round(value.gzipBytes / 1024),
            },
        ]),
    ),
);
console.log(`Wrote ${path.relative(root, destination)}`);
