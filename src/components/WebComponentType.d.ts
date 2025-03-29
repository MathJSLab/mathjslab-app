type WebComponentType<T extends HTMLElement> = (new (...args: any[]) => T) & {
    tagName: string;
    elementFields: string[];
    elementPostfix: string[];
    null: T;
    undefined: T;
};
export { type WebComponentType };
export default WebComponentType;
