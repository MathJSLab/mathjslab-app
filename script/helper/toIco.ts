import sharp from 'sharp';
import pngToIco from 'png-to-ico';

export default async (src: string, sizes = [16, 32, 48, 64, 128, 256]) => pngToIco(await Promise.all(sizes.map((size) => sharp(src).resize(size, size).png().toBuffer())));
