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
        this.element.input.addEventListener('change', this.resize.bind(this));
        const delayedResize = (_event: Event): void => {
            window.setTimeout(this.resize.bind(this), 0);
        };
        this.element.input.addEventListener('cut', delayedResize); // ????
        this.element.input.addEventListener('paste', delayedResize); // ????
        this.element.input.addEventListener('drop', delayedResize); // ????
        this.element.input.addEventListener('keydown', delayedResize);
        const clickFrameBox = (event: Event) => {
            if (this.clickFrameBox) {
                this.clickFrameBox(event);
            }
        };
        this.element.frameBox.addEventListener('click', clickFrameBox.bind(this));
        this.resize();
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
    /**
     * To be called in resize events.
     * @param _event
     */
    public resize(_event?: Event): void {
        this.element.input.style.height = '1em';
        this.element.input.style.height = this.element.input.scrollHeight + 'px';
    }
    /**
     * Handler to be called in 'click' event on frameBox element.
     * @param event
     */
    public clickFrameBox?: (event?: Event) => void;
}
/* Defines the Web component element. */
CommandPrompt.define();
