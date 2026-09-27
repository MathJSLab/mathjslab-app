import { showOpenFilePickerPolyfill } from './showOpenFilePickerPolyfill';

/**
 * Open a text file through the browser file chooser and pass its content to
 * the supplied callback.
 *
 * @param callbackfn Callback invoked with the selected file content.
 * @param options Options used to configure the file picker.
 */
async function openFileDialog(callbackfn: (content: string) => void, options?: (OpenFilePickerOptions & { multiple?: false | undefined }) | undefined): Promise<void> {
    const [fileHandle] = await showOpenFilePickerPolyfill(options);
    if (!fileHandle) return;

    const file = await fileHandle.getFile();
    callbackfn(await file.text());
}

/** Create a user-activated control that opens the native file picker. */
function createOpenFileButton(label: string, callbackfn: (content: string) => void, options?: (OpenFilePickerOptions & { multiple?: false | undefined }) | undefined): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'file-picker-button';
    button.textContent = label;
    button.addEventListener('click', async () => {
        button.disabled = true;
        try {
            await openFileDialog(callbackfn, options);
        } finally {
            button.disabled = false;
        }
    });
    return button;
}
export { createOpenFileButton, openFileDialog };
export default { createOpenFileButton, openFileDialog };
