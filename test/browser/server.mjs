import { createRequire } from 'node:module';
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const kernelLibrary = dirname(require.resolve('mathjslab'));
const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm',
};

/** Shared by Playwright and the manual fixture server; uses installed packages. */
export async function createBrowserTestServer({ port = 4173 } = {}) {
    const server = createServer((request, response) => {
        try {
            const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
            const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
            if (relative === 'test/browser/fixtures/security-redirect.png') {
                response.writeHead(302, { Location: 'https://outside.test/redirected.png', 'Cache-Control': 'no-store' });
                response.end();
                return;
            }
            const isKernel = relative.startsWith('test/mathjslab-lib/');
            const base = isKernel ? kernelLibrary : root;
            let filename = resolve(base, isKernel ? relative.slice('test/mathjslab-lib/'.length) : relative || 'test/browser/fixtures/index.html');
            if (filename !== base && !filename.startsWith(`${base}${sep}`)) throw new Error('Path outside test root');
            if (statSync(filename).isDirectory()) filename = resolve(filename, 'index.html');
            if (!statSync(filename).isFile()) throw new Error('Not a fixture file');
            response.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': mimeTypes[extname(filename).toLowerCase()] ?? 'application/octet-stream' });
            createReadStream(filename)
                .on('error', () => response.destroy())
                .pipe(response);
        } catch {
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Not found');
        }
    });
    await new Promise((ready, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', ready);
    });
    return server;
}
