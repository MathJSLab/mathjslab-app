import { expect, test } from '@playwright/test';

test('loads the standalone ESM bundle and renders a relative Markdown document', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto('/test/browser/fixtures/');

    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await expect(viewer.locator('h1')).toHaveText('Browser lesson');
    await expect(viewer.locator('img')).toHaveAttribute('src', 'http://127.0.0.1:4173/test/browser/fixtures/pixel.svg');
    await expect(viewer.locator('[part="page-outline"]')).toBeVisible();
    expect(pageErrors).toEqual([]);
});

test('keeps Markdown navigation inside the component', async ({ page }) => {
    await page.goto('/test/browser/fixtures/');
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    const pageUrl = page.url();

    await viewer.getByRole('link', { name: 'Next lesson' }).click();
    await expect(viewer.locator('h1')).toHaveText('Next lesson');
    expect(page.url()).toBe(pageUrl);
});

test('gives the document the flexible column when only the page outline is visible', async ({ page }) => {
    await page.goto('/test/browser/fixtures/');
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');
    await viewer.evaluate((element) => {
        const container = element.parentElement;
        if (container) container.style.width = '70rem';
    });

    const widths = await viewer.evaluate((element) => {
        const main = element.shadowRoot!.querySelector<HTMLElement>('[part="main"]')!;
        const outline = element.shadowRoot!.querySelector<HTMLElement>('[part="page-outline"]')!;
        return { main: main.getBoundingClientRect().width, outline: outline.getBoundingClientRect().width };
    });

    expect(widths.main).toBeGreaterThan(widths.outline * 2);
});

test('supports hidden and inline page outlines without narrowing the document', async ({ page }) => {
    await page.goto('/test/browser/fixtures/');
    const viewer = page.locator('markdown-document');
    await expect(viewer).toHaveAttribute('state', 'ready');

    const hidden = await viewer.evaluate((element) => {
        element.setAttribute('outline', 'hidden');
        const outline = element.shadowRoot!.querySelector<HTMLElement>('[part="page-outline"]')!;
        const main = element.shadowRoot!.querySelector<HTMLElement>('[part="main"]')!;
        return { outline: getComputedStyle(outline).display, main: main.getBoundingClientRect().width, host: element.getBoundingClientRect().width };
    });
    expect(hidden.outline).toBe('none');
    expect(hidden.main).toBe(hidden.host);

    const inline = await viewer.evaluate((element) => {
        element.setAttribute('outline', 'inline');
        const layout = element.shadowRoot!.querySelector<HTMLElement>('[part="layout"]')!;
        const main = element.shadowRoot!.querySelector<HTMLElement>('[part="main"]')!;
        const toolbar = element.shadowRoot!.querySelector<HTMLElement>('[part="toolbar"]')!;
        const outline = element.shadowRoot!.querySelector<HTMLElement>('[part="page-outline"]')!;
        const content = element.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!;
        return {
            columns: getComputedStyle(layout).gridTemplateColumns.split(' ').length,
            mainDisplay: getComputedStyle(main).display,
            toolbarTop: toolbar.getBoundingClientRect().top,
            outlineTop: outline.getBoundingClientRect().top,
            contentTop: content.getBoundingClientRect().top,
            contentWidth: content.getBoundingClientRect().width,
            hostWidth: element.getBoundingClientRect().width,
        };
    });
    expect(inline.columns).toBe(1);
    expect(inline.mainDisplay).toBe('contents');
    expect(inline.toolbarTop).toBeLessThanOrEqual(inline.outlineTop);
    expect(inline.outlineTop).toBeLessThanOrEqual(inline.contentTop);
    expect(inline.contentWidth).toBe(inline.hostWidth);
});
