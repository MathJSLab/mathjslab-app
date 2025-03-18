function showOpenFilePickerPolyfill(options?: OpenFilePickerOptions): Promise<[FileSystemFileHandle]> {
    return new Promise((resolve) => {
        const input = document.createElement('input') as HTMLInputElement;
        input.type = 'file';
        if (options) {
            input.multiple = options.multiple || false;
            input.accept = options
                .types!.map((type) => type.accept)
                .flatMap((inst) => Object.keys(inst!).flatMap((key) => inst![key as any]))
                .join(',');
        }
        input.addEventListener('change', () => {
            resolve(
                [...input.files!].map((file) => {
                    return {
                        getFile: async () =>
                            new Promise((resolve) => {
                                resolve(file);
                            }),
                    };
                }) as [FileSystemFileHandle],
            );
        });

        input.click();
    });
}

if (typeof globalThis.showOpenFilePicker !== 'function') {
    globalThis.showOpenFilePicker = showOpenFilePickerPolyfill;
}
