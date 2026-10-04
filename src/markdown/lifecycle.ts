const disposalListeners = new WeakMap<object, Set<() => void>>();

export const isMarkdownNodeWithin = (root: ParentNode, candidate: Node): boolean => {
    let current: Node | null = candidate;
    while (current) {
        if (current === root) return true;
        if (current.parentNode) current = current.parentNode;
        else {
            const treeRoot: Node | null = typeof current.getRootNode === 'function' ? current.getRootNode() : null;
            current = treeRoot && 'host' in treeRoot ? (treeRoot as ShadowRoot).host : null;
        }
    }
    return false;
};

/** Subscribe to the lifetime end of an internal Markdown document session. */
export const onMarkdownDocumentDispose = (document: object, listener: () => void): (() => void) => {
    let listeners = disposalListeners.get(document);
    if (!listeners) disposalListeners.set(document, (listeners = new Set()));
    listeners.add(listener);
    return () => {
        listeners?.delete(listener);
        if (listeners?.size === 0) disposalListeners.delete(document);
    };
};

/** Notify subscribers synchronously after the session has cached its disposal promise. */
export const notifyMarkdownDocumentDispose = (document: object): void => {
    const listeners = disposalListeners.get(document);
    disposalListeners.delete(document);
    for (const listener of listeners ?? []) {
        try {
            listener();
        } catch {
            /* A subscriber must not interrupt resource disposal. */
        }
    }
};

/** Run every owned cleanup, reporting failures only after all have settled. */
export const cleanupAll = async (tasks: Iterable<() => void | Promise<void>>): Promise<void> => {
    const errors: unknown[] = [];
    for (const task of tasks) {
        try {
            await task();
        } catch (error) {
            errors.push(error);
        }
    }
    if (errors.length) throw new AggregateError(errors, 'Markdown cleanup failed');
};
