/** Shared by the browser and asset build so traversal and initial selection agree. */
/** @typedef {import('./ExampleManifest').ExampleEntry} ExampleEntry */
/** @typedef {import('./ExampleManifest').ExampleLeaf} ExampleLeaf */

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' || (isRecord(value) && Object.keys(value).length > 0 && Object.values(value).every((text) => typeof text === 'string'));

/** @param {unknown} manifest @returns {ExampleLeaf[]} */
function exampleLeaves(manifest) {
    const leaves = [];
    const paths = new Set();
    const visit = (record, parents = [], directories = []) => {
        if (!isRecord(record)) throw new Error('Invalid example children record.');
        for (const [key, entry] of Object.entries(record)) {
            const keys = [...parents, key];
            const label = keys.join('/');
            if (!isRecord(entry) || !isText(entry.caption) || !isText(entry.description)) {
                throw new Error(`Invalid example metadata: ${label}`);
            }
            const directory = Object.hasOwn(entry, 'directory');
            if (directory === Object.hasOwn(entry, 'file') || (!directory && Object.hasOwn(entry, 'children'))) {
                throw new Error(`Ambiguous example entry: ${label}`);
            }
            const segment = directory ? entry.directory : entry.file;
            if (
                typeof segment !== 'string' ||
                !segment ||
                segment.includes('\\') ||
                /[:?#\u0000-\u001f]/u.test(segment) ||
                segment.split('/').some((part) => !part || part === '.' || part === '..')
            ) {
                throw new Error(`Invalid example path: ${label}`);
            }
            if (directory) visit(entry.children, keys, [...directories, segment]);
            else {
                const filePath = [...directories, segment].join('/');
                if (paths.has(filePath)) throw new Error(`Duplicate example path: ${filePath}`);
                paths.add(filePath);
                leaves.push({ keys, path: filePath, entry });
            }
        }
    };
    visit(manifest);
    return leaves;
}

module.exports = { exampleLeaves };
