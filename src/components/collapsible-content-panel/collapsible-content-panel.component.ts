/* Web component element type definition. */
import type WebComponentElement from '../WebComponentElement';
/* Web component method factories. */
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
import constructorFactory from '../constructorFactory';
/* Web component styles. */
import styles from './collapsible-content-panel.styles.scss';
/* HTML Elements defined in template with id's. */
export interface CollapsibleContentPanelElementEntry {
    /* Wrapper */
    wrapper: HTMLDivElement;
    /* Toggle */
    toggle: HTMLInputElement;
    /* Title */
    title: HTMLLabelElement;
    /* Collapsible area */
    collapsible: HTMLDivElement;
    /* Content wrapper */
    innerContent: HTMLDivElement;
}
/* Set of Web component elements. */
export type CollapsibleContentPanelElement = WebComponentElement<CollapsibleContentPanelElementEntry>;
/* Set of Web component element entry keys. */
export const CollapsibleContentPanelElementEntryKey: (keyof CollapsibleContentPanelElementEntry)[] = ['wrapper', 'toggle', 'title', 'collapsible', 'innerContent'] as const;
/**
 * # CollapsibleContentPanel Web Component
 */
export class CollapsibleContentPanel extends HTMLElement {
    /* Web Component base id slug. */
    public static readonly tagName = 'collapsible-content-panel';
    /* Web component HTML elements. */
    public readonly element = {} as CollapsibleContentPanelElement;
    /* Web component template HTML element field names. */
    public static readonly elementFields: (keyof CollapsibleContentPanelElementEntry)[] = CollapsibleContentPanelElementEntryKey;
    /* Web component template HTML element id postfix. */
    public static readonly elementPostfix = keyToPostfix(CollapsibleContentPanelElementEntryKey);
    /* Web component null value */
    public static readonly null = null as unknown as CollapsibleContentPanel;
    /* Web component undefined value */
    public static readonly undefined = undefined as unknown as CollapsibleContentPanel;
    /* Web Component constructor. */
    public constructor() {
        super();
        constructorFactory(CollapsibleContentPanel, styles).bind(this)();
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
    public setId: (this: CollapsibleContentPanel, id?: string) => void = setIdFirstFactory(CollapsibleContentPanel).bind(this);
    /**
     * Creates an element of the Web Component type.
     * @param id Optional element id.
     * @returns The created element.
     */
    public static readonly createElement = createElementFactory(CollapsibleContentPanel);
    /**
     * Web component element definition handler.
     */
    public static readonly define = defineFactory(CollapsibleContentPanel);
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
}
/* Defines the Web component element. */
CollapsibleContentPanel.define();
