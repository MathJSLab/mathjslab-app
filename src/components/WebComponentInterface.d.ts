interface WebComponentInterface<T> {
    element: WebComponentElement<T>;
    superId: string;
    id: string;
    setId: (id?: string) => void;
    container: HTMLElement;
}
export { type WebComponentInterface };
