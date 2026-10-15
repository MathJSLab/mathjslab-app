import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = path.resolve(process.argv[2] ?? fileURLToPath(new URL('../', import.meta.url)));
const directory = path.join(root, 'doc');
const walk = (target) =>
    fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
        const filename = path.join(target, entry.name);
        return entry.isDirectory() ? walk(filename) : entry.name.endsWith('.md') ? [filename] : [];
    });
const files = walk(directory);
assert.ok(files.length, 'No documentation files.');
assert.ok(!fs.existsSync(path.join(directory, 'pt')), 'Portuguese documentation must be translated and removed.');
let links = 0;
for (const filename of files) {
    const source = fs.readFileSync(filename, 'utf8');
    assert.match(source, /^# /mu, `Missing document title: ${filename}`);
    assert.ok(!/\]\([^)]*(?:doc\/pt\/|markdown-api-publica|markdown-integracao|markdown-rendering\.md)/u.test(source), `Obsolete documentation link: ${filename}`);
    marked.walkTokens(marked.lexer(source), (token) => {
        if (token.type !== 'link' && token.type !== 'image') return;
        const href = token.href;
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/iu.test(href)) return;
        const relative = decodeURIComponent(href.split(/[?#]/u)[0]);
        if (!relative) return;
        const target = relative.startsWith('/') ? path.resolve(root, `.${relative}`) : path.resolve(path.dirname(filename), relative);
        assert.ok(fs.existsSync(target), `Broken link in ${path.relative(root, filename)}: ${href}`);
        links++;
    });
}
console.log(`${files.length} English documentation files; ${links} local links verified.`);
