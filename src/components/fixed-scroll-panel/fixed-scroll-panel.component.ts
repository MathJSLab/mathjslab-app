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
import styles from './fixed-scroll-panel.styles.scss';
/**
 * Set of Web component elements.
 */
export interface FixedScrollPanelElementEntry {
    /* Root node */
    root: HTMLElement;
    /* Wrapper */
    wrapper: HTMLDivElement;
    /* Panel title */
    title: HTMLHeadingElement;
    /* Content wrapper */
    contentWrapper: HTMLDivElement;
}
/* Set of Web component elements. */
export type FixedScrollPanelElement = WebComponentElement<FixedScrollPanelElementEntry>;
/* Set of Web component element entry keys. */
export const FixedScrollPanelElementEntryKey: (keyof FixedScrollPanelElementEntry)[] = ['wrapper', 'title', 'contentWrapper'] as const;
/**
 * # FixedScrollPanel Web Component
 */
export class FixedScrollPanel extends HTMLElement {
    /* Web Component base id slug. */
    public static readonly tagName = 'fixed-scroll-panel';
    /* Web component HTML elements. */
    public readonly element = {} as FixedScrollPanelElement;
    /* Web component template HTML element field names. */
    public static readonly elementFields: (keyof FixedScrollPanelElementEntry)[] = FixedScrollPanelElementEntryKey;
    /* Web component template HTML element id postfix. */
    public static readonly elementPostfix = keyToPostfix(FixedScrollPanelElementEntryKey);
    /* Web component null value */
    public static readonly null = null as unknown as FixedScrollPanel;
    /* Web component undefined value */
    public static readonly undefined = undefined as unknown as FixedScrollPanel;
    /* Web Component constructor. */
    public constructor() {
        super();
        constructorFactory(FixedScrollPanel, styles).bind(this)();
        this.state.display = globalThis.getComputedStyle(this.element.wrapper).display === 'block';
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
    public setId: (this: FixedScrollPanel, id?: string) => void = setIdFirstFactory(FixedScrollPanel).bind(this);
    /**
     * Creates an element of the Web Component type.
     * @param id Optional element id.
     * @returns The created element.
     */
    public static readonly createElement = createElementFactory(FixedScrollPanel);
    /**
     * Web component element definition handler.
     */
    public static readonly define = defineFactory(FixedScrollPanel);
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
    public readonly state = {} as {
        display: boolean;
    };
    public onChangeDisplay?: (event?: Event, display?: boolean) => void;
    /**
     * To be called in resize events.
     * @param event
     */
    public readonly resize: (event?: Event) => void = ((event?: Event): void => {
        const display = globalThis.getComputedStyle(this.element.wrapper).display === 'block';
        if (display !== this.state.display) {
            this.state.display = display;
            if (this.onChangeDisplay) {
                this.onChangeDisplay(event, display);
            }
        }
        let Y = globalThis.scrollY - this.element.container.offsetTop + globalThis.innerHeight * 0.025;
        const maxY = this.element.container.offsetHeight - this.element.wrapper.offsetHeight;
        if (Y < 0) {
            Y = 0;
        } else if (Y > maxY) {
            Y = maxY;
        }
        this.element.wrapper.style.top = Y + 'px';
        this.element.wrapper.style.left = this.element.root.offsetWidth + 'px';
        this.element.wrapper.style.height = Math.min(this.element.container.offsetHeight, globalThis.innerHeight) * 0.9 + 'px';
    }).bind(this);
}
/* Defines the Web component element. */
FixedScrollPanel.define();
