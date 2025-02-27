import WebComponentInterface from './WebComponentInterface';
import WebComponentType from './WebComponentType';
const defineFactory = <T extends HTMLElement & WebComponentInterface<T>>(component: WebComponentType<T>): (() => void) => {
    return function () {
        customElements.define(component.tagName, component);
    };
};
export { defineFactory };
export default defineFactory;
