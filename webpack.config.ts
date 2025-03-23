/**
 * webpack.config.ts: Webpack configuration factory.
 */

import fs from 'node:fs';
import path from 'node:path';
import webpack from 'webpack';
import 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
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
                                        auto: true,
                                        localIdentName: isProduction ? '[hash:base64]' : '[path][name]__[local]',
                                    },
                                },
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sassOptions: {
                                        silenceDeprecations: ['global-builtin'],
                                        outputStyle: 'compressed',
                                    },
                                },
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
                                        silenceDeprecations: ['global-builtin'],
                                        outputStyle: 'compressed',
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
                // mainFields: ['import', 'module', 'main'],
                // conditionNames: ['import', 'module', 'default'],
                // exportsFields: ['exports'],
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
    if (isProduction) {
        const analyzerConfig = (buildConfiguration as any).analyzer;
        if (typeof analyzerConfig !== 'undefined') {
            bundlesConfiguration.forEach((config) => {
                let options: BundleAnalyzerPlugin.Options = {
                    analyzerMode: 'static',
                    openAnalyzer: true,
                    generateStatsFile: true,
                    defaultSizes: 'stat',
                    statsFilename: `../report/${config.name}.stats.json`,
                    reportFilename: `../report/${config.name}.html`,
                };
                if (typeof analyzerConfig === 'object') {
                    options = Object.assign(options, analyzerConfig);
                }
                config.plugins!.push(new BundleAnalyzerPlugin(options));
            });
        }
    } else {
        const devServerConfig = (buildConfiguration as any).devServer;
        if (typeof devServerConfig !== 'undefined') {
            bundlesConfiguration.forEach((config) => {
                Object.assign(config, {
                    devtool: 'inline-source-map',
                    devServer: {
                        static: path.join(__dirname, 'dist'),
                        compress: typeof devServerConfig.compress !== 'undefined' ? devServerConfig.compress : true,
                        port: typeof devServerConfig.port !== 'undefined' ? devServerConfig.port : 4000,
                        hot: typeof devServerConfig.hot !== 'undefined' ? devServerConfig.hot : true,
                        open: typeof devServerConfig.open !== 'undefined' ? devServerConfig.open : false,
                    },
                });
            });
        }
    }
    return bundlesConfiguration;
};
