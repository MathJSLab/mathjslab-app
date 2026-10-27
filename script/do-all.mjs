import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { existsSync } from 'node:fs';

export const pipelineScripts = Object.freeze([
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
]);

const root = fileURLToPath(new URL('../', import.meta.url));

export function assertGitIndexAvailable(cwd = root) {
    // Git resolves linked-worktree metadata too; .git need not be a directory.
    const result = spawnSync('git', ['rev-parse', '--git-path', 'index.lock'], { cwd, encoding: 'utf8' });
    if (result.error || result.status !== 0) throw new Error(`Cannot inspect Git index: ${result.error?.message ?? result.stderr.trim()}`);
    const lock = path.resolve(cwd, result.stdout.trim());
    if (existsSync(lock)) {
        throw new Error(`Git index is locked: ${lock}. Finish any active Git operation; remove the lock manually only after confirming it is abandoned. No lock was removed.`);
    }
}

export function runPipeline({ dryRun = false, npmExecPath = process.env.npm_execpath, log = console.log, checkGit = assertGitIndexAvailable } = {}) {
    if (!dryRun && !npmExecPath) throw new Error('Run this workflow with npm run do:all.');
    if (!dryRun) checkGit();
    for (const [index, script] of pipelineScripts.entries()) {
        log(`[${index + 1}/${pipelineScripts.length}] npm run ${script}${dryRun ? ' (dry run)' : ''}`);
        if (dryRun) continue;
        if (script === 'git:all') checkGit();
        // Invoke npm through Node, without shell interpolation or Windows .cmd
        // dispatch. The runner survives removal of the local node_modules tree.
        const result = spawnSync(process.execPath, [npmExecPath, 'run', script], { cwd: root, stdio: 'inherit' });
        if (result.error || result.signal || result.status !== 0) {
            const reason = result.error?.message ?? (result.signal ? `signal ${result.signal}` : `exit ${result.status}`);
            const error = new Error(`Workflow stopped at ${script}: ${reason}`);
            error.exitCode = result.status > 0 ? result.status : 1;
            throw error;
        }
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const started = performance.now();
    try {
        const args = process.argv.slice(2);
        if (args.length > 1 || args.some((arg) => arg !== '--dry-run')) throw new Error('Usage: npm run do:all [-- --dry-run]');
        runPipeline({ dryRun: args.includes('--dry-run') });
        console.log(args.includes('--dry-run') ? 'Dry run completed; no stages were executed.' : 'Workflow completed successfully.');
    } catch (error) {
        console.error(error.message);
        process.exitCode = error.exitCode ?? 1;
    } finally {
        console.log(`Elapsed: ${((performance.now() - started) / 1000).toFixed(1)} seconds.`);
    }
}
