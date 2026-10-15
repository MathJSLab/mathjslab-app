const fs = require('node:fs');
const path = require('node:path');
const { exampleLeaves } = require('../../src/example-manifest.cjs');

/** Validate every input before copying or removing any example asset. */
function prepareExamples(root, manifest) {
    const leaves = exampleLeaves(manifest);
    if (!leaves.length) throw new Error('Example manifest contains no files.');
    const files = new Set();
    const copies = [];
    for (const leaf of leaves) {
        if (typeof leaf.entry.caption === 'object') {
            const template = path.resolve(root, 'example', `${leaf.path}.njk`);
            if (!fs.statSync(template).isFile()) throw new Error(`Missing example template: ${template}`);
            for (const lang of Object.keys(leaf.entry.caption)) {
                if (!/^[a-z]{2}(?:-[A-Za-z0-9]+)*$/u.test(lang)) throw new Error(`Invalid example locale: ${lang}`);
                const target = path.resolve(root, 'dist', 'example', lang, leaf.path);
                if (!fs.statSync(target).isFile()) throw new Error(`Missing generated example: ${target}`);
                files.add(target);
            }
        } else {
            const source = path.resolve(root, 'example', leaf.path);
            if (!fs.statSync(source).isFile()) throw new Error(`Missing example: ${source}`);
            const target = path.resolve(root, 'dist', 'example', leaf.path);
            copies.push({ source, target });
            files.add(target);
        }
    }
    const first = leaves[0];
    const content =
        typeof first.entry.caption === 'object'
            ? Object.fromEntries(Object.keys(first.entry.caption).map((lang) => [lang, fs.readFileSync(path.resolve(root, 'dist', 'example', lang, first.path), 'utf8')]))
            : fs.readFileSync(path.resolve(root, 'example', first.path), 'utf8');
    return { files, copies, firstExample: { name: first.keys.join('/'), description: first.entry.description, content } };
}

function writeExamples(root, manifest) {
    const prepared = prepareExamples(root, manifest);
    const directory = path.resolve(root, 'dist', 'example');
    fs.mkdirSync(directory, { recursive: true });
    for (const { source, target } of prepared.copies) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(source, target);
    }
    const removeStale = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const target = path.resolve(dir, entry.name);
            if (entry.isDirectory()) removeStale(target);
            else if (path.extname(entry.name) === '.m' && !prepared.files.has(target)) fs.rmSync(target);
        }
    };
    removeStale(directory);
    fs.writeFileSync(path.join(directory, 'example.json'), JSON.stringify(manifest, null, 4) + '\n');
    fs.writeFileSync(path.resolve(root, 'src', 'first-example.json'), JSON.stringify(prepared.firstExample, null, 2));
}
module.exports = { prepareExamples, writeExamples };
