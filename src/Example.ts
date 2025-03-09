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
 * Load examples handler type.
 */
type LoadExampleHandler = (text?: string) => any;
/**
 * # Example class.
 * This class has only one public static method:
 * `Example.initialize(options: ShellOptions)`.
 */
class Example {
    public readonly baseUrl: string;
    public readonly isFileProtocol: boolean;
    private readonly loadHandler: LoadExampleHandler;
    public examples: Record<string, ExampleEntry>;
    private examplesAvailable: boolean;
    private examplesContainer: HTMLElement;
    /**
     * ## Example constructor
     */
    private constructor(id: string, loadHandler: LoadExampleHandler) {
        this.baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        this.isFileProtocol = this.baseUrl.startsWith('file:');
        this.loadHandler = loadHandler;
        this.examplesContainer = document.getElementById(id)!;
    }
    /**
     * ## Load examples if available.
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
                    this.examples = data;
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
            for (const example in this.examples) {
                const button = document.createElement('button');
                this.examplesContainer.append(button);
                button.id = 'example-' + example;
                button.innerHTML = this.examples[example].caption;
                button.addEventListener('click', async (event: Event): Promise<void> => {
                    const exampleId = (event.target as HTMLButtonElement).id.substring(8);
                    const response = await globalThis.fetch(`${appEngine.config.exampleBaseUrl}example/${this.examples[exampleId].file}`);
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
     * ## Example initialization (instantiation).
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
export { ExampleEntry, LoadExampleHandler, Example };
export default Example;
