import type { Page } from '@playwright/test';

/** The consumer build uses root URLs; keep fixture and dist requests intact. */
export async function routeApplicationAssets(page: Page): Promise<void> {
    const distribution = process.env.MATHJSLAB_APP_TEST_DIST ?? '/dist';
    await page.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (distribution !== '/dist' && url.origin === 'http://127.0.0.1:4173' && url.pathname.startsWith('/dist/')) {
            url.pathname = distribution + url.pathname.slice('/dist'.length);
            await route.continue({ url: url.href });
            return;
        }
        if (
            url.origin === 'http://127.0.0.1:4173' &&
            !url.pathname.startsWith('/dist/') &&
            !url.pathname.startsWith('/test/') &&
            (/\.(?:js|css)$/.test(url.pathname) || url.pathname.startsWith('/example/'))
        ) {
            url.pathname = `${distribution}${url.pathname}`;
            await route.continue({ url: url.href });
        } else await route.fallback();
    });
}
