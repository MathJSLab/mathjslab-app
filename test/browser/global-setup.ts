import type { FullConfig } from '@playwright/test';
import { createBrowserTestServer } from './server.mjs';

export default async function globalSetup(_config: FullConfig): Promise<() => Promise<void>> {
    const server = await createBrowserTestServer();

    return async () =>
        new Promise<void>((resolveClosed, reject) => {
            server.closeAllConnections();
            server.close((error) => (error ? reject(error) : resolveClosed()));
        });
}
