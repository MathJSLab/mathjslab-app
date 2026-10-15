import type { Server } from 'node:http';

export function createBrowserTestServer(options?: { port?: number }): Promise<Server>;
