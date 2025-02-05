export default function createHTMLElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    parent?: HTMLElement | null,
    id?: string | null,
    className?: string | null,
): HTMLElementTagNameMap[K] {
    if (arguments.length == 1) {
        return document.createElement(tag);
    } else {
        const result = document.createElement(tag);
        if (parent) {
            parent.append(result);
        }
        if (arguments.length > 2 && id) result.setAttribute('id', id);
        if (arguments.length > 3 && className) result.setAttribute('class', className);
        return result;
    }
}
