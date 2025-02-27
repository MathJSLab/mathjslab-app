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
import styles from './batch-panel.styles.scss';
/* Set of Web component elements. */
export interface BatchPanelElementEntry {
    /* Wrapper */
    wrapper: HTMLDivElement;
    /* Frame box */
    frameBox: HTMLDivElement;
    /* Input wrapper */
    inputWrapper: HTMLDivElement;
    /* Input */
    input: HTMLTextAreaElement;
    /* Evaluate button */
    evaluateButton: HTMLButtonElement;
}
/* Set of Web component elements. */
export type BatchPanelElement = WebComponentElement<BatchPanelElementEntry>;
/* Set of Web component element entry keys. */
export const BatchPanelElementEntryKey: (keyof BatchPanelElementEntry)[] = [
    'wrapper',
    'frameBox',
    'inputWrapper',
    'input',
    'evaluateButton',
] as const;
/**
 * # BatchPanel Web Component
 */
export class BatchPanel extends HTMLElement {
    /* Web Component base id slug. */
    public static readonly tagName = 'batch-panel';
    /* Web component HTML elements. */
    public readonly element = {} as BatchPanelElement;
    /* Web component template HTML element field names. */
    public static readonly elementFields: (keyof BatchPanelElementEntry)[] = BatchPanelElementEntryKey;
    /* Web component template HTML element id postfix. */
    public static readonly elementPostfix = keyToPostfix(BatchPanelElementEntryKey);
    /* Web component null value */
    public static readonly null = null as unknown as BatchPanel;
    /* Web component undefined value */
    public static readonly undefined = undefined as unknown as BatchPanel;
    /* Web Component constructor. */
    public constructor() {
        super();
        constructorFactory(BatchPanel, styles).bind(this)();
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
    public setId: (this: BatchPanel, id?: string) => void = setIdFirstFactory(BatchPanel).bind(this);
    /**
     * Creates an element of the Web Component type.
     * @param id Optional element id.
     * @returns The created element.
     */
    public static readonly createElement = createElementFactory(BatchPanel);
    /**
     * Web component element definition handler.
     */
    public static readonly define = defineFactory(BatchPanel);
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
        this.element.input.style.height = this.element.input.scrollHeight + 27 + 'px';
    }
}
/* Defines the Web component element. */
BatchPanel.define();
