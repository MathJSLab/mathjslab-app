import { jest } from '@jest/globals';
import { registerCommandResource, releaseCommandResources } from '../../src/CommandOutputResources';

test('releases plots cleared inside a shared component shadow root', async () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const node = document.createElement('div');
    shadow.append(node);
    document.body.append(host);
    const dispose = jest.fn(async () => {});
    registerCommandResource(node, dispose);
    shadow.replaceChildren();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(dispose).toHaveBeenCalledTimes(1);
    await releaseCommandResources(node);
    expect(dispose).toHaveBeenCalledTimes(1);
    host.remove();
});

test('releases plots when a containing shadow component disconnects', async () => {
    const outer = document.createElement('div');
    const shadow = outer.attachShadow({ mode: 'open' });
    const inner = document.createElement('div');
    const node = document.createElement('div');
    inner.attachShadow({ mode: 'open' }).append(node);
    shadow.append(inner);
    document.body.append(outer);
    const dispose = jest.fn(async () => {});
    registerCommandResource(node, dispose);
    outer.remove();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(dispose).toHaveBeenCalledTimes(1);
});
