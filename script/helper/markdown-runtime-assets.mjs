import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const netlistPackages = () => {
    // Resolve optional renderer dependencies from their owning package. A local
    // development link need not hoist them into the application's node_modules.
    const markdownRequire = createRequire(require.resolve('mathjslab-markdown'));
    const renderer = markdownRequire.resolve('netlistsvg/package.json');
    const rendererRequire = createRequire(renderer);
    return {
        renderer: path.dirname(renderer),
        layout: path.dirname(rendererRequire.resolve('elkjs/package.json')),
        browserLayout: rendererRequire.resolve('elkjs/lib/elk.bundled.js'),
    };
};

/** Keep netlistsvg's own ELK version, using its browser bundle instead of Node workers. */
export class MarkdownNetlistBrowserPlugin {
    apply(compiler) {
        const { browserLayout } = netlistPackages();
        new compiler.webpack.NormalModuleReplacementPlugin(/^elkjs$/, (resource) => {
            if (/[\\/]netlistsvg[\\/]/.test(resource.context)) resource.request = browserLayout;
        }).apply(compiler);
    }
}

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
                // Preserve original loader bytes and their pinned hashes in both modes.
                const hdlRoot = path.dirname(require.resolve('mathjslab-markdown/hdl/assets/browser-worker.mjs'));
                const copyHDL = (directory, relative = '') => {
                    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                        const name = relative ? relative + '/' + entry.name : entry.name;
                        const filename = path.join(directory, entry.name);
                        if (entry.isDirectory()) copyHDL(filename, name);
                        else compilation.emitAsset('hdl/' + name, new compiler.webpack.sources.RawSource(fs.readFileSync(filename)), { minimized: true });
                    }
                };
                copyHDL(hdlRoot);
                const packages = netlistPackages();
                for (const [name, directory] of [
                    ['netlistsvg', packages.renderer],
                    ['elkjs', packages.layout],
                ]) {
                    compilation.emitAsset(`netlist/licenses/${name}-LICENSE`, new compiler.webpack.sources.RawSource(fs.readFileSync(path.join(directory, 'LICENSE'))));
                }
                const molecularLicense = require.resolve('mathjslab-markdown/bundles/molecule-3d/licenses/3dmol-LICENSE');
                compilation.emitAsset('molecule-3d/licenses/3dmol-LICENSE', new compiler.webpack.sources.RawSource(fs.readFileSync(molecularLicense)));
            });
        });
    }
}
