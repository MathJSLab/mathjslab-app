import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AST, Interpreter } from 'mathjslab';
import { tsImport } from 'tsx/esm/api';
import { exampleLeaves } from '../src/example-manifest.cjs';

async function main() {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const { languageAlias } = await tsImport('../src/InterpreterAliases.ts', import.meta.url);
    const locales = ['en', 'es', 'pt'];
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'example/example.json'), 'utf8'));
    const leaves = exampleLeaves(manifest);
    const filter = process.argv[2];
    const selected = leaves.filter((leaf) => !filter || leaf.path.includes(filter));
    assert.ok(selected.length, 'No matching examples.');

    function collectTemplates(directory, prefix = '') {
        return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
            const relative = `${prefix}${entry.name}`;
            return entry.isDirectory() ? collectTemplates(path.join(directory, entry.name), `${relative}/`) : entry.name.endsWith('.m.njk') ? [relative] : [];
        });
    }

    function checkTranslations(record, label) {
        for (const entry of Object.values(record)) {
            for (const field of ['caption', 'description']) {
                for (const locale of locales) assert.ok(entry[field][locale]?.trim(), `${label}: missing ${field}.${locale}`);
            }
            if (entry.children) checkTranslations(entry.children, `${label}/${entry.directory}`);
        }
    }

    function finitePlotValues(value) {
        if (typeof value === 'number') assert.ok(Number.isFinite(value), 'Nonfinite plot coordinate.');
        else if (value && typeof value === 'object') Object.values(value).forEach(finitePlotValues);
    }

    assert.deepEqual(collectTemplates(path.join(root, 'example')).sort(), leaves.map((leaf) => `${leaf.path}.njk`).sort(), 'Templates and manifest must agree.');
    assert.ok(
        Object.values(manifest).every((entry) => entry.children),
        'All examples should be grouped in directories.',
    );
    assert.equal(leaves[0].keys.at(-1), 'bhaskara', 'Preserve the first example.');
    checkTranslations(manifest, 'manifest');
    const bundled = JSON.parse(fs.readFileSync(path.join(root, 'src/first-example.json'), 'utf8'));
    assert.equal(bundled.name, leaves[0].keys.join('/'), 'Build and runtime must select the same first file.');
    for (const locale of locales) {
        assert.equal(bundled.content[locale], fs.readFileSync(path.join(root, 'dist/example', locale, leaves[0].path), 'utf8'));
    }

    const failures = [];
    let executions = 0;
    let checkedResults = 0;
    let plots = 0;
    let markdownLoads = 0;
    let currentGroup;
    for (const leaf of selected) {
        if (currentGroup !== leaf.keys[0]) {
            currentGroup = leaf.keys[0];
            console.log(`Validating ${currentGroup}...`);
        }
        const template = fs.readFileSync(path.join(root, 'example', `${leaf.path}.njk`), 'utf8');
        const frontmatter = template.match(/^---json\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/u);
        assert.ok(frontmatter, `Missing JSON frontmatter: ${leaf.path}`);
        const data = JSON.parse(frontmatter[1]);
        const selfChecking = /^example_check\s*=/mu.test(template);
        for (const [name, translations] of Object.entries(data.comments)) {
            for (const locale of locales) assert.ok(translations[locale]?.trim(), `${leaf.path}: missing comments.${name}.${locale}`);
        }
        if (data.comments.reference) {
            const urls = locales.map((locale) => data.comments.reference[locale].match(/https:\/\/[^\s]+/u)?.[0]);
            assert.ok(
                urls.every((url) => url && url === urls[0]),
                `${leaf.path}: reference URL must be preserved across languages`,
            );
        }
        let referenceCode;
        for (const locale of locales) {
            try {
                const source = fs.readFileSync(path.join(root, 'dist/example', locale, leaf.path), 'utf8');
                assert.ok(!source.includes('{{') && !source.includes('{%'), 'Unrendered Nunjucks expression.');
                if (data.comments.reference) assert.ok(source.includes(data.comments.reference[locale]), 'Missing rendered reference comment.');
                if (selfChecking) {
                    const code = source.replace(/^\s*%[^\r\n]*/gmu, '').trim();
                    if (referenceCode === undefined) referenceCode = code;
                    else assert.equal(code, referenceCode, 'Translations must preserve executable code.');
                }
                const markdownRequests = [];
                if (data.markdownDocument !== undefined) {
                    assert.ok(leaf.path.startsWith('markdown/'), 'Markdown wrappers belong to their catalogue category.');
                    assert.match(data.markdownDocument, /^(?:[a-z0-9-]+|README)\.md$/u, 'Expected a lesson filename or localized index.');
                    if (data.markdownDirectory !== undefined)
                        assert.equal(data.markdownDirectory, 'digital-electronics/pt', 'Only the explicitly shared Portuguese collection overrides locale.');
                    const expectedUrl = `https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/${data.markdownDirectory ?? locale}/${data.markdownDocument}`;
                    const commands = source
                        .replace(/^\s*%[^\r\n]*/gmu, '')
                        .trim()
                        .replace(/\r\n/gu, '\n');
                    assert.equal(commands, `clear\nmarkdown("${expectedUrl}")`, 'Markdown wrapper must load its matching locale from the raw package repository.');
                }
                // Browser loading is checked without network access here; browser
                // integration tests exercise the real markdown() implementation.
                const interpreter = Interpreter.Create({
                    aliasNameTable: languageAlias[locale],
                    externalCmdWListTable: { help: { func: () => {} } },
                    externalFunctionTable: data.markdownDocument
                        ? {
                              markdown: {
                                  type: 'BUILTIN',
                                  id: 'markdown',
                                  mapper: false,
                                  ev: [true],
                                  func: (url) => {
                                      markdownRequests.push(url.str);
                                      return AST.nodeIndexExpr(AST.nodeIdentifier('markdown'), AST.nodeList([url]));
                                  },
                              },
                          }
                        : {},
                });
                const plotRequests = [];
                interpreter.withPlotOutput(
                    (request) => {
                        assert.ok(request.data.length, 'Empty plot request.');
                        finitePlotValues(request.data);
                        plotRequests.push(request);
                        plots++;
                    },
                    () => interpreter.Evaluate(interpreter.Parse(source)),
                );
                if (selfChecking && leaf.path.startsWith('graphics/')) assert.ok(plotRequests.length, 'Graphics exercise must emit a plot.');
                if (data.markdownDocument) {
                    assert.deepEqual(markdownRequests, [
                        `https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/${data.markdownDirectory ?? locale}/${data.markdownDocument}`,
                    ]);
                    markdownLoads++;
                }
                if (leaf.path.endsWith('/histogram-of-counts.m')) {
                    assert.deepEqual(plotRequests[0].data[0].x, [1, 2, 3, 4], 'Histogram category coordinates.');
                    assert.deepEqual(plotRequests[0].data[0].y, [3, 7, 5, 1], 'Histogram precomputed counts.');
                }
                if (selfChecking) {
                    const result = interpreter.Unparse(interpreter.Evaluate(interpreter.Parse('example_check'))).trim();
                    assert.equal(result, 'true', 'Expected numerical result check to pass.');
                    checkedResults++;
                }
                executions++;
            } catch (error) {
                failures.push(`${locale}/${leaf.path}: ${error.message}`);
                console.error(failures.at(-1));
            }
        }
    }
    console.log(`${selected.length} templates; ${executions} successful locale executions; ${checkedResults} result checks; ${plots} native plot requests; ${markdownLoads} Markdown loads.`);
    if (failures.length) {
        console.error(`${failures.length} example validations failed.`);
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
