import { v4 as uuid } from 'uuid';

import styles from './math-prompt.styles.scss';

export interface MathPromptElements {
    container: HTMLDivElement;
    box: HTMLDivElement;
    input: HTMLTextAreaElement;
    output: HTMLTableCellElement;
}

/**
 * # MathPrompt Web Component
 */
class MathPrompt extends HTMLElement {
    protected element: MathPromptElements;
    /* Web Component constructor. */
    public constructor() {
        super();
        /* Find template in main DOM. */
        const template = document.getElementById('math-prompt-template') as HTMLTemplateElement;
        if (template) {
            /* Creates uuid for component id */
            if (!this.id) {
                this.id = uuid();
            }
            /* Clone the template content. */
            const clone = template.content.cloneNode(true) as DocumentFragment;
            /* Creates a <style> element to include the styles. */
            const styleElement = document.createElement('style') as HTMLStyleElement;
            styleElement.textContent = styles;
            /* Replace identifiers in the cloned template with the instance id. */
            this.element.container = clone.getElementById('math-prompt-panel') as HTMLDivElement;
            this.element.box = clone.getElementById('math-prompt-output-panel') as HTMLDivElement;
            this.element.input = clone.getElementById('math-prompt-input') as HTMLTextAreaElement;
            this.element.output = clone.getElementById('math-prompt-output') as HTMLTableCellElement;
            for (const element in this.element) {
                this.element[element as keyof MathPromptElements].id = `${this.element[element as keyof MathPromptElements].id}-${this.id}`;
            }
            /* Attach shadow DOM and adds styles to the Shadow DOM before adding the template clone. */
            this.attachShadow({ mode: 'open' }).append(styleElement, clone);
        }
    }
    public static create(): MathPrompt {
        return new MathPrompt();
    }
    public get container(): HTMLDivElement {
        return this.element.container;
    }
    public get input(): HTMLTextAreaElement {
        return this.element.input;
    }
    public get box(): HTMLDivElement {
        return this.element.box;
    }
    public get output(): HTMLTableCellElement {
        return this.element.output;
    }
}
/* Defines the custom element. */
customElements.define('math-prompt', MathPrompt);
