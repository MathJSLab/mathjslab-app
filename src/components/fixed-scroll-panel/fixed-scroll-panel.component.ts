import styles from './fixed-scroll-panel.styles.scss';

/**
 * # FixedScrollPanel Web Component
 */
export class FixedScrollPanel extends HTMLElement {
    public parentElement: HTMLElement;
    protected wrapperElement: HTMLDivElement;
    /* Panel title */
    protected titleElement: HTMLHeadingElement;
    /* Web Component constructor. */
    public constructor() {
        super();
        /* Find template in main DOM. */
        const template = document.getElementById('fixed-scroll-panel-template') as HTMLTemplateElement;
        if (template) {
            /* Clone the template content. */
            const clone = template.content.cloneNode(true) as DocumentFragment;
            /* Creates a <style> element to include the styles. */
            const styleElement = document.createElement('style') as HTMLStyleElement;
            styleElement.textContent = styles;
            this.wrapperElement = clone.getElementById('fixed-scroll-panel-wrapper') as HTMLDivElement;
            this.titleElement = clone.getElementById('fixed-scroll-panel-title') as HTMLHeadingElement;
            /* Attach shadow DOM and adds styles to the Shadow DOM before adding the template clone. */
            this.attachShadow({ mode: 'open' }).append(styleElement, clone);
        }
    }
    public set parent(value: HTMLElement) {
        this.parentElement = value;
    }
    public get parent(): HTMLElement {
        return this.parentElement;
    }
    public set title(value: string) {
        this.titleElement.innerHTML = value;
    }
    public get title(): string {
        return this.titleElement.innerHTML;
    }
    public resize(event?: Event): void {
        let Y = window.scrollY - this.parentElement.offsetTop + window.innerHeight * 0.025;
        const maxY = this.parentElement.offsetHeight - this.wrapperElement.offsetHeight;
        if (Y < 0) {
            Y = 0;
        } else if (Y > maxY) {
            Y = maxY;
        }
        this.wrapperElement.style.top = Y + 'px';
        this.wrapperElement.style.left = this.parentElement.offsetWidth + 'px';
        this.wrapperElement.style.height = Math.min(this.parentElement.offsetHeight, window.innerHeight) * 0.9 + 'px';
    }
}
/* Defines the custom element. */
customElements.define('fixed-scroll-panel', FixedScrollPanel);
