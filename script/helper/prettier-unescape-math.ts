#!/usr/bin/env tsx
/**
 * prettier-unescape-math.ts
 *
 * Fixes improper insertion of backslashes (`\`) inside `%%...%%` and `%%%...%%%` blocks in Markdown files.
 *
 * Usage:
 *   tsx prettier-unescape-math.ts [--ignore dir1 dir2 ...] [--dry-run] [arquivos_ou_pastas...]
 *
 * Example:
 *   tsx prettier-unescape-math.ts . --ignore dist node_modules
 *   tsx prettier-unescape-math.ts src docs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';

/* Global options (set by command line). */
interface Options {
    dryRun: boolean;
    ignored: Set<string>;
}

const options: Options = {
    dryRun: false,
    ignored: new Set(),
};

/**
 * Processes an individual Markdown file.
 * @param filePath
 * @returns
 */
function processMarkdownFile(filePath: string): void {
    if (!filePath.endsWith('.md')) return;
    const original = fs.readFileSync(filePath, 'utf8');
    const updated = original.replace(/(%{2,3})([\s\S]*?)\1/gs, (_, delim, inner) => {
        /* Remove escapes de asterisco dentro de blocos %%...%% ou %%%...%%% */
        return delim + inner.replace(/\\\*/g, '*') + delim;
    });
    if (updated !== original) {
        if (options.dryRun) {
            console.log(`🔍 [dry-run] ${filePath} ✅`);
        } else {
            fs.writeFileSync(filePath, updated, 'utf8');
            console.log(`${filePath} ✅`);
        }
    } else {
        console.log(`${filePath} (unchanged)`);
    }
}

/* Recursive traversal of directories. */
function walkDir(dir: string): void {
    if (options.ignored.has(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (options.ignored.has(entry.name) || options.ignored.has(fullPath)) continue;

        if (entry.isDirectory()) {
            walkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            processMarkdownFile(fullPath);
        }
    }
}

/* Processing command line arguments. */
const args = process.argv.slice(2);
let pathsToProcess: string[] = [];
for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--ignore') {
        while (args[i + 1] && !args[i + 1].startsWith('--')) {
            options.ignored.add(args[++i]);
        }
    } else if (arg === '--dry-run') {
        options.dryRun = true;
    } else {
        pathsToProcess.push(arg);
    }
}
if (pathsToProcess.length === 0) {
    pathsToProcess = ['.'];
}
console.log('🧩 Directories/files to preccess:', pathsToProcess.join(', '));
if (options.ignored.size > 0) {
    console.log('🚫 Ignoring:', [...options.ignored].join(', '));
}
if (options.dryRun) {
    console.log('🔍 Dry-run mode (no one file will be modified).');
}

/* Main execution pipeline. */
for (const target of pathsToProcess) {
    const fullPath = path.resolve(target);
    if (!fs.existsSync(fullPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
        walkDir(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.md')) {
        processMarkdownFile(fullPath);
    }
}
const doneMessage = 'Prettier math markdown fix-up';
console.log(options.dryRun ? `🏁 ${doneMessage} dry-run done.` : `🏁 ${doneMessage} done.`);
