/**
 * Open a file through the browser File System Access API and pass its text
 * content to the supplied callback.
 *
 * @param callbackfn Callback invoked with the selected file content.
 * @param options Options forwarded to `showOpenFilePicker`.
 */
function openFileDialog(callbackfn: (content: string) => void, options?: (OpenFilePickerOptions & { multiple?: false | undefined }) | undefined) {
    globalThis
        .showOpenFilePicker(options)
        .then(
            ([fileHandle]) => fileHandle.getFile(),
            /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
            (reason) => null,
        )
        .then((file) => (file ? file.text() : null))
        .then((content) => {
            if (content) {
                callbackfn(content);
            }
        });
}
export { openFileDialog };
export default { openFileDialog };
