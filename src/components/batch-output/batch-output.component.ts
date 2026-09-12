import hljs from 'highlight.js/lib/core';
import matlab from 'highlight.js/lib/languages/matlab';
import styles from './batch-output.styles.scss';
import i18n from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';

if (!hljs.getLanguage('matlab')) {
    hljs.registerLanguage('matlab', matlab);
}

/**
 * Renderable output item produced by one batch statement.
 */
export interface BatchOutputItem {
    command: string;
    html?: string;
    error?: boolean;
}

/**
 * Shadow DOM element map for the batch output component.
 */
export interface BatchOutputElementEntry {
    root: HTMLElement;
    placeholder: HTMLElement;
    list: HTMLOListElement;
}

export type BatchOutputElement = WebComponentElement<BatchOutputElementEntry>;
export const BatchOutputElementEntryKey: (keyof BatchOutputElementEntry)[] = ['root', 'placeholder', 'list'] as const;

/**
 * Output panel that displays evaluated statements and errors.
 */
export class BatchOutput extends HTMLElement {
    public static readonly tagName = 'batch-output';
    public readonly element = {} as BatchOutputElement;
    public static readonly elementFields: (keyof BatchOutputElementEntry)[] = BatchOutputElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(BatchOutputElementEntryKey);
    public static readonly null = null as unknown as BatchOutput;
    public static readonly undefined = undefined as unknown as BatchOutput;
    public static readonly observedAttributes = ['show-command'];

    public constructor() {
        super();
        constructorFactory(BatchOutput, styles).bind(this)();
        this.setLanguage();
    }

    public set superId(id: string) {
        super.id = id;
    }

    public get superId(): string {
        return super.id;
    }

    public set id(id: string) {
        this.setId(id);
    }

    public get id(): string {
        return super.id;
    }

    public setId: (this: BatchOutput, id?: string) => void = setIdFirstFactory(BatchOutput).bind(this);
    public static readonly createElement = createElementFactory(BatchOutput);
    public static readonly define = defineFactory(BatchOutput);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    /**
     * Whether command source snippets are shown above their MathML results.
     */
    public get showCommand(): boolean {
        return this.getAttribute('show-command') !== 'false';
    }

    /**
     * Whether command source snippets are shown above their MathML results.
     */
    public set showCommand(value: boolean) {
        this.setAttribute('show-command', value ? 'true' : 'false');
    }

    /**
     * Subscribe to language changes while the component is connected.
     */
    public connectedCallback(): void {
        i18n.addEventListener('languagechange', this.setLanguage);
    }

    /**
     * Remove language subscriptions.
     */
    public disconnectedCallback(): void {
        i18n.removeEventListener('languagechange', this.setLanguage);
    }

    /**
     * Update command visibility without recreating rendered results.
     */
    public attributeChangedCallback(): void {
        this.updateCommandVisibility();
    }

    /**
     * Whether the output panel currently contains rendered items.
     */
    public get hasItems(): boolean {
        return this.element.list.childElementCount > 0;
    }

    /**
     * Clear all output items and show the empty-state placeholder.
     */
    public clear(): void {
        this.element.list.replaceChildren();
        this.element.placeholder.hidden = false;
    }

    /**
     * Replace the rendered output items.
     *
     * @param items Batch output items to render.
     */
    public setItems(items: BatchOutputItem[]): void {
        this.clear();
        items.forEach((item) => this.appendItem(item));
    }

    /**
     * Append one output item and return its result container.
     *
     * The returned element can receive rich DOM content without that content
     * being recreated when command visibility changes.
     *
     * @param item Output item metadata and optional initial HTML.
     * @returns Element that contains the rendered result.
     */
    public appendItem(item: BatchOutputItem): HTMLDivElement {
        const { entry, result } = this.createItem(item);
        this.element.list.append(entry);
        this.element.placeholder.hidden = true;
        return result;
    }

    /**
     * Update the localized placeholder text.
     */
    private readonly setLanguage = (): void => {
        this.element.placeholder.textContent = i18n.page.output.placeholder;
    };

    /**
     * Show or hide command source without replacing result nodes.
     */
    private updateCommandVisibility(): void {
        this.element.list?.querySelectorAll<HTMLElement>('.command').forEach((command) => {
            command.hidden = !this.showCommand;
        });
    }

    /**
     * Create one output list entry.
     *
     * @param item Output item to render.
     * @returns List item and its result container.
     */
    private createItem(item: BatchOutputItem): { entry: HTMLLIElement; result: HTMLDivElement } {
        const entry = document.createElement('li');
        const command = document.createElement('pre');
        const commandCode = document.createElement('code');
        const resultScroller = document.createElement('div');
        const result = document.createElement('div');
        entry.className = 'entry';
        command.className = 'command';
        commandCode.className = 'language-matlab';
        resultScroller.className = 'result-scroller';
        result.className = item.error ? 'result error' : 'result';
        commandCode.innerHTML = hljs.highlight(item.command || ' ', { language: 'matlab', ignoreIllegals: true }).value;
        result.innerHTML = item.html ?? '';
        command.hidden = !this.showCommand;
        command.append(commandCode);
        resultScroller.append(result);
        entry.append(command);
        entry.append(resultScroller);
        return { entry, result };
    }
}

BatchOutput.define();
