import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependency = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8')).dependencies.mathjslab;
if (!dependency.startsWith('file:')) throw new Error('This integration check requires the local file dependency.');
const kernel = realpathSync(resolve(app, dependency.slice(5)));
const installed = realpathSync(join(app, 'node_modules', 'mathjslab'));
if (installed !== kernel) throw new Error(`Installed mathjslab is stale: ${installed} != ${kernel}`);
const packageJSON = JSON.parse(readFileSync(join(kernel, 'package.json'), 'utf8'));
const targets = new Set();
const collect = (value) => {
    if (typeof value === 'string') targets.add(value);
    else for (const nested of Object.values(value)) collect(nested);
};
collect(packageJSON.exports);
const sources = [];
const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) sources.push(path);
    }
};
walk(join(kernel, 'src'));
const newestSource = Math.max(...sources.map((path) => statSync(path).mtimeMs));
const artifacts = [...targets].map((target) => {
    const path = join(kernel, target);
    let builtAt = statSync(path).mtimeMs;
    let buildHash;
    if (/\.(?:js|cjs)$/.test(target)) {
        // Webpack preserves mtime when a rebuild emits identical bytes.
        const bundle = target
            .split('/')
            .at(-1)
            .replace(/^mathjslab\./, '')
            .replace(/\.(?:js|cjs)$/, '');
        const stats = JSON.parse(readFileSync(join(kernel, 'report', `${bundle}.stats.json`), 'utf8'));
        if (stats.errorsCount || stats.errors?.length || typeof stats.builtAt !== 'number') throw new Error(`Missing successful build evidence for ${target}`);
        builtAt = stats.builtAt;
        buildHash = stats.hash;
    }
    if (builtAt < newestSource) throw new Error(`Rebuild the kernel before consumer validation: ${target} predates production source.`);
    return { target, builtAt, ...(buildHash ? { buildHash } : {}), sha256: createHash('sha256').update(readFileSync(path)).digest('hex') };
});
console.log(
    JSON.stringify(
        { dependency, kernel, version: packageJSON.version, resolvedCore: import.meta.resolve('mathjslab'), resolvedRuntime: import.meta.resolve('mathjslab/runtime'), artifacts },
        null,
        2,
    ),
);
