import { type WebComponentInterface } from './WebComponentInterface';
import WebComponentType from './WebComponentType';
import setIdFactory from './setIdFactory';
const setIdFirstFactory = <T extends HTMLElement & WebComponentInterface<T>>(component: WebComponentType<T>): ((this: T, id?: string) => void) => {
    return function (this: T, id?: string): void {
        if (id) {
            component.elementFields.forEach((element: string) => {
                const htmlElement = this.element[element];
                htmlElement.id = htmlElement.id.replace(component.tagName, id);
                if (typeof (htmlElement as HTMLLabelElement).htmlFor !== 'undefined') {
                    (htmlElement as HTMLLabelElement).htmlFor = (htmlElement as HTMLLabelElement).htmlFor.replace(component.tagName, id);
                }
            });
            this.superId = id;
            this.setId = setIdFactory(component).bind(this);
        }
    };
};
export { setIdFirstFactory };
export default setIdFirstFactory;
