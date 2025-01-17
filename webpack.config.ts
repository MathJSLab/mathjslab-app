/**
 * webpack.config.ts: Webpack configuration factory.
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import ejs from 'ejs';
import webpack from 'webpack';
import 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import DotenvWebpackPlugin from 'dotenv-webpack';

import component from './src/components/component.include.json';

export default (env: any, argv: any): webpack.Configuration => {
    const buildEnvPath = path.join(__dirname, 'build.env');
    const envVars = dotenv.config({
        path: buildEnvPath,
    });
    dotenvExpand.expand(envVars);
    Object.assign(envVars.parsed!, env);
    envVars.parsed!.WEBPACK_MODE = argv.mode;
    const isProduction = argv.mode.startsWith('prod') || !argv.mode.startsWith('dev');
    const configuration: webpack.Configuration = {
        mode: argv.mode,
        entry: path.join(__dirname, 'src', 'main.ts'),
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
                    exclude: [
                        'node_modules',
                        process.env.MATHJSLAB_APP_WEBPACK_OUTPUT_PATH!,
                        'data',
                        'doc',
                        'example',
                        'help',
                        'images',
                        'm-file',
                        'script',
                    ].map((dir) => path.join(__dirname, dir)),
                },
                {
                    test: /\.(c|sa|sc)ss$/i,
                    exclude: [/node_modules/, /\.styles.scss$/],
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
                    exclude: /node_modules/,
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
                //     exclude: [/node_modules/],
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
            filename: process.env.MATHJSLAB_APP_WEBPACK_OUTPUT_FILENAME!,
            path: path.join(__dirname, process.env.MATHJSLAB_APP_WEBPACK_OUTPUT_PATH!),
            environment: {
                // module: true, // Enable CSS modules for files with `.module.scss`
                dynamicImport: true,
            },
        },
        plugins: [
            new DotenvWebpackPlugin({
                path: buildEnvPath,
                systemvars: true,
            }),
            new HtmlWebpackPlugin({
                title: process.env.MATHJSLAB_APP_TITLE,
                // template: path.join(__dirname, 'src', 'main.html'),
                templateContent: (_templateParameters: { [option: string]: any }): string => {
                    let baseHtml = fs.readFileSync(path.join(__dirname, 'src', 'main.html'), 'utf-8');
                    component.include.forEach((component) => {
                        const componentTemplate = fs.readFileSync(
                            path.join(__dirname, 'src', 'components', component, component + '.template.html'),
                            'utf-8',
                        );
                        baseHtml = baseHtml.replace('</body>', `\n${componentTemplate}\n</body>`);
                    });
                    return ejs.render(baseHtml, {
                        process,
                    });
                },
                inject: 'body' /* Inject the assets at the end of the body. */,
            }),
            ...(isProduction ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })] : []),
        ],
    };
    if (isProduction) {
        configuration.plugins!.push(
            new MiniCssExtractPlugin({
                // filename: '[name].[contenthash].css',
            }),
        );
    } else {
        configuration.devtool = 'inline-source-map';
        configuration.devServer = {
            static: path.join(__dirname, process.env.MATHJSLAB_APP_WEBPACK_OUTPUT_PATH!),
            compress: true,
            port: process.env.MATHJSLAB_APP_WEBPACK_DEVSERVER_PORT,
            hot: true,
        };
    }
    console.warn(
        `Webpack configuration path: ${__filename}\n- Building ${process.env.MATHJSLAB_APP_TITLE} ${argv.mode} bundle.\n- Environment file: ${buildEnvPath}\n- Build environment variables:`,
    );
    console.table(envVars.parsed);
    return configuration;
};
