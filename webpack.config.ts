/**
 * webpack.config.ts: Webpack configuration factory.
 */

import fs from 'node:fs';
import path from 'node:path';
import webpack from 'webpack';
import 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import buildConfig from 'build.config.json';

import { components, templates } from './src/components/component.include';

export default (env: any, argv: any): webpack.Configuration[] => {
    const mode = (argv.mode || 'production') as 'production' | 'development';
    const isProduction = mode === 'production';
    const buildConfiguration = buildConfig[mode];
    const defaultExclude = ['node_modules', 'dist', 'data', 'doc', 'example', 'help', 'images', 'm-file', 'script'];

    console.log(`\nWebpack configuration: ${path.basename(__filename)}`);
    console.log(`Web components included:`);
    console.table(components.include);
    console.log(`Building ${mode} bundle.`);
    console.log(`Build environment variables:`);
    console.table(env);

    const WebpackConfiguration: webpack.Configuration[] = [
        {
            name: 'mathjslab-app',
            mode: argv.mode,
            entry: {
                'mathjslab-app': path.join(__dirname, 'src', 'main.ts'),
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/i,
                        use: [
                            {
                                loader: 'ts-loader',
                                options: {
                                    configFile: 'tsconfig.build.json',
                                },
                            },
                        ],
                        exclude: defaultExclude.map((dir) => (typeof dir === 'string' ? path.join(__dirname, dir) : dir)),
                    },
                    {
                        test: /\.(c|sa|sc)ss$/i,
                        exclude: [...defaultExclude, /\.styles.scss$/].map((dir) => (typeof dir === 'string' ? path.join(__dirname, dir) : dir)),
                        use: [
                            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: {
                                        auto: true, // Enable CSS modules for files with `.module.scss`
                                        localIdentName: isProduction ? '[hash:base64]' : '[path][name]__[local]',
                                    },
                                },
                            },
                            {
                                loader: 'sass-loader',
                            },
                        ],
                    },
                    {
                        test: /\.styles.scss$/,
                        exclude: defaultExclude.map((dir) => (typeof dir === 'string' ? path.join(__dirname, dir) : dir)),
                        use: [
                            'sass-to-string',
                            {
                                loader: 'sass-loader',
                                options: {
                                    sassOptions: {
                                        outputStyle: 'compressed',
                                    },
                                },
                            },
                        ],
                    },
                    // {
                    //     test: /\.s[ac]ss$/i,
                    //     exclude: defaultExclude.map((dir) => typeof dir === 'string' ? path.join(__dirname, dir) : dir),
                    //     use: [
                    //         isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    //         {
                    //             loader: 'css-loader',
                    //             options: {
                    //                 modules: {
                    //                     auto: true,
                    //                     localIdentName: isProduction
                    //                         ? '[hash:base64]'
                    //                         : '[path][name]__[local]',
                    //                 },
                    //             },
                    //         },
                    //         'sass-loader'
                    //     ],
                    // },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
            },
            output: {
                filename: 'mathjslab-app.js',
                path: path.join(__dirname, 'dist'),
                environment: {
                    // module: true, // Enable CSS modules for files with `.module.scss`
                    dynamicImport: true,
                },
            },
            plugins: [
                new HtmlWebpackPlugin({
                    title: 'MathJSLab',
                    templateContent: (_templateParameters: { [option: string]: any }): string =>
                        fs.readFileSync(path.join(__dirname, 'src', 'main.html'), 'utf-8').replace('</body>', templates + '</body>'),
                    inject: 'body' /* Inject the assets at the end of the body. */,
                }),
                ...(isProduction ? [new MiniCssExtractPlugin({ filename: '[name].css' })] : []),
            ],
        },
    ];
    const bundlesConfiguration = WebpackConfiguration.filter((config) => buildConfiguration.bundles.includes(config.name!));
    if (!isProduction) {
        Object.assign(bundlesConfiguration[0], {
            devtool: 'inline-source-map',
            devServer: {
                static: path.join(__dirname, 'dist'),
                compress: true,
                port: 4000,
                hot: true,
            },
        });
    }
    return bundlesConfiguration;
};
