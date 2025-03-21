/**
 * A showOpenFilePicker polyfill/fallback.
 * @param {OpenFilePickerOptions | undefined} options
 * @returns {Promise<[FileSystemFileHandle]>}
 *
 * To install types support:
 *
 * `npm install --save-dev @types/wicg-file-system-access`
 *
 * ## References
 * - https://wicg.github.io/file-system-access/
 * - https://www.w3.org/TR/FileAPI/
 * - https://www.w3.org/TR/file-system-api/
 */
function showOpenFilePickerPolyfill(options?: OpenFilePickerOptions & { multiple?: false | undefined }): Promise<[FileSystemFileHandle]>;
function showOpenFilePickerPolyfill(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
function showOpenFilePickerPolyfill(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]> {
    return new Promise((resolve: (value: FileSystemFileHandle[] | PromiseLike<FileSystemFileHandle[]>) => void) => {
        const input = document.createElement('input');
        input.type = 'file';
        if (options) {
            input.multiple = !!options.multiple;
            input.accept = options.types?.flatMap((type) => Object.entries(type.accept ?? {}).flatMap(([_, exts]) => exts)).join(',') ?? '';
        }
        input.addEventListener('change', () => {
            if (!input.files) {
                resolve([]);
                return;
            }
            const handles = [...input.files].map((file: File) => ({
                getFile: async () => file,
                queryPermission: async () => 'granted',
                requestPermission: async () => 'granted',
                kind: 'file',
            })) as FileSystemFileHandle[];
            resolve(handles);
        });
        input.click();
    });
}
if (typeof globalThis.showOpenFilePicker !== 'function') {
    globalThis.showOpenFilePicker = showOpenFilePickerPolyfill;
}
