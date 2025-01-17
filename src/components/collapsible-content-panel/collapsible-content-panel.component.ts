import styles from './collapsible-content-panel.styles.scss';

/**
 * # CollapsibleContentPanel Web Component
 */
class CollapsibleContentPanel extends HTMLElement {
    /* Panel title */
    protected titleElement: HTMLLabelElement;
    /* Web Component constructor. */
    public constructor() {
        super();
        /* Find template in main DOM. */
        const template = document.getElementById('collapsible-content-panel-template') as HTMLTemplateElement;
        if (template) {
            /* Clone the template content. */
            const clone = template.content.cloneNode(true) as DocumentFragment;
            /* Creates a <style> element to include the styles. */
            const styleElement = document.createElement('style') as HTMLStyleElement;
            styleElement.textContent = styles;
            /* Replace identifiers in the cloned template with the instance id. */
            let inputElement: HTMLInputElement;
            clone.querySelectorAll('[id]').forEach((element: Element) => {
                element.id = `${element.id}-${this.id}`;
                if (element.tagName === 'INPUT') {
                    inputElement = element as HTMLInputElement;
                }
                if (element.tagName === 'LABEL') {
                    this.titleElement = element as HTMLLabelElement;
                    this.titleElement.htmlFor = inputElement.id;
                }
            });
            /* Attach shadow DOM and adds styles to the Shadow DOM before adding the template clone. */
            this.attachShadow({ mode: 'open' }).append(styleElement, clone);
        }
    }
    /**
     * Sets the title of the element.
     * @param title
     * @returns
     */
    public setTitle(title: string): HTMLLabelElement {
        this.titleElement.innerHTML = title;
        return this.titleElement;
    }
}
/* Defines the custom element. */
customElements.define('collapsible-content-panel', CollapsibleContentPanel);
