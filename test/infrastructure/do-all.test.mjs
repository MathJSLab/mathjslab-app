import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const runner = path.join(root, 'script/do-all.mjs');
const stages = [
    'clean:all',
    'update',
    'install:browsers',
    'format:lint',
    'build:test-browser',
    'test:checks',
    'test:examples:run',
    'verify:hdl:assets:built',
    'test:browser:all:run',
    'measure:markdown',
    'git:all',
];

function fixture(t) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mathjslab-do-all-'));
    const calls = path.join(directory, 'calls.json');
    const publication = path.join(directory, 'published');
    const npm = path.join(directory, 'npm.cjs');
    fs.writeFileSync(
        npm,
        `
const fs = require('node:fs');
const script = process.argv[3];
const calls = fs.existsSync(process.env.PIPELINE_TEST_CALLS) ? JSON.parse(fs.readFileSync(process.env.PIPELINE_TEST_CALLS)) : [];
calls.push(script);
fs.writeFileSync(process.env.PIPELINE_TEST_CALLS, JSON.stringify(calls));
if (script === process.env.PIPELINE_TEST_FAIL) process.exit(42);
if (script === 'git:all') fs.writeFileSync(process.env.PIPELINE_TEST_PUBLICATION, 'published');
`,
    );
    t.after(() => {
        const resolved = path.resolve(directory);
        assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
        assert.ok(path.basename(resolved).startsWith('mathjslab-do-all-'));
        fs.rmSync(resolved, { recursive: true, force: true });
    });
    const execute = ({ args = [], fail = '' } = {}) =>
        spawnSync(process.execPath, [runner, ...args], {
            cwd: directory,
            encoding: 'utf8',
            env: { ...process.env, npm_execpath: npm, PIPELINE_TEST_CALLS: calls, PIPELINE_TEST_PUBLICATION: publication, PIPELINE_TEST_FAIL: fail },
        });
    return { execute, calls: () => (fs.existsSync(calls) ? JSON.parse(fs.readFileSync(calls, 'utf8')) : []), published: () => fs.existsSync(publication) };
}

test('do:all reaches Git publication only after every preparation and verification stage', (t) => {
    const workflow = fixture(t);
    const result = workflow.execute();
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(workflow.calls(), stages);
    assert.equal(workflow.published(), true);
});

test('a failure in any prerequisite stops the workflow and prevents Git publication', (t) => {
    for (const stage of stages.slice(0, -1)) {
        const workflow = fixture(t);
        const result = workflow.execute({ fail: stage });
        assert.equal(result.status, 42, stage + ': ' + result.stderr);
        assert.deepEqual(workflow.calls(), stages.slice(0, stages.indexOf(stage) + 1));
        assert.equal(workflow.published(), false, stage);
        assert.match(result.stderr, new RegExp(`Workflow stopped at ${stage}`));
        assert.match(result.stdout, /Elapsed:/);
    }
});

test('dry-run prints the ordered plan without executing npm or publishing', (t) => {
    const workflow = fixture(t);
    const result = workflow.execute({ args: ['--dry-run'] });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(workflow.calls(), []);
    assert.equal(workflow.published(), false);
    for (const stage of stages) assert.ok(result.stdout.includes(`npm run ${stage} (dry run)`));
});

test('unknown options are rejected before any update or publication', (t) => {
    const workflow = fixture(t);
    const result = workflow.execute({ args: ['--skip-tests'] });
    assert.equal(result.status, 1);
    assert.deepEqual(workflow.calls(), []);
    assert.equal(workflow.published(), false);
});

test('npm entry points reuse prepared artifacts and keep copy cleanup before dependency removal', () => {
    const { scripts } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    assert.equal(scripts['do:all'], 'node script/do-all.mjs');
    assert.ok(scripts['clean:all'].indexOf('clean:copy') < scripts['clean:all'].indexOf('clean:package-lock'));
    assert.equal(scripts.test, 'npm run test:checks');
    assert.ok(scripts['test:checks'].includes('npm run test:examples:coverage'));
    assert.equal(scripts['test:examples:coverage'], 'node script/check-markdown-examples.mjs');
    assert.equal(scripts['test:examples:run'], 'node script/test-examples.mjs');
    assert.match(scripts['test:browser:all:run'], /MARKDOWN_BROWSER_PROJECTS=all.*playwright test.*--workers=1.*--retries=0/);
    for (const stage of ['test:checks', 'test:examples:run', 'test:browser:all:run', 'measure:markdown', 'verify:hdl:assets:built']) {
        assert.ok(scripts[stage], stage);
        assert.equal(scripts[`pre${stage}`], undefined, `${stage} must not rebuild the artifacts under test`);
    }
});

test('dependency cleanup survives removal of synchronized helpers and requires no installed packages', (t) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mathjslab-do-all-'));
    t.after(() => {
        assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
        assert.ok(path.basename(directory).startsWith('mathjslab-do-all-'));
        fs.rmSync(directory, { recursive: true, force: true });
    });
    const { scripts } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const relativeScript = scripts['clean:package-lock'].replace(/^node /, '');
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'copy.repo.config.json'), 'utf8'));
    const synchronized = manifest.files.map((entry) => (typeof entry === 'string' ? entry : (entry.dest ?? entry.src)));
    assert.ok(!synchronized.includes(relativeScript), 'cleanup must remain app-owned');
    const script = path.join(directory, relativeScript);
    fs.mkdirSync(path.dirname(script), { recursive: true });
    fs.copyFileSync(path.join(root, relativeScript), script);
    fs.mkdirSync(path.join(directory, 'script/helper'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'script/helper/clean-package-lock.cjs'), 'throw new Error("obsolete helper");');
    fs.mkdirSync(path.join(directory, 'node_modules/nested'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'node_modules/nested/package.json'), '{}');
    fs.writeFileSync(path.join(directory, 'package-lock.json'), '{}');
    fs.writeFileSync(path.join(directory, 'package.json'), '{"name":"preserve-me"}');
    // Replay clean:copy removing its helper before invoking the real final step.
    fs.rmSync(path.join(directory, 'script/helper/clean-package-lock.cjs'));
    for (let attempt = 0; attempt < 2; attempt++) {
        const result = spawnSync(process.execPath, [script], { cwd: os.tmpdir(), encoding: 'utf8' });
        assert.equal(result.status, 0, result.stderr);
        assert.equal(fs.existsSync(path.join(directory, 'node_modules')), false);
        assert.equal(fs.existsSync(path.join(directory, 'package-lock.json')), false);
        assert.equal(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'), '{"name":"preserve-me"}');
        assert.equal(fs.existsSync(script), true);
    }
});

test('browser observation Worker prepares generated application JSON before TypeScript compilation', () => {
    const { scripts } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    assert.equal(scripts['prebuild:markdown-test-worker'], 'npm run build:eleventy && npm run build:assets');
    assert.ok(scripts['build:test-browser'].includes('npm run build:markdown-test-worker'));
    assert.ok(fs.existsSync(path.join(root, 'src/build-configuration.json.njk')));
    assert.match(fs.readFileSync(path.join(root, 'script/helper/example-assets.cjs'), 'utf8'), /first-example\.json/);
});
