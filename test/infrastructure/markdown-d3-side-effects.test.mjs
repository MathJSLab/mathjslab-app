import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import webpack from 'webpack';
import { markdownD3SideEffectsRule } from '../../script/helper/markdown-runtime-assets.mjs';

test('production tree shaking retains Mermaid selection transition handlers', async () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'mathjslab-d3-'));
    const entry = path.join(directory, 'entry.mjs');
    const rule = markdownD3SideEffectsRule();
    writeFileSync(
        entry,
        `import { selection } from ${JSON.stringify(rule.include)};
export const transition = typeof selection.prototype.transition;
export const interrupt = typeof selection.prototype.interrupt;
`,
    );
    const compiler = webpack({
        mode: 'production',
        entry,
        // Test production export pruning without spending time on minification.
        optimization: { minimize: false },
        module: { rules: [rule] },
        output: { path: directory, filename: 'bundle.cjs', library: { type: 'commonjs2' } },
    });
    try {
        await new Promise((resolve, reject) =>
            compiler.run((error, stats) => {
                if (error || stats.hasErrors()) reject(error ?? new Error(stats.toString({ all: false, errors: true })));
                else resolve();
            }),
        );
        const result = createRequire(import.meta.url)(path.join(directory, 'bundle.cjs'));
        assert.equal(result.transition, 'function');
        assert.equal(result.interrupt, 'function');
    } finally {
        await new Promise((resolve, reject) => compiler.close((error) => (error ? reject(error) : resolve())));
        rmSync(directory, { recursive: true, force: true });
    }
});
