import WebComponentInterface from './WebComponentInterface';
const setContainerFactory = <T extends HTMLElement & WebComponentInterface<T>>(): ((this: T, element: HTMLElement) => void) => {
    return function (this: T, element: HTMLElement): void {
        if (this.element.container) {
            if (element !== this.element.container) {
                if (this.element.container.parentElement) {
                    this.element.container.parentElement.replaceChild(element, this.element.container);
                }
                this.element.container = element;
            }
        } else {
            this.element.container = element;
            element.append(this);
        }
    };
};
export { setContainerFactory };
export default setContainerFactory;
