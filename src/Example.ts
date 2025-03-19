/**
 * First example record entry.
 */
import { appEngine } from './appEngine';
import firstExample from './first-example.json';
/**
 * Examples record entry.
 */
interface ExampleEntry {
    file: string;
    caption: string;
    description: string;
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
    /**
     * Example constructor
     */
    private constructor(id: string, loadHandler: LoadExampleHandler) {
        this.baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
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
            await global
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
            this.loadHandler(firstExample.content);
        } else {
            let first = true;
            for (const example in this.examplesRecord) {
                const button = document.createElement('button');
                this.examplesContainer.append(button);
                button.id = 'example-' + example;
                button.innerHTML = this.examplesRecord[example].caption;
                button.addEventListener('click', async (event: Event): Promise<void> => {
                    const exampleId = (event.target as HTMLButtonElement).id.substring(8);
                    const response = await globalThis.fetch(`${appEngine.config.exampleBaseUrl}example/${this.examplesRecord[exampleId].file}`);
                    if (!response.ok) {
                        throw new Error('Network response error.');
                    }
                    this.loadHandler(await response.text());
                });
                if (first) {
                    button.click();
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
export default Example;
