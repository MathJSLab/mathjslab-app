import { type WebComponentInterface } from './WebComponentInterface';
import WebComponentType from './WebComponentType';
const setIdFactory = <T extends HTMLElement & WebComponentInterface<T>>(component: WebComponentType<T>): ((this: T, id?: string) => void) => {
    return function (this: T, id?: string): void {
        if (id && id !== this.superId) {
            component.elementFields.forEach((element: string) => {
                const htmlElement = this.element[element];
                htmlElement.id = htmlElement.id.replace(this.superId, id);
                if (typeof (htmlElement as HTMLLabelElement).htmlFor !== 'undefined') {
                    (htmlElement as HTMLLabelElement).htmlFor = (htmlElement as HTMLLabelElement).htmlFor.replace(component.tagName, id);
                }
            });
            this.superId = id;
        }
    };
};
export { setIdFactory };
export default setIdFactory;
