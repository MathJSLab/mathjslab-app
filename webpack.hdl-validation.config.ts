import configuration from './webpack.config';
import path from 'node:path';

/** Real dev-server acceptance harness: only static lessons and compiler assets. */
export default (environment: unknown, arguments_: unknown) =>
    configuration(environment, arguments_).map((config) => ({
        ...config,
        devServer: {
            host: '127.0.0.1',
            port: 4174,
            server: 'http',
            open: false,
            hot: false,
            liveReload: false,
            client: false,
            devMiddleware: { publicPath: '/lab/', writeToDisk: true },
            static: [
                { directory: path.resolve('dist'), publicPath: '/' },
                { directory: path.resolve('../mathjslab-markdown/example'), publicPath: '/lessons' },
            ],
            headers: {
                'Content-Security-Policy':
                    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:",
            },
        },
    }));
