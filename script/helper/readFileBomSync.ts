import fs from 'node:fs';
export default function (filePath: string, options: Record<string, unknown>): string {
    if (options) {
        if (typeof options === 'string') {
            options = { encoding: options };
        } else if (typeof options === 'object') {
            if (options.encoding) {
                if (typeof options.encoding !== 'string') {
                    return fs.readFileSync(filePath, options) as unknown as string;
                }
            } else {
                options = Object.assign({}, options, { encoding: 'utf-8' });
            }
        } else {
            return fs.readFileSync(filePath, options) as unknown as string;
        }
    } else {
        options = { encoding: 'utf-8' };
    }
    const fd = fs.openSync(filePath, 'r');
    let bom = Buffer.alloc(3);
    fs.readSync(fd, bom, 0, 3, 0);
    fs.closeSync(fd);
    if (bom[0] === 0xef && bom[1] === 0xbb && bom[2] === 0xbf) {
        options.encoding = 'utf-8';
    } else if (bom[0] === 0xff && bom[1] === 0xfe) {
        options.encoding = 'utf-16le';
    } else if (bom[0] === 0xfe && bom[1] === 0xff) {
        options.encoding = 'utf-16be';
    }
    return fs.readFileSync(filePath, options) as unknown as string;
}
