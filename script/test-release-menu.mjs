import { chromium, expect } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { serveHDLApp } from '../test/browser/hdl-static-server.mjs';
const server = await serveHDLApp(path.resolve(process.env.HDL_APP_DIST ?? 'dist'));
const browser = await chromium.launch({ executablePath: process.env.HDL_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const manifest = JSON.parse(await readFile(new URL('../example/example.json', import.meta.url)));
const results = [],
    errors = [],
    network = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('request', (r) => network.push({ url: r.url(), method: r.method(), body: r.postData() }));
// This static host permits downloading the real public Markdown sources.
// HDL acceptance uses the stricter self-only server without this override.
await page.route('**/lab/*/index.html?*', async (route) => {
    const response = await route.fetch();
    const headers = response.headers();
    headers['content-security-policy'] = headers['content-security-policy'].replace("connect-src 'self'", "connect-src 'self' https://raw.githubusercontent.com");
    await route.fulfill({ response, headers });
});
let completed = false,
    failure;
try {
    for (const locale of ['pt', 'en', 'es']) {
        await page.goto(`${server.origin}/lab/${locale}/index.html?lang=${locale}`);
        await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 90000 });
        await page.locator('#examples label').click();
        await page.locator('#example-markdown').click();
        const menu = page.locator('.example-menu');
        await menu.getByRole('button', { name: manifest.markdown.children.electronics.caption[locale] }).click();
        await menu.getByRole('button', { name: manifest.markdown.children.electronics.children['digital-electronics'].caption[locale], exact: true }).click();
        const url = 'https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/digital-electronics/pt/README.md';
        await expect(page.locator('batch-code-editor textarea')).toHaveValue(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        await page.locator('#mathjslab-shell-run').click();
        const viewer = page.locator('markdown-document').last();
        await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 90000 });
        await expect(viewer).toContainText('Sumário preliminar');
        await viewer.getByRole('link', { name: 'Ler o Capítulo 1 — Introdução à Eletrônica Digital', exact: true }).click();
        await expect.poll(() => network.some((request) => request.url === url.replace('README.md', 'introduction-to-digital-electronics.md'))).toBe(true);
        await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 90000 });
        await expect(viewer).toContainText('Objetivos de aprendizagem', { timeout: 90000 });
        await expect(viewer.locator('.mermaid svg').first()).toBeVisible({ timeout: 60000 });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: `report/release-1.20-menu-${locale}.png` });
        await viewer.evaluate(async (element) => {
            await element.dispose();
            element.remove();
        });
        results.push({ locale, passed: true });
        console.log('PASS real menu, Portuguese contents, public chapter navigation and rendering', locale);
        await page.setViewportSize({ width: 1280, height: 900 });
    }
    expect(errors).toEqual([]);
    expect(network.every((r) => r.method === 'GET' && !r.body)).toBe(true);
    completed = true;
} catch (error) {
    failure = String(error.stack);
    throw error;
} finally {
    await mkdir('report', { recursive: true });
    await writeFile('report/release-1.20-menu.json', JSON.stringify({ completed, failure, browser: browser.version(), results, errors, network }, null, 2));
    await browser.close();
    await server.close();
}
