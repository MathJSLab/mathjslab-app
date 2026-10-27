import { MarkdownNetlistBrowserPlugin, MarkdownRuntimeAssetsPlugin } from './script/helper/markdown-runtime-assets.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';

const directory = path.dirname(fileURLToPath(import.meta.url));

export default (_environment: unknown, arguments_: { mode?: 'development' | 'production' }): webpack.Configuration => ({
    name: 'markdown-document',
    mode: arguments_.mode ?? 'production',
    entry: {
        'markdown-document': 'mathjslab-markdown/browser',
        core: 'mathjslab-markdown',
        component: 'mathjslab-markdown/component',
        'component-register': 'mathjslab-markdown/component/register',
        extensions: 'mathjslab-markdown/extensions',
        mathjslab: 'mathjslab-markdown/mathjslab',
        'mathjslab-worker': 'mathjslab-markdown/mathjslab/worker',
        hdl: 'mathjslab-markdown/hdl',
    },
    experiments: { outputModule: true },
    module: {
        rules: [
            { test: /run-tex\.js$/i, resourceQuery: /url/, type: 'asset/resource', generator: { filename: 'tikzjax/run-tex.js' } },
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
