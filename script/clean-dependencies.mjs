import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// App-owned: organization clean:copy must not remove this final cleanup step.
const root = fileURLToPath(new URL('../', import.meta.url));
for (const name of ['node_modules', 'package-lock.json']) {
    const target = path.resolve(root, name);
    if (path.dirname(target) !== path.resolve(root)) throw new Error(`Unsafe cleanup path: ${target}`);
    fs.rmSync(target, { recursive: name === 'node_modules', force: true });
    console.log(`Removed ${name}`);
}
