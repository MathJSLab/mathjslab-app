import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** Deploy the package's TeX runtime next to the worker emitted by Webpack. */
export class MarkdownRuntimeAssetsPlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('MarkdownRuntimeAssets', (compilation) => {
            compilation.hooks.processAssets.tap({ name: 'MarkdownRuntimeAssets', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL }, () => {
                const source = path.dirname(require.resolve('mathjslab-markdown/bundles/tikzjax/run-tex.js'));
                const visit = (directory, relative = '') => {
                    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                        const name = relative ? relative + '/' + entry.name : entry.name;
                        const filename = path.join(directory, entry.name);
                        if (entry.isDirectory()) visit(filename, name);
                        else if (name !== 'run-tex.js' && name !== 'run-tex.js.LICENSE.txt') {
                            compilation.emitAsset('tikzjax/' + name, new compiler.webpack.sources.RawSource(fs.readFileSync(filename)));
                        }
                    }
                };
                visit(source);
            });
        });
    }
}
