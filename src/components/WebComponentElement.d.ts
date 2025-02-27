type WebComponentElement<T> = {
    style: HTMLStyleElement;
    container: HTMLElement;
} & { [K in keyof T]: T[K] }; /* Generalization for easy expansions and injections in the Web component. */
export { WebComponentElement };
export default WebComponentElement;
