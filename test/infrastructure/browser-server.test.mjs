import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { createBrowserTestServer } from '../browser/server.mjs';

test('browser fixture server serves the installed kernel and handles missing resources without crashing', async (t) => {
    const server = await createBrowserTestServer({ port: 0 });
    t.after(async () => {
        server.closeAllConnections();
        await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const fixture = await fetch(`${origin}/test/browser/fixtures/index.html`);
    assert.equal(fixture.status, 200);
    assert.match(fixture.headers.get('content-type'), /^text\/html/);
    assert.match(await fixture.text(), /markdown-document/);
    const kernelFilename = 'mathjslab.runtime-browser.esm2022.js';
    const kernel = await fetch(`${origin}/test/mathjslab-lib/${kernelFilename}`);
    assert.equal(kernel.status, 200);
    const installedDirectory = dirname(createRequire(import.meta.url).resolve('mathjslab'));
    assert.equal(await kernel.text(), readFileSync(join(installedDirectory, kernelFilename), 'utf8'));
    for (const relative of ['/test/mathjslab-lib/missing.js', '/test/browser/fixtures/missing.md', '/%ZZ', '/test/mathjslab-lib/%2e%2e%2fpackage.json']) {
        assert.equal((await fetch(origin + relative)).status, 404, relative);
    }
    const redirect = await fetch(`${origin}/test/browser/fixtures/security-redirect.png`, { redirect: 'manual' });
    assert.equal(redirect.status, 302);
    assert.equal(redirect.headers.get('location'), 'https://outside.test/redirected.png');
    assert.equal((await fetch(`${origin}/`)).status, 200, 'The server remains usable after invalid requests.');
});
