/* Web component element type definition. */
import type WebComponentElement from '../WebComponentElement';
/* Web component method factories. */
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
/* Web component styles. */
import styles from './command-prompt.styles.scss';
/* Set of Web component elements. */
export interface CommandPromptElementEntry {
    /* Wrapper */
    wrapper: HTMLDivElement;
    /* Frame box */
    frameBox: HTMLDivElement;
    /* Input */
    input: HTMLTextAreaElement;
    /* Output */
    output: HTMLDivElement;
}
/* Set of Web component elements. */
export type CommandPromptElement = WebComponentElement<CommandPromptElementEntry>;
/* Set of Web component element entry keys. */
export const CommandPromptElementEntryKey: (keyof CommandPromptElementEntry)[] = ['wrapper', 'frameBox', 'input', 'output'] as const;
/**
 * # CommandPrompt Web Component
 */
export class CommandPrompt extends HTMLElement {
    /* Web Component base id slug. */
    public static readonly tagName = 'command-prompt';
    /* Web component HTML elements. */
    public readonly element = {} as CommandPromptElement;
    /* Web component template HTML element field names. */
    public static readonly elementFields: (keyof CommandPromptElementEntry)[] = CommandPromptElementEntryKey;
    /* Web component template HTML element id postfix. */
    public static readonly elementPostfix = keyToPostfix(CommandPromptElementEntryKey);
    /* Web component null value */
    public static readonly null = null as unknown as CommandPrompt;
    /* Web component undefined value */
    public static readonly undefined = undefined as unknown as CommandPrompt;
    /* Web Component constructor. */
    public constructor() {
        super();
        constructorFactory(CommandPrompt, styles).bind(this)();
    }
    /**
     * Sets the unique ID of the base class of Web component.
     */
    public set superId(id: string) {
        super.id = id;
    }
    /**
     * Gets the unique ID of the base class of Web component.
     */
    public get superId(): string {
        return super.id;
    }
    /**
     * Sets the unique ID of the Web component.
     */
    public set id(id: string) {
        this.setId(id);
    }
    /**
     * Gets the unique ID of the Web component.
     */
    public get id(): string {
        return super.id;
    }
    /**
     * Sets the unique ID of the Web component.
     * @param id
     */
    public setId: (this: CommandPrompt, id?: string) => void = setIdFirstFactory(CommandPrompt).bind(this);
    /**
     * Creates an element of the Web Component type.
     * @param id Optional element id.
     * @returns The created element.
     */
    public static readonly createElement = createElementFactory(CommandPrompt);
    /**
     * Web component element definition handler.
     */
    public static readonly define = defineFactory(CommandPrompt);
    /**
     * Container (parent node) setter.
     */
    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }
    /**
     * Container (parent node) getter.
     */
    public get container(): HTMLElement {
        return this.element.container;
    }
    public connectedCallback(): void {
        this.element.input.addEventListener('change', this.resize);
        this.element.input.addEventListener('cut', this.delayedResize);
        this.element.input.addEventListener('paste', this.delayedResize);
        this.element.input.addEventListener('drop', this.delayedResize);
        this.element.input.addEventListener('keydown', this.delayedResize);
        this.element.frameBox.addEventListener('click', this.clickFrameBox);
        this.resize();
    }
    public disconnectedCallback(): void {
        this.element.input.removeEventListener('change', this.resize);
        this.element.input.removeEventListener('cut', this.delayedResize);
        this.element.input.removeEventListener('paste', this.delayedResize);
        this.element.input.removeEventListener('drop', this.delayedResize);
        this.element.input.removeEventListener('keydown', this.delayedResize);
        this.element.frameBox.removeEventListener('click', this.clickFrameBox);
    }
    /**
     * To be called in resize events.
     * @param event
     */
    public readonly resize: (event?: Event) => void = ((_event?: Event): void => {
        this.element.input.style.height = '1em';
        this.element.input.style.height = this.element.input.scrollHeight + 'px';
    }).bind(this);
    private readonly delayedResize: (event?: Event) => void = ((_event?: Event): void => {
        globalThis.setTimeout(this.resize, 0);
    }).bind(this);
    /**
     * To be called in 'click' event on frameBox element.
     * @param event
     */
    public onClickFrameBox?: (event?: Event) => void;
    public readonly clickFrameBox: (event?: Event) => void = ((event?: Event): void => {
        if (this.onClickFrameBox) {
            this.onClickFrameBox(event);
        }
    }).bind(this);
}
/* Defines the Web component element. */
CommandPrompt.define();
