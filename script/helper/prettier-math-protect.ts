#!/usr/bin/env tsx
/**
 * prettier-math-protect.ts
 *
 * Protects and restores math markup in Markdown files by temporarily replacing
 * asterisks (*) with the multiplication sign (×) inside %%...%% or %%%...%%% blocks.
 *
 * Usage:
 *   tsx prettier-math-protect.ts --protect [--ignore dir1 dir2 ...] [--dry-run] [arquivos_ou_pastas...]
 *   tsx prettier-math-protect.ts --restore [--ignore dir1 dir2 ...] [--dry-run] [arquivos_ou_pastas...]
 *
 * Example:
 *   tsx prettier-math-protect.ts --protect docs --ignore dist node_modules
 *   tsx prettier-math-protect.ts --restore . --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import micromatch from 'micromatch';
const { isMatch } = micromatch;

/* Global options (set by command line). */
interface Options {
    mode: 'protect' | 'restore';
    dryRun: boolean;
    ignorePatterns: string[];
}

const options: Options = {
    mode: 'protect',
    dryRun: false,
    ignorePatterns: [],
};

/**
 * Checks whether the path should be ignored.
 * @param filePath Path to test
 * @returns `true` if path must be ignored.
 */
function isIgnored(filePath: string): boolean {
    return options.ignorePatterns.some((pattern) => isMatch(filePath, pattern));
}

/**
 * Process an individual Markdown file: replace or restore asterisks in %%...%% and %%%...%%% blocks.
 * @param filePath
 * @returns
 */
function processMarkdownFile(filePath: string): void {
    if (!filePath.endsWith('.md') || isIgnored(filePath)) return;
    const original = fs.readFileSync(filePath, 'utf8');
    const updated = original.replace(/(%{2,3})([\s\S]*?)\1/gs, (_, delim, inner) => {
        if (options.mode === 'protect') {
            return delim + inner.replace(/\*/g, '×') + delim;
        } else {
            return delim + inner.replace(/×/g, '*') + delim;
        }
    });
    if (updated !== original) {
        if (options.dryRun) {
            console.log(`🔍 [dry-run] ${filePath} (${options.mode}) ✅`);
        } else {
            fs.writeFileSync(filePath, updated, 'utf8');
            console.log(`${filePath} (${options.mode}) ✅`);
        }
    } else {
        if (options.dryRun) {
            console.log(`🔍 [dry-run] ${filePath} (${options.mode}) (unchanged)`);
        } else {
            console.log(`${filePath} (unchanged)`);
        }
    }
}

/**
 * Recursively traverse a directory.
 * @param dir
 * @returns
 */
function walkDir(dir: string): void {
    if (isIgnored(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (isIgnored(fullPath)) continue;

        if (entry.isDirectory()) {
            walkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            processMarkdownFile(fullPath);
        }
    }
}

/* Parse command-line arguments. */
const args = process.argv.slice(2);
let targets: string[] = [];
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
        case '--protect':
            options.mode = 'protect';
            break;
        case '--restore':
            options.mode = 'restore';
            break;
        case '--dry-run':
            options.dryRun = true;
            break;
        case '--ignore':
            while (args[i + 1] && !args[i + 1].startsWith('--')) {
                options.ignorePatterns.push(args[++i]);
            }
            break;
        default:
            targets.push(arg);
    }
}
if (targets.length === 0) targets = ['.'];
if (options.ignorePatterns.length === 0) {
    options.ignorePatterns = ['**/node_modules/**'];
}
console.log(`🧮 Mode: ${options.mode}`);
console.log(`🧩 Targets: ${targets.join(', ')}`);
console.log(`🚫 Ignoring: ${options.ignorePatterns.join(', ')}`);
if (options.dryRun) console.log('🔍 Dry-run mode (no files will be modified)');

/**
 * Main execution.
 */
for (const target of targets) {
    const fullPath = path.resolve(target);
    if (!fs.existsSync(fullPath)) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
        walkDir(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.md')) {
        processMarkdownFile(fullPath);
    }
}
const doneMessage = 'Prettier math markdown';
console.log(options.dryRun ? `🏁 ${doneMessage} ${options.mode} dry-run completed successfully.` : `🏁 ${doneMessage} ${options.mode} completed successfully.`);
