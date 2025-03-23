import WebComponentInterface from './WebComponentInterface';
import WebComponentType from './WebComponentType';
const constructorFactory = <T extends HTMLElement & WebComponentInterface<T>>(component: WebComponentType<T>, styles: string): ((this: T) => void) => {
    return function (this: T): void {
        /* Find template in main DOM. */
        const template = document.getElementById(`${component.tagName}-template`) as HTMLTemplateElement;
        if (template) {
            /* Clone the template content. */
            const clone = template.content.cloneNode(true) as DocumentFragment;
            /* Creates a <style> element to include the styles. */
            this.element.style = document.createElement('style');
            this.element.style.textContent = styles;
            component.elementFields.forEach((element: string, index: number) => {
                this.element[element] = clone.getElementById(`${component.tagName}-${component.elementPostfix[index]}`)!;
                // console.log(this.constructor.name, element, this.element[element]);
            });
            this.setId(this.superId);
            /* Attach shadow DOM and adds styles to the Shadow DOM before adding the template clone. */
            this.attachShadow({ mode: 'open' }).append(this.element.style, clone);
            if (this.parentElement) {
                this.element.container = this.parentElement;
            }
        }
    };
};
export { constructorFactory };
export default constructorFactory;
