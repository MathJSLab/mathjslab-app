import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';

// File delivery only: no HDL routes, child processes, tokens or execution API.
export async function serveHDLApp(root = path.resolve('dist'), mode = 'production') {
    const requests = [];
    const lessons = path.resolve(process.env.HDL_LESSONS_DIR ?? '../mathjslab-markdown/example');
    const server = createServer((request, response) => {
        requests.push({ method: request.method, url: request.url });
        if (request.method !== 'GET') return void response.writeHead(405).end();
        try {
            const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
            const lesson = pathname.startsWith('/lessons/');
            const base = lesson ? lessons : root;
            const relative = lesson ? pathname.slice('/lessons/'.length) : pathname.replace(/^\/lab\//, '/').replace(/^\/+/, '');
            let filename = path.resolve(base, relative || 'index.html');
            if (!filename.startsWith(base + path.sep)) throw new Error('Outside root');
            if (statSync(filename).isDirectory()) filename = path.join(filename, 'index.html');
            response.setHeader(
                'Content-Type',
                {
                    '.js': 'text/javascript',
                    '.mjs': 'text/javascript',
                    '.wasm': 'application/wasm',
                    '.html': 'text/html',
                    '.css': 'text/css',
                    '.json': 'application/json',
                    '.svg': 'image/svg+xml',
                    '.md': 'text/markdown',
                }[path.extname(filename)] ?? 'application/octet-stream',
            );
            response.setHeader(
                'Content-Security-Policy',
                `default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' ${mode === 'development' ? "'unsafe-eval'" : ''}; worker-src 'self' blob:; connect-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:`,
            );
            createReadStream(filename)
                .on('error', () => response.destroy())
                .pipe(response);
        } catch {
            response.writeHead(404).end();
        }
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    return {
        origin: `http://127.0.0.1:${server.address().port}`,
        requests,
        close: () =>
            new Promise((resolve) => {
                server.closeAllConnections();
                server.close(resolve);
            }),
    };
}
