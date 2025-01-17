export class SimpleNav extends HTMLElement {
    private toggleButton: HTMLButtonElement | null = null;
    private navList: HTMLUListElement | null = null;

    constructor() {
        super();

        // Attach Shadow DOM
        const shadow = this.attachShadow({ mode: 'open' });

        // Load template
        const template = document.getElementById('simple-nav-template') as HTMLTemplateElement;
        if (!template) {
            throw new Error('Template not found');
        }
        const templateContent = template.content.cloneNode(true);
        shadow.appendChild(templateContent);

        // Attach styles (imported via Webpack)
        const style = document.createElement('style');
        /* eslint-disable-next-line @typescript-eslint/no-require-imports */
        style.textContent = require('./simple-nav.styles.scss').default;
        shadow.appendChild(style);

        // Get elements
        this.toggleButton = shadow.querySelector('.simple-nav__toggle');
        this.navList = shadow.querySelector('.simple-nav__list');

        // Bind toggle functionality
        this.toggleButton?.addEventListener('click', this.toggleNav.bind(this));
    }

    private toggleNav(): void {
        this.navList?.parentElement?.classList.toggle('simple-nav--open');
    }
}

// Register the component
customElements.define('simple-nav', SimpleNav);
