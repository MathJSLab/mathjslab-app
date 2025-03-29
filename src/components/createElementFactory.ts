import { type WebComponentInterface } from './WebComponentInterface';
import WebComponentType from './WebComponentType';
const createElementFactory = <T extends HTMLElement>(component: WebComponentType<T>): ((id?: string) => T & WebComponentInterface<T>) => {
    return (id?: string): T & WebComponentInterface<T> => {
        const element = document.createElement(component.tagName) as T & WebComponentInterface<T>;
        if (id) {
            element.setId(id);
        }
        return element;
    };
};
export { createElementFactory };
export default createElementFactory;
