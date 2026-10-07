import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';

const directory = path.dirname(fileURLToPath(import.meta.url));

export default (_environment: unknown, arguments_: { mode?: 'development' | 'production' }): webpack.Configuration => ({
    name: 'markdown-test-worker',
    mode: arguments_.mode ?? 'production',
    entry: path.join(directory, 'src', 'markdown', 'extensions', 'mathjslab', 'mathjslab.worker.ts'),
    experiments: { outputModule: true },
    module: {
        rules: [
            {
                test: /\.ts$/i,
                exclude: /node_modules/,
                use: [{ loader: 'ts-loader', options: { configFile: 'tsconfig.build.json' } }],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: { module: false },
        extensionAlias: { '.js': ['.js', '.ts'] },
    },
    output: {
        path: path.join(directory, 'dist', 'markdown-test-worker'),
        filename: 'mathjslab-worker.js',
        module: true,
        publicPath: 'auto',
        clean: true,
    },
    plugins: [new webpack.IgnorePlugin({ resourceRegExp: /^node:module$/ })],
});
