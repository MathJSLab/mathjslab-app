import hljs from 'highlight.js/lib/core';
import matlab from 'highlight.js/lib/languages/matlab';
import styles from './batch-code-editor.styles.scss';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';

hljs.registerLanguage('matlab', matlab);

/**
 * Shadow DOM element map for the batch code editor.
 */
export interface BatchCodeEditorElementEntry {
    root: HTMLElement;
    gutter: HTMLElement;
    stack: HTMLElement;
    highlight: HTMLElement;
    input: HTMLTextAreaElement;
}

export type BatchCodeEditorElement = WebComponentElement<BatchCodeEditorElementEntry>;
export const BatchCodeEditorElementEntryKey: (keyof BatchCodeEditorElementEntry)[] = ['root', 'gutter', 'stack', 'highlight', 'input'] as const;

/**
 * MATLAB-style source editor with line numbers and syntax highlighting.
 */
export class BatchCodeEditor extends HTMLElement {
    public static readonly tagName = 'batch-code-editor';
    public readonly element = {} as BatchCodeEditorElement;
    public static readonly elementFields: (keyof BatchCodeEditorElementEntry)[] = BatchCodeEditorElementEntryKey;
    public static readonly elementPostfix = keyToPostfix(BatchCodeEditorElementEntryKey);
    public static readonly null = null as unknown as BatchCodeEditor;
    public static readonly undefined = undefined as unknown as BatchCodeEditor;
    public readonly state = {} as {
        display: boolean;
    };
    public onChangeDisplay?: (event?: Event, display?: boolean) => void;

    public constructor() {
        super();
        constructorFactory(BatchCodeEditor, styles).bind(this)();
        this.state.display = globalThis.getComputedStyle(this.element.root).display !== 'none';
        this.render();
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

    public setId: (this: BatchCodeEditor, id?: string) => void = setIdFirstFactory(BatchCodeEditor).bind(this);
    public static readonly createElement = createElementFactory(BatchCodeEditor);
    public static readonly define = defineFactory(BatchCodeEditor);

    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }

    public get container(): HTMLElement {
        return this.element.container;
    }

    /**
     * Current editor source text.
     */
    public get value(): string {
        return this.element.input.value;
    }

    /**
     * Current editor source text.
     */
    public set value(value: string) {
        this.element.input.value = value;
        this.resize();
    }

    /**
     * Accessible label for the editable text area.
     */
    public get label(): string {
        return this.element.input.getAttribute('aria-label') ?? '';
    }

    /**
     * Accessible label for the editable text area.
     */
    public set label(value: string) {
        this.element.input.setAttribute('aria-label', value);
    }

    /**
     * Wire editor events after the component is connected to the document.
     */
    public connectedCallback(): void {
        this.element.input.addEventListener('input', this.input);
        this.element.input.addEventListener('scroll', this.syncScroll);
        this.resize();
    }

    /**
     * Remove editor events registered by `connectedCallback`.
     */
    public disconnectedCallback(): void {
        this.element.input.removeEventListener('input', this.input);
        this.element.input.removeEventListener('scroll', this.syncScroll);
    }

    /**
     * Move keyboard focus to the editable text area.
     */
    public focus(): void {
        this.element.input.focus();
    }

    /**
     * Recalculate the visible editor size and display state.
     *
     * @param event Event that triggered the resize, when available.
     */
    public readonly resize: (event?: Event) => void = ((event?: Event): void => {
        const display = globalThis.getComputedStyle(this.element.root).display !== 'none';
        if (display !== this.state.display) {
            this.state.display = display;
            if (this.onChangeDisplay) {
                this.onChangeDisplay(event, display);
            }
        }
        this.element.input.style.height = '1em';
        this.element.input.style.height = `${this.element.input.scrollHeight}px`;
        this.render();
    }).bind(this);

    private readonly input = (): void => {
        this.resize();
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    };

    /**
     * Keep the highlight layer and line gutter aligned with textarea scrolling.
     */
    private readonly syncScroll = (): void => {
        this.element.highlight.style.transform = `translate(${-this.element.input.scrollLeft}px, ${-this.element.input.scrollTop}px)`;
        this.element.gutter.style.transform = `translateY(${-this.element.input.scrollTop}px)`;
    };

    /**
     * Render syntax highlighting and line numbers for the current source.
     */
    private render(): void {
        const code = this.value;
        const highlighted = hljs.highlight(code || ' ', { language: 'matlab', ignoreIllegals: true }).value;
        const lineCount = Math.max(1, code.split(/\r\n|\r|\n/).length);
        this.element.highlight.innerHTML = highlighted.endsWith('\n') ? `${highlighted} ` : highlighted;
        this.element.gutter.textContent = Array.from({ length: lineCount }, (_value, index) => String(index + 1)).join('\n');
        this.element.root.dataset.empty = String(code.length === 0);
        this.syncScroll();
    }
}

BatchCodeEditor.define();
