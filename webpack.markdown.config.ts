import { MarkdownNetlistBrowserPlugin, MarkdownRuntimeAssetsPlugin } from './script/helper/markdown-runtime-assets.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';

const directory = path.dirname(fileURLToPath(import.meta.url));

export default (_environment: unknown, arguments_: { mode?: 'development' | 'production' }): webpack.Configuration => ({
    name: 'markdown-document',
    mode: arguments_.mode ?? 'production',
    entry: {
        'markdown-document': path.join(directory, 'src', 'markdown-document.ts'),
        core: path.join(directory, 'src', 'markdown-core.ts'),
        component: path.join(directory, 'src', 'markdown-component.ts'),
        'component-register': path.join(directory, 'src', 'markdown-component-register.ts'),
        extensions: path.join(directory, 'src', 'markdown-extensions.ts'),
        mathjslab: path.join(directory, 'src', 'markdown-mathjslab.ts'),
        'mathjslab-worker': path.join(directory, 'src', 'markdown-mathjslab-worker.ts'),
        hdl: path.join(directory, 'src', 'markdown-hdl.ts'),
    },
    experiments: { outputModule: true },
    module: {
        rules: [
            { test: /run-tex\.js$/i, resourceQuery: /url/, type: 'asset/resource', generator: { filename: 'tikzjax/run-tex.js' } },
            {
                test: /\.ts$/i,
                exclude: /node_modules/,
                use: [{ loader: 'ts-loader', options: { configFile: 'tsconfig.build.json' } }],
            },
            { test: /\.css$/i, resourceQuery: /inline/, type: 'asset/source' },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        // netlistsvg/onml only needs sax.parser(); no Node stream polyfill is needed.
        fallback: { module: false, stream: false },
        extensionAlias: { '.js': ['.js', '.ts'] },
    },
    optimization: { runtimeChunk: 'single', splitChunks: { chunks: 'all' } },
    ignoreWarnings: [
        {
            module: /node_modules[\\/]mathjax[\\/]tex-svg\.js$/,
            message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
        },
    ],
    output: {
        path: path.join(directory, 'dist', 'markdown-document'),
        filename: '[name].js',
        chunkFilename: 'chunks/[name].[contenthash:8].js',
        library: { type: 'module' },
        publicPath: 'auto',
        clean: true,
    },
    plugins: [new webpack.IgnorePlugin({ resourceRegExp: /^node:module$/ }), new MarkdownNetlistBrowserPlugin(), new MarkdownRuntimeAssetsPlugin()],
});
