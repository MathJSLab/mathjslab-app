import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exampleLeaves } from '../src/example-manifest.cjs';

// The canonical examples are repository resources, not npm package payload.
// Pass their checkout explicitly so this audit never needs network access.
const canonical = process.argv[2];
assert.ok(canonical, 'Usage: node script/check-markdown-examples.mjs <mathjslab-markdown checkout>');
const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'example/example.json'), 'utf8'));
const leaves = exampleLeaves(manifest).filter((leaf) => leaf.path.startsWith('markdown/'));
const documents = new Map();
const shared = [];
for (const leaf of leaves) {
    const template = fs.readFileSync(path.join(root, 'example', leaf.path + '.njk'), 'utf8');
    const frontmatter = template.match(/^---json\s*\r?\n([\s\S]*?)\r?\n---/u);
    assert.ok(frontmatter, 'Missing frontmatter: ' + leaf.path);
    const data = JSON.parse(frontmatter[1]);
    assert.match(data.markdownDocument, /^(?:[a-z0-9-]+|README)\.md$/u);
    if (data.markdownDirectory !== undefined) {
        assert.equal(data.markdownDirectory, 'digital-electronics/pt');
        assert.equal(data.markdownDocument, 'README.md');
        assert.ok(fs.existsSync(path.join(canonical, 'example', data.markdownDirectory, data.markdownDocument)));
        for (const locale of ['en', 'es', 'pt']) {
            assert.equal(data.comments.title[locale], leaf.entry.caption[locale]);
            assert.equal(data.comments.goal[locale], leaf.entry.description[locale]);
        }
        shared.push(leaf.path);
        continue;
    }
    assert.ok(!documents.has(data.markdownDocument), 'Duplicate launcher: ' + data.markdownDocument);
    documents.set(data.markdownDocument, { leaf, data });
}
for (const locale of ['en', 'es', 'pt']) {
    const directory = path.resolve(canonical, 'example', locale);
    const files = fs
        .readdirSync(directory)
        .filter((name) => name.endsWith('.md'))
        .sort();
    assert.deepEqual([...documents.keys()].sort(), files, 'Missing or obsolete launchers: ' + locale);
    const index = fs.readFileSync(path.join(directory, 'README.md'), 'utf8');
    for (const [filename, { leaf, data }] of documents) {
        assert.equal(data.comments.title[locale], leaf.entry.caption[locale], 'Title mismatch: ' + locale + '/' + filename);
        assert.equal(data.comments.goal[locale], leaf.entry.description[locale], 'Description mismatch: ' + locale + '/' + filename);
        if (filename === 'README.md') continue;
        const line = index.split(/\r?\n/u).find((text) => text.includes('](' + filename + ')'));
        const title = line?.match(/\[([^\]]+)\]\(/u)?.[1];
        assert.equal(leaf.entry.caption[locale], title, 'Canonical index title mismatch: ' + locale + '/' + filename);
    }
    console.log(locale + ': ' + files.length + ' canonical documents covered exactly once, with matching translated metadata.');
}

assert.deepEqual(shared, ['markdown/electronics/digital-electronics.m']);
console.log('Shared Portuguese Digital Electronics contents available in all three menu locales.');
