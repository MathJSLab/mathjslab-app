import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'help');
const write = process.argv.includes('--write');
let filesChanged = 0;
let replacements = 0;

const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            visit(filename);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            const source = fs.readFileSync(filename, 'utf8');
            const protectedRanges = Array.from(source.matchAll(/%`[^`\r\n]+`%/g), (match) => [match.index, match.index + match[0].length]);
            let count = 0;
            const migrated = source.replace(/`%([^`\r\n]+?)%`/g, (match, expression, offset) => {
                const overlapsProtected = protectedRanges.some(([start, end]) => offset < end && offset + match.length > start);
                if (overlapsProtected) return match;
                count++;
                return `%\`${expression}\`%`;
            });
            if (count > 0) {
                filesChanged++;
                replacements += count;
                if (write) fs.writeFileSync(filename, migrated);
            }
        }
    }
};

visit(root);
console.log(`${write ? 'Migrated' : 'Found'} ${replacements} MathJSLab expressions in ${filesChanged} Markdown files.`);
