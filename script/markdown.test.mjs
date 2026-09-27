import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import { Marked } from 'marked';
import { HTMLElement, TextNode, parse } from 'node-html-parser';

const nodeRequire = createRequire(import.meta.url);

// Exercise the real Markdown service and Marked parser. Only the browser DOM
// and Mermaid's SVG layout are substituted; visual layout needs a browser.
HTMLElement.prototype.replaceChildren = function (...nodes) {
    this.set_content(nodes);
};
const element = (html = '') => parse(`<div>${html}</div>`, { blockTextElements: { script: true, noscript: true, style: true } }).firstChild;

function service() {
    const calls = [];
    const bindings = [];
    const math = [];
    const evaluations = [];
    const mathTypesets = [];
    const mathClears = [];
    const smiles = [];
    const libraryLoads = [];
    const mermaid = {
        initialize() {},
        async render(id, source) {
            calls.push({ id, source });
            await Promise.resolve();
            if (source === 'invalid') throw new Error('Invalid diagram');
            return { svg: `<svg id="${id}"></svg>`, bindFunctions: (node) => bindings.push(node) };
        },
    };
    const document = element();
    document.createElement = (tag) => parse(`<${tag}></${tag}>`).firstChild;
    document.createTextNode = (text) => new TextNode(text);
    document.createElementNS = (_namespace, tag) => {
        const node = parse(`<${tag}></${tag}>`).firstChild;
        Object.defineProperty(node, 'style', { value: {} });
        return node;
    };
    class SvgDrawer {
        draw(tree, svg, theme) {
            smiles.push({ tree, theme });
            svg.innerHTML = '<g class="molecule"></g>';
        }
    }
    class SmilesDrawer {}
    SmilesDrawer.SvgDrawer = SvgDrawer;
    SmilesDrawer.parse = (source, success, error) => {
        source === 'invalid-smiles' ? error(new Error('Invalid SMILES')) : success({ source });
    };
    const MathJax = {
        startup: { promise: Promise.resolve() },
        async typesetPromise(elements) {
            mathTypesets.push(Array.from(elements, (entry) => entry.textContent));
            for (const entry of elements) entry.innerHTML = `<svg class="mathjax-svg"><text>${entry.textContent}</text></svg>`;
        },
        typesetClear(elements) {
            mathClears.push(Array.from(elements ?? []));
        },
    };
    const imports = {
        './markdown/extensions/mathjslab/applicationExecutor': {
            async createApplicationMathJSLabSession() {
                return {
                    parse(source) {
                        if (source === 'parse-error') return { statements: [], lines: [source], error: new Error('Invalid commands') };
                        return { statements: source.split(/\r?\n/).filter(Boolean), lines: source.split(/\r?\n/) };
                    },
                    execute(source) {
                        evaluations.push(source);
                        return { status: 'success', state: 'good', outputs: [{ type: 'mathml', markup: `<math data-command="${source}"></math>` }] };
                    },
                };
            },
        },
        './appEngine': {
            appEngine: {
                interpreter: {
                    ToMathML(source, display) {
                        math.push({ source, display });
                        return `<math display="${display}"></math>`;
                    },
                },
            },
        },
        './CommandOutputTarget': {},
        './markdown/extensions/mathjslab/browserWorkerExecutor': {
            createBrowserMathJSLabWorkerExecutor(options) {
                return {
                    toMathML: options.toMathML,
                    createSession: imports['./markdown/extensions/mathjslab/applicationExecutor'].createApplicationMathJSLabSession,
                };
            },
        },
        './evalInput': {
            evalInput(source) {
                if (source === 'parse-error') return { statements: [], lines: [source], error: new Error('Invalid commands') };
                return { statements: source.split(/\r?\n/).filter(Boolean), lines: source.split(/\r?\n/) };
            },
        },
        './evalPrompt': {
            evalCommand(source, target) {
                evaluations.push(source);
                target.setState('good');
                target.setHTML(`<math data-command="${source}"></math>`);
                return true;
            },
        },
        mermaid,
        marked: { Marked },
        'smiles-drawer': { __esModule: true, default: SmilesDrawer },
    };
    imports['../../../appEngine'] = imports['./appEngine'];
    imports['../../../CommandOutputTarget'] = imports['./CommandOutputTarget'];
    imports['../../../evalInput'] = imports['./evalInput'];
    imports['../../../evalPrompt'] = imports['./evalPrompt'];
    const modules = new Map();
    const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
    const load = (filename) => {
        const resolved = path.resolve(filename.endsWith('.ts') ? filename : `${filename}.ts`);
        if (modules.has(resolved)) return modules.get(resolved);
        const moduleExports = {};
        modules.set(resolved, moduleExports);
        const source = fs.readFileSync(resolved, 'utf8');
        const { outputText } = ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        });
        const require = (name) => {
            if (name === 'mermaid' || name === 'smiles-drawer') libraryLoads.push(name);
            return imports[name] ?? (name.startsWith('.') ? load(path.resolve(path.dirname(resolved), name)) : nodeRequire(name));
        };
        vm.runInNewContext(outputText, { exports: moduleExports, require, document, Element: HTMLElement, Error, MathJax, URL, AbortController, AbortSignal, TextEncoder });
        return moduleExports;
    };
    const { Markdown, MarkdownEngine, markdownEngine } = load(path.join(sourceRoot, 'Markdown'));
    Markdown.initialize();
    return { Markdown, MarkdownEngine, markdownEngine, calls, bindings, evaluations, libraryLoads, math, mathClears, mathTypesets, smiles, document };
}

test('code and Mermaid source survive HTML parsing without interpreting tags or entities', async () => {
    const { Markdown, calls, math } = service();
    const source = 'graph TD\n A["<b> &amp; </div> <br/> end"] --> B';
    const container = element(Markdown.parse('```mermaid title\n' + source + '\n```\n\n```html\n<b>&amp;</b>\n```\n\n`<i>&amp;</i>`\n\n%`a<2`%\n\n%%\nb>3\n%%'));
    assert.equal(container.querySelector('.mermaid').textContent, source);
    assert.equal(container.querySelector('code.language-html').textContent.trim(), '<b>&amp;</b>');
    assert.equal(container.querySelector('p code').textContent, '<i>&amp;</i>');
    assert.deepEqual(math, [
        { source: 'a<2', display: 'inline' },
        { source: 'b>3', display: 'block' },
    ]);
    await Markdown.typeset(container);
    assert.equal(calls[0].source, source);
    assert.ok(container.querySelector('.mermaid svg'));
});

test('MathJSLab expressions support simple, protected, and multiline delimiters', () => {
    const { Markdown, math } = service();
    const markdown = [
        'Simple %a + b% expression.',
        '',
        'Protected %`x * y`% expression.',
        '',
        '%%',
        'summation(k, 1, n,',
        '    k^2)',
        '%%',
        '',
        'Legacy `%old%` stays code.',
        '',
        'Ordinary `code`; progress changed from 50% complete to 60% today.',
    ].join('\n');
    const html = Markdown.parse(markdown);
    assert.deepEqual(math, [
        { source: 'a + b', display: 'inline' },
        { source: 'x * y', display: 'inline' },
        { source: 'summation(k, 1, n,\n    k^2)', display: 'block' },
    ]);
    assert.match(html, /<code>code<\/code>/);
    assert.match(html, /<code>%old%<\/code>/);
    assert.match(html, /50% complete to 60%/);
});

test('all migrated help expressions use the protected MathJSLab delimiter', () => {
    const { Markdown, math } = service();
    const visit = (directory) => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const filename = path.join(directory, entry.name);
            if (entry.isDirectory()) visit(filename);
            else if (entry.isFile() && entry.name.endsWith('.md')) Markdown.parse(fs.readFileSync(filename, 'utf8'));
        }
    };
    visit(fileURLToPath(new URL('../help/', import.meta.url)));
    // 450 migrated expressions plus three live examples in the Markdown help pages.
    assert.equal(math.length, 453);
});

test('independent documents, repeated and concurrent typesetting preserve diagrams and unique IDs', async () => {
    const { Markdown, calls, bindings } = service();
    const first = element(Markdown.parse('```mermaid\ngraph TD; A-->B\n```'));
    const second = element(Markdown.parse('```mermaid\nsequenceDiagram\n A->>B: Hello\n```'));
    await Promise.all([Markdown.typeset(first), Markdown.typeset(second), Markdown.typeset(first)]);
    const svg = first.innerHTML;
    await Markdown.typeset(first);
    assert.equal(first.innerHTML, svg);
    assert.equal(calls.length, 2);
    assert.equal(new Set(calls.map(({ id }) => id)).size, 2);
    assert.equal(bindings.length, 2);
});

test('default document traversal includes nested shadow roots and a diagram passed as the root', async () => {
    const { Markdown, calls, document } = service();
    document.innerHTML = '<section></section>';
    const host = document.querySelector('section');
    host.shadowRoot = element('<article></article>');
    host.shadowRoot.querySelector('article').shadowRoot = element(Markdown.parse('```mermaid\ngraph TD; A-->B\n```'));
    await Markdown.typeset();
    const diagram = element(Markdown.parse('```mermaid\ngraph TD; C-->D\n```')).firstChild;
    await Markdown.typeset(diagram);
    assert.equal(calls.length, 2);
    assert.ok(diagram.querySelector('svg'));
});

test('an invalid diagram keeps its source and error while later diagrams still render', async () => {
    const { Markdown, calls } = service();
    const container = element(Markdown.parse('```mermaid\ninvalid\n```\n\n```mermaid\ngraph TD; A-->B\n```'));
    await Markdown.typeset(container);
    assert.match(container.querySelector('[role="alert"]').textContent, /Invalid diagram/);
    assert.match(container.querySelector('.mermaid').textContent, /invalid/);
    assert.equal(container.querySelectorAll('svg').length, 1);
    assert.equal(calls.length, 2);
});

test('SMILES fences render flat molecular structures and isolate parse errors', async () => {
    const { Markdown, smiles } = service();
    const caffeine = 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C';
    const container = element(Markdown.parse(`\`\`\`smiles\n${caffeine}\n\`\`\`\n\n\`\`\`smiles\ninvalid-smiles\n\`\`\``));
    await Markdown.typeset(container);
    const svg = container.querySelector('.smiles svg');
    assert.ok(svg.querySelector('.molecule'));
    assert.equal(svg.getAttribute('role'), 'img');
    assert.equal(svg.getAttribute('aria-label'), `SMILES: ${caffeine}`);
    assert.deepEqual(smiles, [{ tree: { source: caffeine }, theme: 'light' }]);
    assert.match(container.querySelector('[role="alert"]').textContent, /Invalid SMILES/);
});

test('MathJSLab fences execute each parsed command once and show local parse errors', async () => {
    const { Markdown, evaluations } = service();
    const container = element(Markdown.parse('```mathjslab\na = 2\nb = a + 3\n```\n\n```mathjslab\nparse-error\n```'));
    assert.equal(container.querySelector('.markdown-extension-source').textContent, 'a = 2\nb = a + 3');
    await Markdown.typeset(container);
    assert.deepEqual(evaluations, ['a = 2', 'b = a + 3']);
    assert.equal(container.querySelectorAll('math[data-command]').length, 2);
    assert.match(container.querySelector('[role="alert"]').textContent, /Invalid commands/);
    await Markdown.typeset(container);
    assert.deepEqual(evaluations, ['a = 2', 'b = a + 3']);
});

test('Markdown engine registers extensions and passes document context while rendering', async () => {
    const { Markdown, document } = service();
    const seen = [];
    Markdown.registerExtension({
        name: 'lesson-object',
        fences: [
            {
                language: 'lesson-object',
                className: 'lesson-object',
                async render(container, source, context) {
                    seen.push({ source, sourceUrl: context.sourceUrl.href });
                    container.textContent = 'rendered';
                },
            },
        ],
    });
    const container = document.createElement('div');
    await Markdown.render('```lesson-object\nobject source\n```', container, { sourceUrl: new URL('https://example.test/lesson.md') });
    assert.deepEqual(seen, [{ source: 'object source', sourceUrl: 'https://example.test/lesson.md' }]);
    assert.equal(container.querySelector('.lesson-object').textContent, 'rendered');
});

test('GFM profile explicitly enables tables, tasks, autolinks, and strikethrough', () => {
    const { MarkdownEngine } = service();
    const source = ['| A | B |', '| - | - |', '| 1 | 2 |', '', '- [x] done', '', 'https://example.test', '', '~~removed~~'].join('\n');
    const gfm = new MarkdownEngine({ profile: 'gfm' }).parse(source);
    const core = new MarkdownEngine({ profile: 'core' }).parse(source);
    assert.match(gfm, /<table>/);
    assert.match(gfm, /type="checkbox"/);
    assert.match(gfm, /<a href="https:\/\/example\.test">/);
    assert.match(gfm, /<del>removed<\/del>/);
    assert.doesNotMatch(core, /<table>|type="checkbox"|<del>/);
    assert.doesNotMatch(core, /<a href="https:\/\/example\.test">/);
});

test('engine extensions contribute Marked plugins and lifecycle hooks', async () => {
    const { MarkdownEngine, document } = service();
    const events = [];
    const engine = new MarkdownEngine({
        extensions: [
            {
                name: 'lifecycle',
                marked: {
                    renderer: {
                        strong(token) {
                            return `<b data-extension="lifecycle">${this.parser.parseInline(token.tokens)}</b>`;
                        },
                    },
                },
                initialize(services) {
                    events.push(`initialize:${services.profile}`);
                },
                typeset() {
                    events.push('typeset');
                },
                dispose() {
                    events.push('dispose');
                },
            },
        ],
    });
    await engine.initialize();
    const container = document.createElement('div');
    await engine.render('**extension**', container);
    assert.ok(container.querySelector('b[data-extension="lifecycle"]'));
    await engine.dispose();
    assert.deepEqual(events, ['initialize:gfm', 'typeset', 'dispose']);
});

test('GFM headings, relative URLs, and syntax highlighting use document-scoped extensions', async () => {
    const { MarkdownEngine, document } = service();
    const engine = new MarkdownEngine({ profile: 'gfm' });
    const source = [
        '# Hello, World!',
        '# Hello World',
        '',
        '[Next](next.md) ![Figure](images/figure.svg) [Root](/guide) [Topic](#topic) [External](https://example.org/x)',
        '',
        '```javascript',
        'const answer = 42;',
        '```',
        '',
        '```unknown-language',
        '<unsafe>',
        '```',
    ].join('\n');
    const container = document.createElement('div');
    await engine.render(source, container, { sourceUrl: new URL('https://example.test/course/lesson.md') });
    assert.ok(container.querySelector('h1#hello-world'));
    assert.ok(container.querySelector('h1#hello-world-1'));
    assert.equal(container.querySelector('a').getAttribute('href'), 'https://example.test/course/next.md');
    assert.equal(container.querySelector('img').getAttribute('src'), 'https://example.test/course/images/figure.svg');
    assert.equal(container.querySelectorAll('a')[1].getAttribute('href'), 'https://example.test/guide');
    assert.equal(container.querySelectorAll('a')[2].getAttribute('href'), '#topic');
    assert.equal(container.querySelectorAll('a')[3].getAttribute('href'), 'https://example.org/x');
    assert.match(container.innerHTML, /class="hljs language-javascript"/);
    assert.match(container.innerHTML, /class="hljs-keyword"/);
    assert.match(container.innerHTML, /class="hljs language-unknown-language"/);
    assert.match(container.innerHTML, /&lt;unsafe&gt;/);

    const core = new MarkdownEngine({ profile: 'core' }).parse('# No generated id');
    assert.doesNotMatch(core, / id=/);
});

test('GitHub math syntaxes are isolated from prose and rendered by MathJax', async () => {
    const { MarkdownEngine, document, mathClears, mathTypesets } = service();
    const source = ['Inline $x^2 + 1$ and protected $`a_b + c`$.', '', '$$', '\\sum_{k=1}^{n} k', '$$', '', '```math', '\\frac{1}{2}', '```', '', 'Prices changed from $5 to $10.'].join(
        '\n',
    );
    const engine = new MarkdownEngine({ profile: 'gfm' });
    const container = document.createElement('div');
    container.innerHTML = engine.parse(source);
    assert.equal(container.querySelectorAll('.mathjax-pending').length, 4);
    assert.match(container.textContent, /Prices changed from \$5 to \$10/);
    await engine.typeset(container);
    assert.equal(mathTypesets.length, 1);
    assert.deepEqual(mathTypesets[0], ['\\(x^2 + 1\\)', '\\(a_b + c\\)', '\\[\\sum_{k=1}^{n} k\\]', '\\[\\frac{1}{2}\\]']);
    assert.equal(container.querySelectorAll('svg.mathjax-svg').length, 4);
    assert.ok(container.querySelector('style[data-markdown-extension-style="mathjax"]'));

    const core = new MarkdownEngine({ profile: 'core' }).parse('Formula $x + 1$');
    assert.doesNotMatch(core, /mathjax-pending/);
    await engine.dispose();
    assert.equal(mathClears.length, 1);
    assert.equal(mathClears[0].length, 4);
});

test('built-in extension manifests keep libraries lazy, styles local, and rendered objects disposable', async () => {
    const { markdownEngine: engine, document, libraryLoads } = service();
    const container = document.createElement('div');
    container.innerHTML = engine.parse(['```mermaid', 'graph TD; A-->B', '```', '', '```smiles', 'C', '```', '', '```mathjslab', 'a = 1', '```'].join('\n'));
    assert.deepEqual(libraryLoads, []);

    await engine.typeset(container);
    assert.deepEqual([...libraryLoads].sort(), ['mermaid', 'smiles-drawer']);
    assert.equal(container.querySelectorAll('style[data-markdown-extension-style]').length, 3);
    assert.ok(container.querySelector('.mermaid svg'));
    assert.ok(container.querySelector('.smiles svg'));
    assert.ok(container.querySelector('math[data-command="a = 1"]'));

    await engine.dispose();
    assert.equal(container.querySelector('.mermaid').childNodes.length, 0);
    assert.equal(container.querySelector('.smiles').childNodes.length, 0);
    assert.equal(container.querySelector('.mathjslab-execution').childNodes.length, 0);
});

test('educational fences are registered without loading their optional libraries during parsing', () => {
    const { markdownEngine: engine, libraryLoads } = service();
    const languages = ['abc', 'mei', 'musicxml', 'geojson', 'topojson', 'vega-lite', 'dot', 'graphviz', 'pdb', 'cif', 'mmcif', 'sdf', 'mol2', 'xyz', 'cube', 'stl', 'obj', 'gltf'];
    const html = engine.parse(languages.map((language) => `\`\`\`${language}\nexample\n\`\`\``).join('\n\n'));
    const container = element(html);
    assert.equal(container.querySelectorAll('[data-markdown-extension]').length, languages.length);
    assert.deepEqual(
        container.querySelectorAll('[data-markdown-language]').map((node) => node.getAttribute('data-markdown-language')),
        languages,
    );
    assert.deepEqual(libraryLoads, []);
});
