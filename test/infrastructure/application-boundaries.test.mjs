import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '../..');
const require = createRequire(import.meta.url);
const sourceRoot = path.join(root, 'src');
const files = (directory) =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const filename = path.join(directory, entry.name);
        return entry.isDirectory() ? files(filename) : /\.[cm]?ts$/.test(entry.name) ? [filename] : [];
    });
const publicEntries = new Set([
    'mathjslab-markdown',
    'mathjslab-markdown/component',
    'mathjslab-markdown/component/register',
    'mathjslab-markdown/extensions',
    'mathjslab-markdown/mathjslab',
    'mathjslab-markdown/mathjslab/worker',
    'mathjslab-markdown/hdl',
]);
const config = ts.readConfigFile(path.join(root, 'tsconfig.build.json'), ts.sys.readFile);
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);

test('application imports resolve without local Markdown package facades or implementations', () => {
    for (const filename of files(sourceRoot)) {
        const relative = path.relative(root, filename).replaceAll('\\', '/');
        const source = ts.createSourceFile(filename, readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
        const check = (node) => {
            const specifier = ts.isImportDeclaration(node) || ts.isExportDeclaration(node) ? node.moduleSpecifier : undefined;
            if (specifier && ts.isStringLiteral(specifier)) {
                const name = specifier.text;
                if (name.startsWith('mathjslab-markdown')) {
                    assert.ok(!ts.isExportDeclaration(node), `${relative} must consume the package, not re-export it`);
                    // The public API has no session-disposal subscription. This one
                    // explicit package export preserves navigator cleanup on replacement.
                    const lifecycleHook = relative === 'src/Markdown.ts' && name === 'mathjslab-markdown/compat/markdown/lifecycle';
                    assert.ok(publicEntries.has(name) || lifecycleHook, `${relative}: unsupported package boundary ${name}`);
                    assert.ok(require.resolve(name), `${relative}: missing installed entry ${name}`);
                } else if (name.startsWith('.')) {
                    const resolved = ts.resolveModuleName(name, filename, options, ts.sys).resolvedModule;
                    assert.ok(resolved || existsSync(path.resolve(path.dirname(filename), name)), `${relative}: missing local import ${name}`);
                }
            }
            ts.forEachChild(node, check);
        };
        check(source);
    }
    assert.ok(!existsSync(path.join(sourceRoot, 'markdown')), 'Reusable Markdown modules belong to the installed package');
});

test('shared-repository updates cannot overwrite app-owned build, lint, Markdown and Plotly integration', () => {
    const configuration = JSON.parse(readFileSync(path.join(root, 'copy.repo.config.json'), 'utf8'));
    const appOwned = new Set([
        'eleventy.build.mjs',
        'eslint.config.cjs',
        'src/Markdown.ts',
        'src/mathjslab.worker.ts',
        'src/PlotEngine.ts',
        'src/MarkdownHDLConfiguration.ts',
        'src/MarkdownMapConfiguration.ts',
    ]);
    for (const entry of configuration.files) {
        const destination = typeof entry === 'string' ? entry : (entry.dest ?? entry.src);
        assert.ok(!appOwned.has(destination), `Shared copy would overwrite ${destination}`);
        assert.ok(!['src/outputFunction.ts', 'src/styles/constants.json.njk'].includes(destination), `Shared copy would restore obsolete ${destination}`);
    }
});

test('Webpack plugins can validate options with the installed dependency tree', () => {
    // Resolve from the actual consumer: legacy-peer-deps can otherwise hoist
    // ajv-keywords beside an incompatible AJV major version.
    const pluginRequire = createRequire(require.resolve('html-webpack-plugin'));
    const { validate } = pluginRequire('schema-utils');
    const schema = { type: 'object', properties: { name: { type: 'string' } }, additionalProperties: false };
    assert.doesNotThrow(() => validate(schema, { name: 'application' }));
    assert.throws(() => validate(schema, { name: 42 }), /name/);
});
