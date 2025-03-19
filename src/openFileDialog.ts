function openFileDialog(callbackfn: (content: string) => void, options?: (OpenFilePickerOptions & { multiple?: false | undefined }) | undefined) {
    global
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
export default openFileDialog;
