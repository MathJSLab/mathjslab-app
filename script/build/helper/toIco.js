import path from 'node:path';
import util from 'node:util';
import fs from 'node:fs';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { Resvg } from '@resvg/resvg-js';
/** Create icon from image.
 * @param src Source image path.
 * @param sizes Image sizes in icon file.
 * @param engine Engine used to resize and convert the image.
 * @returns A Buffer containing the icon.
 */
export default async (src, sizes, engine) => {
    if (typeof src === 'string') {
        src = path.resolve(src);
    }
    else if (Array.isArray(src) && src.every((srcpath) => typeof srcpath === 'string')) {
        src = path.resolve(...src);
    }
    else {
        throw new Error('invalid arguments:\nsrc: string | string[] = ' + util.inspect(src, { compact: false, colors: true }));
    }
    if (typeof sizes === 'number') {
        sizes = [sizes];
    }
    else if (Array.isArray(sizes) && sizes.every((size) => typeof size === 'number')) {
        sizes = sizes.slice().sort((a, b) => a - b);
    }
    else if (typeof sizes === 'undefined' || sizes === null) {
        sizes = [16, 24, 32, 48, 64, 128, 256];
    }
    else {
        throw new Error('invalid arguments:\nsizes?: number | number[] | null = ' + util.inspect(sizes, { compact: false, colors: true }));
    }
    if (!engine || engine === 'auto') {
        engine = path.extname(src).toLowerCase() === '.svg' ? 'resvg' : 'sharp';
    }
    else if (engine !== 'sharp' && engine !== 'resvg') {
        throw new Error("invalid arguments:\nengine?: 'auto' | 'sharp' | 'resvg' | null = " + util.inspect(engine, { compact: false, colors: true }));
    }
    const fileBuffer = await fs.promises.readFile(src);
    return pngToIco(await Promise.all(engine === 'sharp'
        ? sizes.map(async (size) => sharp(fileBuffer).resize(size, size, { fit: 'cover' }).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer())
        : sizes.map(async (size) => Buffer.from(new Resvg(fileBuffer, { fitTo: { mode: 'width', value: size } }).render().asPng()))));
};
