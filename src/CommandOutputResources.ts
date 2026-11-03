const disposers = new WeakMap<Element, () => Promise<void>>();

/**
 * Register a mounted rich-output node and its asynchronous disposer once.
 * Containing shadow roots are observed so shared UI cleanup also releases resources.
 */
export function registerCommandResource(node: Element, dispose: () => Promise<void>): void {
    // The shared components may clear or disconnect without app-specific hooks.
    // Observe every containing root, including nested shadow trees.
    const observer = new MutationObserver(() => {
        if (!node.isConnected) void releaseCommandResources(node);
    });
    let root: Node = node.getRootNode();
    while (true) {
        observer.observe(root, { childList: true, subtree: true });
        if (!(root instanceof ShadowRoot)) break;
        root = root.host.getRootNode();
    }
    node.setAttribute('data-command-resource', '');
    disposers.set(node, async () => {
        observer.disconnect();
        await dispose();
    });
}

/** Release registered descendants exactly once, awaiting their pending mounts and cleanup. */
export async function releaseCommandResources(root: ParentNode): Promise<void> {
    const nodes = [...root.querySelectorAll('[data-command-resource]')];
    if (root instanceof Element && root.hasAttribute('data-command-resource')) nodes.push(root);
    await Promise.all(
        nodes.map(async (node) => {
            const dispose = disposers.get(node);
            disposers.delete(node);
            node.removeAttribute('data-command-resource');
            await dispose?.();
        }),
    );
}
