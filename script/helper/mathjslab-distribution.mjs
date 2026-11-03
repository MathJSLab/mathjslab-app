import { createRequire } from 'node:module';
import { realpathSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

/** Resolve all browser inputs from the app's installed package, including linked consumers. */
const require = createRequire(new URL('../../package.json', import.meta.url));
export const coreDistribution = dirname(realpathSync(require.resolve('mathjslab')));

const fingerprint = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
/** Hash the installed browser executor and its public option declarations. */
export const markdownAdapterFingerprint = () => {
    const source = dirname(realpathSync(require.resolve('mathjslab-markdown/mathjslab')));
    const relative = ['markdown', 'extensions', 'mathjslab', 'browserWorkerExecutor'];
    return {
        javascript: fingerprint(join(source, ...relative) + '.js'),
        declarations: fingerprint(join(source, '..', 'types', ...relative) + '.d.ts'),
    };
};
const buildInputs = () => ({
    inputs: Object.fromEntries([...new Set(Object.values(mathjslabAliases))].map((file) => [file.split(/[\\/]/).at(-1), fingerprint(file)])),
    markdownAdapter: markdownAdapterFingerprint(),
});

/** Emit deployment provenance and reject a dependency change during compilation. */
export class MathJSLabDistributionPlugin {
    /** @param {import('webpack').Compiler} compiler Browser or Worker compilation owner. */
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('MathJSLabDistributionPlugin', (compilation) => {
            const initial = buildInputs();
            compilation.hooks.processAssets.tap({ name: 'MathJSLabDistributionPlugin', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT }, () => {
                if (JSON.stringify(initial) !== JSON.stringify(buildInputs())) throw new Error('Core or Markdown adapter changed during bundling; rebuild against a stable distribution.');
                const assets = Object.keys(compilation.assets).filter((file) => file.endsWith('.js'));
                compilation.emitAsset('mathjslab-distribution.json', new compiler.webpack.sources.RawSource(JSON.stringify({ ...initial, assets }, null, 2)));
            });
        });
    }
}
// Exact aliases also cover imports originating in linked sibling packages.
export const mathjslabAliases = Object.fromEntries(
    Object.entries({
        mathjslab: 'mathjslab.web.esm2022.js',
        'mathjslab/core': 'mathjslab.web.esm2022.js',
        'mathjslab/runtime': 'mathjslab.runtime.esm2022.js',
        'mathjslab/runtime/browser': 'mathjslab.runtime-browser.esm2022.js',
        'mathjslab/worker': 'mathjslab.runtime-worker.esm2022.js',
    }).map(([name, filename]) => {
        const target = join(coreDistribution, filename);
        if (!existsSync(target)) throw new Error(`Build the complete mathjslab distribution first: ${target}`);
        return [`${name}$`, target];
    }),
);
