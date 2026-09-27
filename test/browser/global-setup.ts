import type { FullConfig } from '@playwright/test';
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
const mimeTypes: Readonly<Record<string, string>> = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm',
};

export default async function globalSetup(_config: FullConfig): Promise<() => Promise<void>> {
    const server = createServer((request, response) => {
        try {
            const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
            const relative = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '');
            let filename = resolve(root, relative || 'test/browser/fixtures/index.html');
            if (filename !== root && !filename.startsWith(`${root}${sep}`)) throw new Error('Path outside test root');
            if (statSync(filename).isDirectory()) filename = resolve(filename, 'index.html');
            response.writeHead(200, {
                'Cache-Control': 'no-store',
                'Content-Type': mimeTypes[extname(filename).toLowerCase()] ?? 'application/octet-stream',
            });
            createReadStream(filename).pipe(response);
        } catch {
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Not found');
        }
    });

    await new Promise<void>((resolveReady, reject) => {
        server.once('error', reject);
        server.listen(4173, '127.0.0.1', resolveReady);
    });

    return async () =>
        new Promise<void>((resolveClosed, reject) => {
            server.closeAllConnections();
            server.close((error) => (error ? reject(error) : resolveClosed()));
        });
}
