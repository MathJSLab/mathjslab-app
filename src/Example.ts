/**
 * First example record entry.
 */
import { appEngine } from './appEngine';
import firstExample from './first-example.json';
/**
 * Examples record entry.
 */
type LocalizedText = string | Record<string, string>;
interface ExampleEntry {
    file: string;
    caption: LocalizedText;
    description: LocalizedText;
}
/**
 * Load `examplesRecord` handler type.
 */
type LoadExampleHandler = (text?: string) => any;
/**
 * # Example class
 *
 * This class provides support for example files. It reads the
 * `example/example.json` file with information about the example files, then
 * creates buttons in the Examples panel with listeners to load each file.
 * This class has only one public static async method:
 *
 * `Example.initialize(id, loadHandler)`
 *
 * It loads the examplesRecord, if they are available. The `id` argument is the HTML
 * element id of the example buttons container. The `loadHandler` is the
 * function handler that loads example content in the Shell.
 */
class Example {
    public readonly baseUrl: string;
    public readonly isFileProtocol: boolean;
    private examplesRecord: Record<string, ExampleEntry>;
    private readonly loadHandler: LoadExampleHandler;
    private examplesAvailable: boolean;
    private examplesContainer: HTMLElement;
    private buttons: HTMLButtonElement[] = [];
    /**
     * Example constructor
     */
    private constructor(id: string, loadHandler: LoadExampleHandler) {
        this.baseUrl = globalThis.location.href.substring(0, globalThis.location.href.lastIndexOf('/') + 1);
        this.isFileProtocol = this.baseUrl.startsWith('file:');
        this.loadHandler = loadHandler;
        this.examplesContainer = document.getElementById(id)!;
    }
    /**
     * `examplesRecord` getter.
     * @returns {Record<string, ExampleEntry>} The `examplesRecord` private property.
     */
    public get examples(): Record<string, ExampleEntry> {
        return this.examplesRecord;
    }
    /**
     * Get localized text with fallback.
     */
    private localizedText(text: LocalizedText, lang = appEngine.lang): string {
        if (typeof text === 'string') {
            return text;
        }
        return text[lang] ?? text[appEngine.config.defaultLanguage!] ?? Object.values(text)[0] ?? '';
    }
    /**
     * Test whether an example entry has localized generated files.
     */
    private hasLocalizedFile(exampleId: string): boolean {
        return typeof this.examplesRecord[exampleId].caption === 'object';
    }
    /**
     * Update one example button caption.
     */
    private setButtonCaption(button: HTMLButtonElement): void {
        const exampleId = button.id.substring(8);
        const example = this.examplesRecord[exampleId];
        button.innerHTML = this.localizedText(example.caption);
        button.title = this.localizedText(example.description);
    }
    /**
     * Update all example button captions.
     */
    private setButtonCaptions(): void {
        this.buttons.forEach((button) => {
            this.setButtonCaption(button);
        });
    }
    /**
     * Get the URL for the example source file.
     */
    private exampleUrl(exampleId: string): string {
        const example = this.examplesRecord[exampleId];
        const languagePath = this.hasLocalizedFile(exampleId) ? `${appEngine.lang}/` : '';
        return `${appEngine.config.exampleBaseUrl}example/${languagePath}${example.file}`;
    }
    /**
     * Load an example file into the command shell.
     */
    private async loadExample(exampleId: string): Promise<void> {
        const response = await globalThis.fetch(this.exampleUrl(exampleId));
        if (!response.ok) {
            throw new Error('Network response error.');
        }
        this.loadHandler(await response.text());
    }
    /**
     * Change example button captions without replacing user-edited content.
     */
    public setLanguage(lang?: string): void {
        if (lang) {
            appEngine.lang = lang;
        }
        if (!this.isFileProtocol && this.examplesAvailable) {
            this.setButtonCaptions();
        }
    }
    /**
     * Load `examplesRecord` if examples available.
     */
    private async load(): Promise<void> {
        if (!this.examplesContainer) {
            throw new Error(`undefined Example.examplesContainer property.`);
        }
        if (!this.loadHandler) {
            throw new Error(`undefined Example.loadHandler callback.`);
        }
        if (!this.isFileProtocol) {
            await globalThis
                .fetch(`${appEngine.config.exampleBaseUrl}example/example.json`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Examples unavailable.');
                    }
                    return response.json();
                })
                .then((data) => {
                    this.examplesRecord = data;
                    this.examplesAvailable = true;
                })
                .catch((_error) => {
                    this.examplesAvailable = false;
                });
        }
        if (this.isFileProtocol || !this.examplesAvailable) {
            this.loadHandler(this.localizedText(firstExample.content as LocalizedText));
        } else {
            let first = true;
            for (const example in this.examplesRecord) {
                const button = document.createElement('button');
                this.buttons.push(button);
                this.examplesContainer.append(button);
                button.id = 'example-' + example;
                this.setButtonCaption(button);
                button.addEventListener('click', async (event: Event): Promise<void> => {
                    await this.loadExample((event.currentTarget as HTMLButtonElement).id.substring(8));
                });
                if (first) {
                    await this.loadExample(example);
                    first = false;
                }
            }
        }
    }
    /**
     * ## Example class initialization (instantiation).
     * @param {string} id
     * @param {LoadExampleHandler} loadHandler
     * @returns {Promise<Example>} A promise for a `Example` instance.
     */
    public static async initialize(id: string, loadHandler: LoadExampleHandler): Promise<Example> {
        const example = new Example(id, loadHandler);
        await example.load();
        return example;
    }
}
export type { ExampleEntry, LoadExampleHandler };
export { Example };
export default { Example };
