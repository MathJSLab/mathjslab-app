/** Create icon from image.
 * @param src Source image path.
 * @param sizes Image sizes in icon file.
 * @param engine Engine used to resize and convert the image.
 * @returns A Buffer containing the icon.
 */
declare const _default: (src: string | string[], sizes?: number | number[] | null, engine?: "auto" | "sharp" | "resvg" | null) => Promise<Buffer>;
export default _default;
