import { createBrowserTestServer } from '../test/browser/server.mjs';
const port = Number.parseInt(process.env.PORT ?? '4173', 10);
createBrowserTestServer({ port }).then(
    () => console.log(`Markdown browser test server: http://127.0.0.1:${port}`),
    (error) => {
        console.error(error);
        process.exitCode = 1;
    },
);
