import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { serveHDLApp } from '../test/browser/hdl-static-server.mjs';
import { parseVCD } from 'mathjslab-markdown/extensions';

const mode = process.env.HDL_APP_MODE ?? 'production';
const server = process.env.HDL_APP_URL ? { origin: process.env.HDL_APP_URL, requests: [], close: async () => {} } : await serveHDLApp(path.resolve(process.env.HDL_APP_DIST ?? 'dist'), mode);
const executablePath = process.env.HDL_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const reportName = `hdl-${mode}-${path.basename(executablePath)}-${process.env.HDL_REPORT_SUFFIX ?? 'vhdl-simulation'}`;
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(30_000);
const network = [],
    errors = [],
    results = [],
    wasm = [],
    hosting = [],
    responsiveness = [];
let completed = false,
    failure;
page.on('request', (r) => network.push({ url: r.url(), method: r.method(), body: r.postData(), resourceType: r.resourceType() }));
page.on('pageerror', (e) => errors.push(String(e)));
page.on('response', (r) => {
    if (new URL(r.url()).pathname.endsWith('.wasm')) wasm.push({ url: r.url(), status: r.status(), mime: r.headers()['content-type'] });
});
await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.hdlWorkers = new Set();
    window.hdlTicks = 0;
    setInterval(() => window.hdlTicks++, 10);
    window.Worker = class extends NativeWorker {
        constructor(...args) {
            super(...args);
            this.hdl = String(args[0]).includes('/hdl/');
            if (this.hdl) window.hdlWorkers.add(this);
        }
        terminate() {
            window.hdlWorkers.delete(this);
            return super.terminate();
        }
    };
});
const check = (name) => {
    results.push({ name, passed: true });
    console.log('PASS', mode, name);
};
async function open(locale, lesson) {
    const url = `${server.origin}/lessons/${locale}/${lesson}.md`;
    const input = page.locator('command-prompt textarea').last();
    await input.fill(`markdown("${url}")`);
    await input.press('Enter');
    const viewer = page.locator(`markdown-document[src="${url}"]`).last();
    await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 120_000 });
    return viewer;
}
async function dispose(viewer) {
    await viewer.evaluate(async (element) => {
        await element.dispose();
        element.remove();
    });
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
}
async function step(block, time) {
    await block.locator('[data-hdl-action=step]').click();
    await expect(block).toHaveAttribute('data-hdl-time', String(time), { timeout: 60_000 });
    await expect(block.locator(':scope > .hdl-exports [data-hdl-export=json]')).toBeEnabled();
}
async function download(locator) {
    const pending = page.waitForEvent('download');
    await locator.click();
    const file = await pending;
    const stream = await file.createReadStream();
    const chunks = [];
    for await (const part of stream) chunks.push(part);
    return { name: file.suggestedFilename(), text: Buffer.concat(chunks).toString('utf8') };
}
async function recording(block) {
    return JSON.parse((await download(block.locator(':scope > .hdl-exports [data-hdl-export=json]'))).text);
}
async function synthesisExports(block, language, locale) {
    await expect(block.locator('.netlist svg').first()).toBeVisible({ timeout: 90_000 });
    await expect(block.locator('[role=alert]')).toHaveCount(0);
    const json = JSON.parse((await download(block.locator(':scope > .hdl-exports [data-hdl-export=json]'))).text);
    expect(json.language).toBe(language);
    expect(json.result.status).toBe('success');
    if (locale)
        await expect(block.locator(':scope > [data-hdl-status=success]')).toHaveText({ pt: 'Execução HDL concluída', en: 'HDL execution completed', es: 'Ejecución HDL completada' }[locale]);
    const details = block.locator(':scope > .hdl-log-details');
    await expect(details).toHaveCount(1);
    if (locale) await expect(details.locator('summary')).toHaveText({ pt: 'Logs e diagnósticos', en: 'Logs and diagnostics', es: 'Registros y diagnósticos' }[locale]);
    await expect(details).not.toHaveAttribute('open', '');
    expect(await details.locator('.hdl-logs').textContent()).not.toContain('\u001b');
    expect(
        await block.evaluate((element) => {
            const children = [...element.children];
            return children.indexOf(element.querySelector(':scope > .netlist')) < children.indexOf(element.querySelector(':scope > .hdl-log-details'));
        }),
    ).toBe(true);
    await details.locator('summary').click();
    await expect(details.locator('.hdl-logs')).toBeVisible();
    await details.locator('summary').click();
    const netlist = JSON.parse((await download(block.locator(':scope > .hdl-exports [data-hdl-export=netlist]'))).text);
    expect(netlist).toEqual(json.result.netlist);
    const module = netlist.netlist.modules[netlist.top];
    expect(Object.keys(module.cells).length).toBeGreaterThan(0);
    const svg = block.locator('.netlist svg').first();
    await expect(block.getByRole('img', { name: `Netlist schematic: ${netlist.top}` })).toBeVisible();
    await expect(svg).toHaveAttribute('aria-label', `Netlist schematic: ${netlist.top}`);
    for (const port of Object.keys(module.ports)) expect(await svg.textContent()).toContain(port);
    expect((await download(block.locator('[data-hdl-export=svg]').first())).text).toContain('<svg');
    const txt = await download(block.locator(':scope > .hdl-exports [data-hdl-export=txt]'));
    expect(txt.text).toBe(json.result.logs);
    expect(txt.text).not.toContain('\u001b');
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    return json;
}
try {
    for (const locale of process.env.HDL_APP_FOCUS === 'custom' ? [] : ['pt', 'en', 'es']) {
        const response = await page.goto(`${server.origin}/lab/${locale}/index.html?lang=${locale}`);
        hosting.push({
            ...(await page.evaluate(() => ({ url: location.href, crossOriginIsolated }))),
            coop: response.headers()['cross-origin-opener-policy'],
            coep: response.headers()['cross-origin-embedder-policy'],
        });
        await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 90_000 });
        const source = await open(locale, 'codigo-hdl');
        await expect(source.locator('code .hljs-keyword').first()).toBeVisible();
        await expect(source.locator('[data-hdl-action]')).toHaveCount(0);
        await dispose(source);
        check(`${locale}/codigo-hdl`);
        for (const lesson of ['hdl-porta-and', 'hdl-contador', 'hdl-multiplexador', 'hdl-somador']) {
            const viewer = await open(locale, lesson);
            const blocks = viewer.locator('[data-markdown-extension=hdl]');
            await expect(blocks).toHaveCount(2);
            const vhdl = blocks.nth(0),
                verilog = blocks.nth(1);
            await vhdl.scrollIntoViewIfNeeded();
            if (['hdl-multiplexador', 'hdl-somador'].includes(lesson)) {
                const before = await page.evaluate(() => window.hdlTicks);
                await synthesisExports(vhdl, 'vhdl', locale);
                const after = await page.evaluate(() => window.hdlTicks);
                expect(after).toBeGreaterThan(before);
                responsiveness.push({ locale, lesson, before, after });
                await page.setViewportSize({ width: 390, height: 844 });
                await vhdl.scrollIntoViewIfNeeded();
                await expect(vhdl.locator('.netlist svg')).toBeVisible();
                expect((await vhdl.locator('.netlist svg').boundingBox()).width).toBeLessThanOrEqual(390);
                await vhdl.locator('.netlist svg').scrollIntoViewIfNeeded();
                if (locale === 'pt') await page.screenshot({ path: `report/${reportName}-${lesson}-narrow.png` });
                await page.setViewportSize({ width: 1280, height: 900 });
                check(`${locale}/${lesson}: actual VHDL-2008 synthesis, netlist inspection, JSON/TXT/netlist/SVG exports and narrow layout`);
            } else {
                await expect(vhdl.locator('.vcd-viewer svg')).toBeVisible({ timeout: 90_000 });
                const saved = JSON.parse((await download(vhdl.locator(':scope > .hdl-exports [data-hdl-export=json]'))).text);
                expect(saved.result.status).toBe('success');
                expect(saved.result.vcd).toContain('$enddefinitions');
                expect((await download(vhdl.locator('[data-hdl-export=vcd]'))).text).toBe(saved.result.vcd);
                expect((await download(vhdl.locator('[data-hdl-export=csv]'))).text.length).toBeGreaterThan(10);
                expect((await download(vhdl.locator('[data-hdl-export=svg]'))).text).toContain('<svg');
                expect((await download(vhdl.locator(':scope > .hdl-exports [data-hdl-export=txt]'))).text).toBe(saved.result.logs);
                check(`${locale}/${lesson}: real VHDL simulation and VCD/CSV/SVG/JSON/TXT exports`);
            }
            await verilog.scrollIntoViewIfNeeded();
            await expect(verilog.locator('.vcd-viewer svg, .netlist svg').first()).toBeVisible({ timeout: 90_000 });
            await expect(verilog.locator('[role=alert]')).toHaveCount(0);
            const json = JSON.parse((await download(verilog.locator(':scope > .hdl-exports [data-hdl-export=json]'))).text);
            expect(json.result.status).toBe('success');
            if (json.result.vcd) {
                expect((await download(verilog.locator('.vcd-viewer [data-hdl-export=vcd]'))).text).toBe(json.result.vcd);
                expect((await download(verilog.locator('.vcd-viewer [data-hdl-export=csv]'))).text.length).toBeGreaterThan(10);
            } else {
                const netlist = JSON.parse((await download(verilog.locator(':scope > .hdl-exports [data-hdl-export=netlist]'))).text);
                expect(netlist.netlist.modules[netlist.top].ports).toBeTruthy();
            }
            expect((await download(verilog.locator('[data-hdl-export=svg]').first())).text).toContain('<svg');
            await dispose(viewer);
            check(`${locale}/${lesson}: Verilog results/exports`);
        }
        for (const lesson of ['hdl-live-and', 'hdl-live-mux', 'hdl-live-counter', 'hdl-live-register', 'hdl-stimuli-checks']) {
            const viewer = await open(locale, lesson);
            const blocks = viewer.locator('[data-markdown-extension=hdl-interactive]');
            await expect(blocks).toHaveCount(2);
            for (const [index, language] of [
                [0, 'vhdl'],
                [1, 'verilog'],
            ]) {
                const block = blocks.nth(index);
                await block.scrollIntoViewIfNeeded();
                const scripted = lesson === 'hdl-stimuli-checks';
                await step(block, scripted ? 7 : 10);
                if (!scripted) {
                    if (lesson === 'hdl-live-and') {
                        await block.getByLabel('a', { exact: true }).selectOption('1');
                        await block.getByLabel('b', { exact: true }).selectOption('1');
                    }
                    if (lesson === 'hdl-live-mux') await block.getByLabel('s', { exact: true }).selectOption('1');
                    if (lesson === 'hdl-live-counter') await block.getByLabel('rst', { exact: true }).selectOption('0');
                    if (lesson === 'hdl-live-register') {
                        await block.getByLabel('d', { exact: true }).fill('1010');
                        await block.getByLabel('enable', { exact: true }).selectOption('0');
                    }
                }
                await step(block, scripted ? 12 : 20);
                const saved = await recording(block);
                expect(saved.history).toHaveLength(2);
                if (lesson === 'hdl-live-and') expect(saved.result.values.y).toBe('1');
                if (lesson === 'hdl-live-mux') expect(saved.result.values.y).toBe('1010');
                if (lesson === 'hdl-live-counter') expect(saved.result.values.q).toBe('0001');
                if (lesson === 'hdl-live-register') expect(saved.result.values.q).toBe('0101');
                if (scripted) {
                    await expect(block.locator('.hdl-checks [data-status=failed]')).toHaveCount(0);
                    expect(await block.locator('.hdl-checks [data-status=passed]').count()).toBeGreaterThan(0);
                }
                const waves = block.locator('.vcd-viewer');
                await waves.locator('input[type=number]').nth(2).fill('0');
                await waves.locator('input[type=number]').nth(2).dispatchEvent('input');
                await expect(waves.locator('.vcd-values')).not.toBeEmpty();
                for (const format of ['vcd', 'csv', 'svg', 'txt']) {
                    const artifact = await download((format === 'txt' ? block.locator(':scope > .hdl-exports') : waves).locator(`[data-hdl-export=${format}]`));
                    expect(artifact.name).toMatch(new RegExp(`\\.${format}$`));
                    if (format === 'vcd') expect(artifact.text).toBe(saved.result.vcd);
                    if (format === 'svg') expect(artifact.text).toContain('<svg');
                }
                if (lesson === 'hdl-live-and') {
                    await block.getByLabel('a', { exact: true }).selectOption('x');
                    await step(block, 30);
                    expect((await recording(block)).result.values.y).toBe('x');
                    await block.getByLabel('a', { exact: true }).selectOption('z');
                    await step(block, 40);
                    expect((await recording(block)).result.values.y).toBe('x');
                }
                await block.locator('[data-hdl-action=reset]').click();
                await expect(block).toHaveAttribute('data-hdl-time', '0');
                await expect(block.locator('[data-hdl-action=step]')).toBeEnabled();
                expect((await recording(block)).history).toHaveLength(0);
                await block.locator('[data-hdl-action=run]').click();
                await expect.poll(async () => Number(await block.getAttribute('data-hdl-time'))).toBeGreaterThan(0);
                if (scripted) await expect(block).toHaveAttribute('data-hdl-time', '12', { timeout: 60_000 });
                else await block.locator('[data-hdl-action=pause]').click();
                await expect(block.locator('[data-hdl-action=pause]')).toBeDisabled({ timeout: 60_000 });
                // Pause lets an already submitted step finish before becoming stable.
                await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
                const paused = await block.getAttribute('data-hdl-time');
                await page.waitForTimeout(150);
                expect(await block.getAttribute('data-hdl-time')).toBe(paused);
                await block.locator('[data-hdl-action=reset]').click();
                await expect(block).toHaveAttribute('data-hdl-time', '0');
                if (locale === 'pt' && lesson === 'hdl-live-counter') await page.screenshot({ path: `report/${reportName}-counter.png`, fullPage: true });
                check(`${locale}/${lesson}/${language}: inputs/clocks/history/checks/inspection/exports/reset/run/pause`);
            }
            await dispose(viewer);
        }
    }
    if (process.env.HDL_APP_FOCUS === 'custom') {
        await page.goto(`${server.origin}/lab/en/index.html?lang=en`);
        await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 90_000 });
    }
    // New VHDL sources run through the app's actual configured component/engine.
    const opened = await open('en', 'hdl-multiplexador');
    await opened.evaluate((element) => {
        element.id = 'hdl-validation-vhdl';
    });
    const vhdlViewer = page.locator('#hdl-validation-vhdl');
    const arithmetic = {
        operation: 'synthesize',
        standard: '08',
        top: 'APP_ARITHMETIC',
        files: [
            {
                name: 'app_arithmetic.vhd',
                source: [
                    'library ieee;',
                    'use ieee.std_logic_1164.all;',
                    'use ieee.numeric_std.all;',
                    'entity App_Arithmetic is port(a,b: in unsigned(3 downto 0); y: out unsigned(5 downto 0)); end;',
                    'architecture rtl of App_Arithmetic is begin',
                    'y <= resize(a,6) + shift_left(resize(b,6),1) + to_unsigned(5,6);',
                    'end;',
                ].join('\n'),
            },
        ],
    };
    const setVHDL = (request) =>
        vhdlViewer.evaluate(async (element, request) => {
            element.removeAttribute('src');
            element.markdown = '```vhdl-run\n' + JSON.stringify(request) + '\n```';
            await element.reload();
        }, request);
    await setVHDL(arithmetic);
    let synthesized = await synthesisExports(vhdlViewer.locator('[data-markdown-extension=hdl]'), 'vhdl');
    expect(synthesized.result.netlist.top).toBe('App_Arithmetic');
    let cells = Object.values(synthesized.result.netlist.netlist.modules.App_Arithmetic.cells);
    expect(cells.some((cell) => cell.type === '$add')).toBe(true);
    expect(cells.some((cell) => /app_arithmetic\.vhd/.test(cell.attributes?.src ?? ''))).toBe(true);
    check('new VHDL numeric_std resize/shift_left/to_unsigned arithmetic and original source locations (synthesis only)');
    await setVHDL({
        ...arithmetic,
        top: 'app_package_user',
        files: [
            { name: 'app_delta.vhd', source: 'package app_delta is constant increment:natural:=7;end;' },
            {
                name: 'app_package_user.vhd',
                source: 'library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;use work.app_delta.all;entity app_package_user is port(a:in unsigned(5 downto 0);y:out unsigned(5 downto 0));end;architecture rtl of app_package_user is begin y<=a+increment;end;',
            },
        ],
    });
    synthesized = await synthesisExports(vhdlViewer.locator('[data-markdown-extension=hdl]'), 'vhdl');
    expect(synthesized.result.netlist.netlist.modules.app_package_user.ports.y.bits.length).toBe(6);
    check('new two-file VHDL numeric_std package synthesized through app');
    for (const [name, source, line] of [
        ['app_syntax.vhd', 'entity app_broken is\nport(\nwhat is this\n);end;', 3],
        [
            'app_semantic.vhd',
            'library ieee;\nuse ieee.std_logic_1164.all;\nentity app_broken is port(y:out std_logic);end;\narchitecture rtl of app_broken is begin\ny<=missing_app_signal;\nend;',
            5,
        ],
    ]) {
        await setVHDL({ ...arithmetic, top: 'app_broken', files: [{ name, source }] });
        const block = vhdlViewer.locator('[data-markdown-extension=hdl]');
        await block.scrollIntoViewIfNeeded();
        await expect(block.locator('[role=alert]')).toBeVisible({ timeout: 60_000 });
        const exported = JSON.parse((await download(block.locator(':scope > .hdl-exports [data-hdl-export=json]'))).text);
        expect(exported.result.status).toBe('error');
        expect(exported.result.diagnostics.some((diagnostic) => diagnostic.file === name && diagnostic.line === line)).toBe(true);
        await expect(block).toContainText(`${name}:${line}`);
        await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
        check(`real VHDL diagnostic and exported original file/line: ${name}:${line}`);
    }
    await vhdlViewer.evaluate(async (element) => {
        element.context = { executionPolicy: { hdl: { enabled: false } } };
        await element.reload();
    });
    await setVHDL({ ...arithmetic, executionPolicy: { hdl: { enabled: true } } });
    await expect(vhdlViewer.locator('[role=alert]')).toBeVisible();
    await expect(vhdlViewer.locator('.netlist svg')).toHaveCount(0);
    expect(await page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    check('document denial blocks real VHDL synthesis; Markdown cannot grant authorization');
    await vhdlViewer.evaluate((element) => {
        element.context = { executionPolicy: { hdl: { enabled: true } } };
    });
    const startVHDL = async () => {
        await vhdlViewer.evaluate((element, request) => {
            element.removeAttribute('src');
            element.markdown = '```vhdl-run\n' + JSON.stringify(request) + '\n```';
            window.hdlPendingReload = element.reload();
        }, arithmetic);
        await vhdlViewer.locator('[data-markdown-extension=hdl]').scrollIntoViewIfNeeded();
        await expect.poll(() => page.evaluate(() => window.hdlWorkers.size), { intervals: [10, 20, 50] }).toBeGreaterThan(0);
    };
    await startVHDL();
    await setVHDL({ ...arithmetic, operation: 'simulate' });
    await expect(vhdlViewer.locator('.vcd-viewer svg, [role=alert]').first()).toBeVisible({ timeout: 60_000 });
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    await page.evaluate(() => window.hdlPendingReload);
    check('replacing active VHDL synthesis with simulation terminates prior Worker');
    await startVHDL();
    await vhdlViewer.evaluate(async (element, url) => {
        element.markdown = undefined;
        element.src = url;
        await element.reload();
    }, `${server.origin}/lessons/en/codigo-hdl.md`);
    await expect(vhdlViewer).toHaveAttribute('state', 'ready');
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    await dispose(vhdlViewer);
    check('navigating away from active VHDL synthesis releases its Worker');
    // Exercise the NVC path through the app, not a separate executor harness.
    const novelVHDL = await open('en', 'hdl-live-and');
    await novelVHDL.evaluate((element) => {
        element.id = 'hdl-validation-nvc';
    });
    const nvc = page.locator('#hdl-validation-nvc');
    const setNVC = (request, fence = 'vhdl-live') =>
        nvc.evaluate(
            async (element, { request, fence }) => {
                element.removeAttribute('src');
                element.markdown = '```' + fence + '\n' + JSON.stringify(request) + '\n```';
                await element.reload();
            },
            { request, fence },
        );
    await setNVC(
        {
            operation: 'simulate',
            standard: '08',
            top: 'app_numeric_tb',
            stopTimeNs: 137,
            files: [
                {
                    name: 'app_numeric_tb.vhd',
                    source: 'library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity app_numeric_tb is end;architecture test of app_numeric_tb is signal a:unsigned(4 downto 0):=to_unsigned(3,5);signal y:unsigned(4 downto 0);begin y<=shift_left(a,1)+to_unsigned(7,5);process begin wait for 37 ns;assert y=to_unsigned(13,5) report "app arithmetic mismatch" severity failure;report "app arithmetic passed";wait;end process;end;',
                },
            ],
        },
        'vhdl-run',
    );
    let nvcBatch = nvc.locator('[data-markdown-extension=hdl]');
    await expect(nvcBatch.locator('.vcd-viewer svg')).toBeVisible({ timeout: 60_000 });
    let batchResult = JSON.parse((await download(nvcBatch.locator(':scope > .hdl-exports [data-hdl-export=json]'))).text).result;
    expect(batchResult.status).toBe('success');
    expect(batchResult.logs).toContain('app arithmetic passed');
    const arithmeticTrace = parseVCD(batchResult.vcd);
    expect(
        arithmeticTrace.signals
            .find((signal) => /\.y(?:\[.*\])?$/.test(signal.name))
            .changes.at(-1)
            .value.padStart(5, '0'),
    ).toBe('01101');
    check('new numeric_std VHDL testbench: real source simulation, assertion and waveform');
    await setNVC(
        { operation: 'simulate', standard: '08', top: 'app_invalid', files: [{ name: 'app_invalid.vhd', source: 'entity app_invalid is\nport(\nwhat is this\n);end;' }] },
        'vhdl-run',
    );
    nvcBatch = nvc.locator('[data-markdown-extension=hdl]');
    await expect(nvcBatch.locator('[role=alert]')).toBeVisible({ timeout: 60_000 });
    batchResult = JSON.parse((await download(nvcBatch.locator(':scope > .hdl-exports [data-hdl-export=json]'))).text).result;
    expect(batchResult.status).toBe('error');
    expect(batchResult.diagnostics.some((diagnostic) => diagnostic.file === 'app_invalid.vhd' && diagnostic.line === 3)).toBe(true);
    check('NVC syntax diagnostics retain original app_invalid.vhd:3');
    await setNVC(
        {
            operation: 'simulate',
            standard: '08',
            top: 'app_empty',
            stopTimeNs: 3,
            files: [
                {
                    name: 'app_empty.vhd',
                    source: 'entity app_empty is end;architecture test of app_empty is begin process begin wait for 1 ns;report "empty app trace";wait;end process;end;',
                },
            ],
        },
        'vhdl-run',
    );
    nvcBatch = nvc.locator('[data-markdown-extension=hdl]');
    await expect(nvcBatch.locator(':scope > .hdl-exports [data-hdl-export=json]')).toBeEnabled({ timeout: 60_000 });
    batchResult = JSON.parse((await download(nvcBatch.locator(':scope > .hdl-exports [data-hdl-export=json]'))).text).result;
    expect(batchResult.status).toBe('success');
    expect(batchResult.logs).toContain('empty app trace');
    const emptyTrace = parseVCD(batchResult.vcd);
    expect(emptyTrace.signals).toEqual([]);
    expect(emptyTrace.endTime * emptyTrace.timescale.magnitude * { fs: 1e-6, ps: 1e-3, ns: 1, us: 1e3, ms: 1e6, s: 1e9 }[emptyTrace.timescale.unit]).toBeCloseTo(1);
    await expect(nvcBatch.locator('[role=alert]')).toHaveCount(0);
    results.push({ name: 'real NVC signal-free VCD preserves its verified 1 ns endpoint without invented signals', passed: true, result: batchResult });
    const buffer = {
        top: 'app_buffer',
        standard: '08',
        files: [
            {
                name: 'app_buffer.vhd',
                source: 'library ieee;use ieee.std_logic_1164.all;entity app_buffer is port(a:in std_logic_vector(3 downto 0);y:out std_logic_vector(3 downto 0));end;architecture rtl of app_buffer is begin y<=a;end;',
            },
        ],
        inputs: [{ name: 'a', width: 4, initial: 'xz10' }],
        outputs: [{ name: 'y', width: 4 }],
        stepNs: 7,
    };
    await setNVC(buffer);
    let nvcBlock = nvc.locator('[data-markdown-extension=hdl-interactive]');
    for (const time of [7, 14]) {
        await step(nvcBlock, time);
        const saved = await recording(nvcBlock);
        expect(saved.result.values.y).toBe('xz10');
        const trace = parseVCD(saved.result.vcd);
        expect(trace.endTime * trace.timescale.magnitude * { fs: 1e-6, ps: 1e-3, ns: 1, us: 1e3, ms: 1e6, s: 1e9 }[trace.timescale.unit]).toBeCloseTo(time);
        expect(trace.signals.find((signal) => /\.y(?:\[.*\])?$/.test(signal.name)).changes.every((event) => event.time === 0)).toBe(true);
    }
    check('new VHDL four-state buffer: stable replay endpoints and history without invented transitions');
    for (const half of [10, 10000]) {
        await setNVC({
            top: 'app_boundary',
            standard: '08',
            inputs: [],
            outputs: [{ name: 'q', width: 3 }],
            stepNs: half,
            files: [
                {
                    name: 'app_boundary.vhd',
                    source: `library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity app_boundary is port(q:out std_logic_vector(2 downto 0));end;architecture rtl of app_boundary is signal clk:std_logic:='0';signal n:unsigned(2 downto 0):=(others=>'0');begin clk<=not clk after ${half} ns;q<=std_logic_vector(n);process(clk)begin if rising_edge(clk)then n<=n+1;end if;end process;end;`,
                },
            ],
        });
        nvcBlock = nvc.locator('[data-markdown-extension=hdl-interactive]');
        for (const [index, expected] of ['001', '001', '010'].entries()) {
            await step(nvcBlock, half * (index + 1));
            const saved = await recording(nvcBlock);
            expect(saved.result.values.q).toBe(expected);
            expect(saved.history).toHaveLength(index + 1);
            const trace = parseVCD(saved.result.vcd);
            expect(trace.endTime * trace.timescale.magnitude * { fs: 1e-6, ps: 1e-3, ns: 1, us: 1e3, ms: 1e6, s: 1e9 }[trace.timescale.unit]).toBeCloseTo(half * (index + 1));
        }
        check(`new VHDL clock/delta endpoint and numeric_std sequential replay at ${half}/${half * 2}/${half * 3} ns`);
    }
    // A real non-suspending VHDL process must be terminated on reset/replacement/navigation.
    const busy = {
        ...buffer,
        top: 'app_busy',
        files: [
            {
                name: 'app_busy.vhd',
                source: 'library ieee;use ieee.std_logic_1164.all;entity app_busy is port(a:in std_logic_vector(3 downto 0);y:out std_logic_vector(3 downto 0));end;architecture rtl of app_busy is begin y<=a;process begin loop null;end loop;end process;end;',
            },
        ],
    };
    await setNVC(busy);
    nvcBlock = nvc.locator('[data-markdown-extension=hdl-interactive]');
    await nvcBlock.locator('[data-hdl-action=step]').click();
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBeGreaterThan(0);
    await nvcBlock.locator('[data-hdl-action=reset]').click();
    await expect(nvcBlock).toHaveAttribute('data-hdl-time', '0');
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    expect((await recording(nvcBlock)).history).toHaveLength(0);
    await nvcBlock.locator('[data-hdl-action=step]').click();
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBeGreaterThan(0);
    await setNVC(buffer);
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    await step(nvc.locator('[data-markdown-extension=hdl-interactive]'), 7);
    await nvc.evaluate(async (element) => {
        element.context = { executionPolicy: { 'hdl-interactive': { enabled: false } } };
        await element.reload();
    });
    await expect(nvc.locator('[data-hdl-action]')).toHaveCount(0);
    await expect(nvc.locator('[role=alert]')).toBeVisible();
    await nvc.evaluate((element) => {
        element.context = { executionPolicy: { 'hdl-interactive': { enabled: true } } };
    });
    await setNVC(busy);
    await nvc.locator('[data-hdl-action=step]').click();
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBeGreaterThan(0);
    await nvc.evaluate(async (element, url) => {
        element.markdown = undefined;
        element.src = url;
        await element.reload();
    }, `${server.origin}/lessons/en/codigo-hdl.md`);
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    await dispose(nvc);
    check('active NVC reset, replacement, policy denial and content navigation terminate Workers');
    // Replace content while an actual Worker is busy, then deny document authorization.
    const custom = await open('en', 'hdl-live-and');
    await custom.evaluate((element) => {
        element.id = 'hdl-validation-custom';
    });
    const viewer = page.locator('#hdl-validation-custom');
    const request = {
        top: 'novel',
        files: [{ name: 'novel.sv', source: 'module novel(input a,input b,output y);assign y=a^b;endmodule' }],
        inputs: [
            { name: 'a', width: 1, initial: '1' },
            { name: 'b', width: 1, initial: '0' },
        ],
        outputs: [{ name: 'y', width: 1 }],
        stepNs: 7,
    };
    const replace = async (data) =>
        viewer.evaluate(async (element, data) => {
            element.removeAttribute('src');
            element.markdown = '```verilog-live\n' + JSON.stringify(data) + '\n```';
            await element.reload();
        }, data);
    await replace(request);
    let block = viewer.locator('[data-markdown-extension=hdl-interactive]');
    await step(block, 7);
    expect((await recording(block)).result.values.y).toBe('1');
    await step(block, 14);
    const stable = await recording(block);
    expect(stable.history).toHaveLength(2);
    const model = parseVCD(stable.result.vcd);
    const unitNs = { s: 1e9, ms: 1e6, us: 1e3, ns: 1, ps: 1e-3, fs: 1e-6 }[model.timescale.unit];
    expect(model.endTime * model.timescale.magnitude * unitNs).toBeCloseTo(14);
    expect(model.signals.find((s) => s.name === 'markdown_replay.y').changes.every((change) => change.time === 0)).toBe(true);
    check('novel XOR source and stable replay');
    await replace({
        top: 'buffer4',
        files: [{ name: 'buffer4.v', source: 'module buffer4(input [3:0] a,output [3:0] y);assign y=a;endmodule' }],
        inputs: [{ name: 'a', width: 4, initial: 'xz10' }],
        outputs: [{ name: 'y', width: 4 }],
        stepNs: 7,
    });
    block = viewer.locator('[data-markdown-extension=hdl-interactive]');
    await step(block, 7);
    expect((await recording(block)).result.values.y).toBe('xz10');
    await step(block, 14);
    expect((await recording(block)).result.values.y).toBe('xz10');
    check('novel four-state bus preserves 0/1/x/z');
    await viewer.evaluate(async (element) => {
        element.markdown =
            '```verilog-run\n' +
            JSON.stringify({ operation: 'synthesize', top: 'novel_nand', files: [{ name: 'nand.v', source: 'module novel_nand(input a,input b,output y);assign y=~(a&b);endmodule' }] }) +
            '\n```';
        await element.reload();
    });
    await expect(viewer.locator('.netlist svg')).toBeVisible({ timeout: 90_000 });
    const synthesis = JSON.parse((await download(viewer.locator(':scope [data-markdown-extension=hdl] > .hdl-exports [data-hdl-export=json]'))).text);
    expect(synthesis.result.status).toBe('success');
    expect(Object.keys(synthesis.result.netlist.netlist.modules.novel_nand.cells).length).toBeGreaterThan(0);
    check('novel NAND synthesis through app');
    await replace({ ...request, files: [{ name: 'busy.sv', source: 'module novel(input a,input b,output y);assign y=a;initial forever begin end endmodule' }] });
    block = viewer.locator('[data-markdown-extension=hdl-interactive]');
    await block.locator('[data-hdl-action=step]').click();
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBeGreaterThan(0);
    await block.locator('[data-hdl-action=reset]').click();
    await expect(block).toHaveAttribute('data-hdl-time', '0');
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    await block.locator('[data-hdl-action=step]').click();
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBeGreaterThan(0);
    await replace(request);
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    await step(viewer.locator('[data-markdown-extension=hdl-interactive]'), 7);
    await viewer.evaluate(async (element) => {
        element.context = { executionPolicy: { hdl: { enabled: false }, 'hdl-interactive': { enabled: false } } };
        await element.reload();
    });
    await expect(viewer.locator('[data-hdl-action]')).toHaveCount(0);
    await expect(viewer.locator('[role=alert]')).toBeVisible();
    await dispose(viewer);
    check('replacement terminates active Worker; host document denial remains authoritative');
    const moving = await open('en', 'hdl-live-and');
    await moving.evaluate((element) => {
        element.id = 'hdl-validation-navigation';
    });
    const navigating = page.locator('#hdl-validation-navigation');
    const running = navigating.locator('[data-markdown-extension=hdl-interactive]').nth(1);
    await running.scrollIntoViewIfNeeded();
    await running.locator('[data-hdl-action=run]').click();
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBeGreaterThan(0);
    await navigating.evaluate(async (element, url) => {
        element.src = url;
        await element.reload();
    }, `${server.origin}/lessons/en/codigo-hdl.md`);
    await expect(navigating.locator('[data-hdl-action]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBe(0);
    await dispose(navigating);
    const leaving = await open('en', 'hdl-live-and');
    await leaving.locator('[data-markdown-extension=hdl-interactive]').nth(0).scrollIntoViewIfNeeded();
    await leaving.locator('[data-markdown-extension=hdl-interactive]').nth(0).locator('[data-hdl-action=run]').click();
    await expect.poll(() => page.evaluate(() => window.hdlWorkers.size)).toBeGreaterThan(0);
    await page.goto('about:blank');
    expect(page.workers()).toHaveLength(0);
    check('content navigation and page navigation release Workers');
    expect(errors).toEqual([]);
    expect(network.every((r) => r.method === 'GET' && !r.body)).toBe(true);
    // README logos/badges are image downloads (blocked by this harness's CSP),
    // not HDL source uploads or delegated processing. Keep them in the report.
    expect(network.filter((r) => new URL(r.url).origin !== server.origin && r.resourceType !== 'image')).toEqual([]);
    expect(wasm.length).toBeGreaterThan(0);
    expect(wasm.some((r) => new URL(r.url).pathname.endsWith('/ghdl/ghdl-synth.wasm'))).toBe(true);
    expect(network.some((r) => new URL(r.url).pathname.endsWith('/ghdl/libraries.tar.gz'))).toBe(true);
    expect(wasm.some((r) => new URL(r.url).pathname.endsWith('/nvc/nvc.wasm'))).toBe(true);
    expect(network.some((r) => new URL(r.url).pathname.endsWith('/nvc/libraries.tar.gz'))).toBe(true);
    expect(hosting.every((entry) => !entry.crossOriginIsolated && !entry.coop && !entry.coep)).toBe(true);
    for (const r of wasm) {
        expect(r.status).toBe(200);
        expect(r.mime).toBe('application/wasm');
        expect(new URL(r.url).pathname).toContain('/lab/hdl/');
    }
    check('GETs only; external resources limited to README images; local HDL Wasm/MIME/subdirectory/CSP without COOP/COEP');
    completed = true;
} catch (error) {
    failure = String(error?.stack ?? error);
    throw error;
} finally {
    await mkdir('report', { recursive: true });
    await writeFile(
        `report/${reportName}.json`,
        JSON.stringify({ browser: browser.version(), mode, completed, failure, results, errors, network, wasm, hosting, responsiveness, serverRequests: server.requests }, null, 2),
    );
    console.log(browser.version(), results.length, 'cases confirmed;', completed ? 'suite passed' : 'suite incomplete');
    await browser.close();
    await server.close();
}
