import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { mathjslabAliases, markdownAdapterFingerprint } from './helper/mathjslab-distribution.mjs';

/** Validate prepared builds without rebuilding, installing or modifying package versions. */
async function main() {
    const require = createRequire(import.meta.url);
    const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
    const markdownRequire = createRequire(require.resolve('mathjslab-markdown'));
    const core = realpathSync(require.resolve('mathjslab'));
    assert.equal(realpathSync(markdownRequire.resolve('mathjslab')), core, 'Markdown and app must resolve one core');
    for (const name of ['mathjslab', 'mathjslab-markdown']) {
        const dependency = packageJson.dependencies[name];
        if (dependency.startsWith('file:') && !dependency.endsWith('.tgz')) {
            assert.equal(realpathSync(resolve('node_modules', name)), realpathSync(resolve(dependency.slice(5))));
        } else {
            assert.ok(!dependency.startsWith('file:') || dependency.endsWith('.tgz'), `Invalid packaged dependency: ${name}`);
            assert.equal(realpathSync(resolve('node_modules', name)), resolve('node_modules', name), `Unexpected linked package: ${name}`);
        }
    }
    const expected = Object.fromEntries(
        [...new Set(Object.values(mathjslabAliases))].map((file) => [file.split(/[\\/]/).at(-1), createHash('sha256').update(readFileSync(file)).digest('hex')]),
    );
    const manifests = ['dist', 'dist/markdown-document', 'dist/markdown-test-worker'].map((directory) => {
        const manifest = JSON.parse(readFileSync(resolve(directory, 'mathjslab-distribution.json')));
        assert.deepEqual(manifest.inputs, expected, `Stale core/runtime assets in ${directory}`);
        assert.deepEqual(manifest.markdownAdapter, markdownAdapterFingerprint(), `Markdown adapter changed since ${directory} was built`);
        for (const asset of manifest.assets) readFileSync(resolve(directory, asset));
        return { directory, ...manifest };
    });
    const { Interpreter } = await import('mathjslab');
    const coreModule = await import('mathjslab/core');
    assert.equal(Interpreter, coreModule.Interpreter, 'Node core identity');
    const { InProcessMathJSLabRuntime } = await import('mathjslab/runtime');
    assert.equal(InProcessMathJSLabRuntime, coreModule.InProcessMathJSLabRuntime, 'Runtime core identity');
    mkdirSync('test-results', { recursive: true });
    writeFileSync('test-results/runtime-distribution.json', JSON.stringify({ checkedAt: new Date().toISOString(), core, manifests }, null, 2));
    console.log('Dependency installations, app/Markdown/Node core identity and all three build fingerprints match.');
}

void main();
