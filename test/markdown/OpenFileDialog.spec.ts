import { jest } from '@jest/globals';
import { createOpenFileButton, openFileDialog } from '../../src/openFileDialog';

describe('openFileDialog', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        document.body.replaceChildren();
    });

    it('reads the selected text file', async () => {
        const file = new File(['# Lesson'], 'lesson.md', { type: 'text/markdown' });
        Object.defineProperty(file, 'text', { value: async () => '# Lesson' });
        jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
            Object.defineProperty(this, 'files', { configurable: true, value: [file] });
            this.dispatchEvent(new Event('change'));
        });

        const receive = jest.fn();
        await openFileDialog(receive, {
            types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }],
        });

        expect(receive).toHaveBeenCalledWith('# Lesson');
    });

    it('finishes without invoking the callback when selection is cancelled', async () => {
        jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
            this.dispatchEvent(new Event('cancel'));
        });

        const receive = jest.fn();
        await openFileDialog(receive);

        expect(receive).not.toHaveBeenCalled();
    });

    it('opens from an explicit user-facing button', async () => {
        const picker = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
            this.dispatchEvent(new Event('cancel'));
        });

        const button = createOpenFileButton('Select Markdown file...', jest.fn());
        document.body.append(button);
        expect(picker).not.toHaveBeenCalled();

        button.click();
        await Promise.resolve();
        await Promise.resolve();

        expect(picker).toHaveBeenCalledTimes(1);
    });
});
