const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { exampleLeaves } = require('../../src/example-manifest.cjs');
const { prepareExamples, writeExamples } = require('../../script/helper/example-assets.cjs');
const file = (name, localized = false) => ({ file: name, caption: localized ? { en: 'File', es: 'Archivo', pt: 'Arquivo' } : 'File', description: 'Description' });
const dir = (directory, children) => ({ directory, children, caption: 'Folder', description: 'Directory' });

test('flat, mixed, nested and repeated sibling keys retain depth-first manifest order', () => {
    const manifest = { first: dir('graphics', { sub: dir('functions', { same: file('plot.m', true) }), same: file('other.m') }), same: file('root.m'), empty: dir('empty', {}) };
    assert.deepEqual(
        exampleLeaves(manifest).map(({ keys, path }) => ({ keys, path })),
        [
            { keys: ['first', 'sub', 'same'], path: 'graphics/functions/plot.m' },
            { keys: ['first', 'same'], path: 'graphics/other.m' },
            { keys: ['same'], path: 'root.m' },
        ],
    );
    assert.equal(exampleLeaves({ one: file('one.m') })[0].path, 'one.m');
});

test('rejects ambiguous entries, escaping paths, invalid metadata and malformed children', () => {
    for (const entry of [{ ...file('a.m'), directory: 'a', children: {} }, { ...file('a.m'), children: {} }, dir('a', []), { ...file('a.m'), caption: [] }, {}]) {
        assert.throws(() => exampleLeaves({ bad: entry }));
    }
    for (const invalid of ['../a.m', '/a.m', 'a/../../b.m', 'a\\b.m', 'C:/a.m', 'a//b.m', 'a/./b.m', 'a.m?x', '']) {
        assert.throws(() => exampleLeaves({ bad: file(invalid) }));
        assert.throws(() => exampleLeaves({ bad: dir(invalid, { child: file('a.m') }) }));
    }
    assert.throws(() => exampleLeaves({ a: file('same.m'), b: file('same.m') }), /Duplicate/);
});

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mathjslab-examples-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.mkdirSync(path.join(root, 'src'));
    const write = (relative, content = 'source') => {
        const target = path.join(root, relative);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
    };
    return { root, write };
}

test('publishes all locales, copies nested legacy files, removes stale outputs and selects first nested leaf', (t) => {
    const { root, write } = fixture(t);
    const manifest = { graphics: dir('graphics', { functions: dir('functions', { plot: file('plot.m', true) }), legacy: file('legacy.m') }), root: file('root.m') };
    write('example/graphics/functions/plot.m.njk', 'template');
    for (const lang of ['en', 'es', 'pt']) write(`dist/example/${lang}/graphics/functions/plot.m`, lang);
    write('example/graphics/legacy.m', 'legacy');
    write('example/root.m', 'root');
    write('dist/example/en/old.m', 'stale');
    write('dist/example/pt/deep/old.m', 'stale');
    write('dist/example/keep.txt', 'keep');
    const prepared = prepareExamples(root, manifest);
    assert.equal(prepared.files.size, 5);
    writeExamples(root, manifest);
    assert.equal(fs.existsSync(path.join(root, 'dist/example/en/old.m')), false);
    assert.equal(fs.existsSync(path.join(root, 'dist/example/pt/deep/old.m')), false);
    assert.equal(fs.readFileSync(path.join(root, 'dist/example/graphics/legacy.m'), 'utf8'), 'legacy');
    assert.equal(fs.readFileSync(path.join(root, 'dist/example/keep.txt'), 'utf8'), 'keep');
    for (const lang of ['en', 'es', 'pt']) assert.equal(fs.readFileSync(path.join(root, `dist/example/${lang}/graphics/functions/plot.m`), 'utf8'), lang);
    const first = JSON.parse(fs.readFileSync(path.join(root, 'src/first-example.json'), 'utf8'));
    assert.equal(first.name, 'graphics/functions/plot');
    assert.deepEqual(first.content, { en: 'en', es: 'es', pt: 'pt' });
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'dist/example/example.json'), 'utf8')), manifest);
});

test('missing sources, localized outputs and empty manifests fail before any cleanup or fallback replacement', (t) => {
    const { root, write } = fixture(t);
    write('dist/example/stale.m', 'retain');
    write('src/first-example.json', 'retain');
    for (const manifest of [{}, { empty: dir('empty', {}) }, { missing: file('missing.m') }, { missing: file('missing.m', true) }, { bad: file('../escape.m') }]) {
        assert.throws(() => writeExamples(root, manifest));
        assert.equal(fs.readFileSync(path.join(root, 'dist/example/stale.m'), 'utf8'), 'retain');
        assert.equal(fs.readFileSync(path.join(root, 'src/first-example.json'), 'utf8'), 'retain');
    }
    write('example/localized.m.njk', 'template');
    write('dist/example/en/localized.m', 'en');
    assert.throws(() => writeExamples(root, { localized: file('localized.m', true) }), /localized\.m/);
    assert.equal(fs.readFileSync(path.join(root, 'dist/example/stale.m'), 'utf8'), 'retain');
    assert.equal(fs.readFileSync(path.join(root, 'src/first-example.json'), 'utf8'), 'retain');
});
