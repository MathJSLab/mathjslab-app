/** Run the prepared release gates without dependency updates, formatting or Git publication. */
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, openSync, closeSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
if (!process.env.npm_execpath || process.argv.length !== 2) throw new Error('Run npm run test:candidate without skip flags.');
const metadata = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
if (metadata.version !== lock.version || metadata.version !== lock.packages?.['']?.version) throw new Error('Package and lockfile release versions must match.');
if (!readFileSync(path.join(root, 'CHANGES.md'), 'utf8').replaceAll('\r\n', '\n').includes(`## ${metadata.version}\n`))
    throw new Error('Add the release version to CHANGES.md before validating.');
const digest = (value) => createHash('sha256').update(value).digest('hex');
const sources = () =>
    Object.fromEntries(
        execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' })
            .split('\0')
            .filter(Boolean)
            .sort()
            .map((name) => [name, existsSync(path.join(root, name)) ? digest(readFileSync(path.join(root, name))) : null]),
    );
const before = sources();
mkdirSync(path.join(root, 'test-results'), { recursive: true });
const directory = mkdtempSync(path.join(root, 'test-results/candidate-'));
const report = { startedAt: new Date().toISOString(), status: 'running', sourceFingerprint: digest(JSON.stringify(before)), steps: [] };
const save = () => writeFileSync(path.join(directory, 'report.json'), JSON.stringify(report, null, 2) + '\n', { flush: true });
const steps = [
    'build:test-browser',
    'test:checks',
    'test:examples:run',
    'verify:hdl:assets:built',
    'verify:runtime:distribution',
    'test:browser:all:run',
    'test:hdl:browser',
    'measure:markdown',
];
console.log(`Candidate report: ${directory}`);
try {
    for (const name of steps) {
        const step = { name, startedAt: new Date().toISOString(), status: 'running' };
        report.steps.push(step);
        save();
        console.log(`Checking ${name}...`);
        // Keep logs inspectable while expensive builds and browser matrices are running.
        const log = openSync(path.join(directory, name.replaceAll(':', '-') + '.log'), 'w');
        let result;
        try {
            result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', name], { cwd: root, stdio: ['ignore', log, log], windowsHide: true });
        } finally {
            closeSync(log);
        }
        step.exitCode = result.status;
        step.finishedAt = new Date().toISOString();
        step.status = result.status === 0 && !result.error ? 'passed' : 'failed';
        save();
        if (step.status !== 'passed') throw new Error(`${name} failed; see candidate log.`);
    }
    report.status = 'passed';
} catch (error) {
    report.status = 'failed';
    report.error = error.message;
    process.exitCode = 1;
} finally {
    const after = sources();
    report.sourceChanges = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((name) => before[name] !== after[name]);
    if (report.sourceChanges.length) {
        report.status = 'failed';
        report.error = 'Candidate validation changed source/document/configuration files.';
        process.exitCode = 1;
    }
    report.finishedAt = new Date().toISOString();
    save();
    console.log(`Candidate ${report.status}: ${path.join(directory, 'report.json')}`);
}
