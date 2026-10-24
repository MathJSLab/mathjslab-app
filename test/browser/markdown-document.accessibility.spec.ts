import { expect, test, type Locator, type Page } from '@playwright/test';

const viewer = (page: Page): Locator => page.locator('markdown-document');

test('navigates fragments, updates the outline and announces the active section', async ({ page }) => {
    await page.goto('/test/browser/fixtures/');
    const document = viewer(page);
    await expect(document).toHaveAttribute('state', 'ready');
    const pageUrl = page.url();

    await document.locator('[part="page-outline"] [data-fragment="local-section"]').click();

    await expect(document.locator('[data-fragment="local-section"]')).toHaveAttribute('aria-current', 'location');
    await expect(document).toHaveAttribute('state', 'ready');
    await expect(document.locator('[part="status"]')).toBeHidden();
    await expect(document.locator('[part="announcer"]')).toHaveText('Section Local section');
    expect(page.url()).toBe(pageUrl);
});

test('supports collection sequence, history, focus and localized accessible names', async ({ page }) => {
    await page.goto('/test/browser/fixtures/?manifest');
    const document = viewer(page);
    await expect(document).toHaveAttribute('state', 'ready');
    await expect(document.locator('h1')).toHaveText('First page');
    await expect(document.locator('[part="collection"]')).toHaveAttribute('aria-label', 'Course contents');
    await expect(document.locator('[data-action="next"]')).toHaveAttribute('aria-keyshortcuts', 'Alt+PageDown');
    await document.evaluate((host) => host.setAttribute('locale', 'pt-BR'));
    await expect(document.locator('[data-action="back"]')).toHaveText('Voltar');
    await expect(document.locator('[part="page-outline"]')).toHaveAttribute('aria-label', 'Nesta página');

    await document.locator('[data-action="next"]').click();
    await expect(document.locator('h1')).toHaveText('Second page');
    await expect(document.locator('[part="announcer"]')).toHaveText('Carregado: Second page');
    await expect.poll(() => document.evaluate((host) => host.shadowRoot?.activeElement?.textContent?.trim())).toBe('Second page');
    await expect(document.locator('[data-page-id="second"]')).toHaveAttribute('aria-current', 'page');

    await document.locator('[part="page-outline"]').evaluate((outline) => ((outline as HTMLElement).style.display = 'none'));
    await document.locator('[data-action="back"]').click();
    await expect(document.locator('h1')).toHaveText('First page');
});

test('handles keyboard shortcuts and arrow navigation within the collection', async ({ page }) => {
    await page.goto('/test/browser/fixtures/?manifest');
    const document = viewer(page);
    await expect(document).toHaveAttribute('state', 'ready');

    const first = document.locator('[data-page-id="first"]');
    const second = document.locator('[data-page-id="second"]');
    await first.focus();
    await page.keyboard.press('ArrowDown');
    await expect(second).toBeFocused();
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
    await page.keyboard.press('End');
    await expect(second).toBeFocused();

    await page.keyboard.press('Alt+PageDown');
    await expect(document.locator('h1')).toHaveText('Second page');
    await document.locator('[part="content"]').focus();
    await page.keyboard.press('Alt+ArrowLeft');
    await expect(document.locator('h1')).toHaveText('First page');
});

test('uses a single-column layout in a narrow host', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 700 });
    await page.goto('/test/browser/fixtures/?manifest');
    const document = viewer(page);
    await expect(document).toHaveAttribute('state', 'ready');

    const columns = await document.evaluate((host) => {
        const layout = host.shadowRoot?.querySelector('[part="layout"]');
        if (!layout) return 0;
        const style = getComputedStyle(layout);
        return style.display === 'grid' ? (style.gridTemplateColumns.match(/(?:^|\s)(?:minmax\([^)]*\)|\d+(?:\.\d+)?px)/g)?.length ?? 0) : 0;
    });
    expect(columns).toBe(1);
});

test('tracks the visible section after user scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 260 });
    await page.goto('/test/browser/fixtures/');
    const document = viewer(page);
    await expect(document).toHaveAttribute('state', 'ready');
    await document.locator('#local-section').evaluate((heading) => {
        heading.scrollIntoView({ block: 'start', behavior: 'instant' });
        window.scrollBy({ top: heading.getBoundingClientRect().top - 10, behavior: 'instant' });
    });

    await expect(document.locator('[data-fragment="local-section"]')).toHaveAttribute('aria-current', 'location');
});

test('uses instant fragment scrolling when reduced motion is requested', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 260 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
        const calls: ScrollIntoViewOptions[] = [];
        const nativeScrollIntoView = Element.prototype.scrollIntoView;
        Object.defineProperty(window, '__scrollCalls', { value: calls });
        Element.prototype.scrollIntoView = function (options?: boolean | ScrollIntoViewOptions): void {
            if (this.id === 'local-section' && typeof options === 'object') calls.push(options);
            nativeScrollIntoView.call(this, options);
        };
    });
    await page.goto('/test/browser/fixtures/');
    const document = viewer(page);
    await expect(document).toHaveAttribute('state', 'ready');
    const target = document.locator('#local-section');
    // Ensure navigation must move the real viewport, with enough trailing room
    // that the page's scroll limit cannot leave the heading below its destination.
    await target.evaluate((heading) => {
        (heading as HTMLElement).style.marginTop = '1200px';
        window.document.body.style.paddingBottom = '1000px';
    });
    await expect(target).not.toBeInViewport();
    const pageUrl = page.url();
    await document.getByRole('link', { name: 'Jump to the local section' }).click();

    // Fragment scrolling is scheduled for the next animation frame, after the
    // component publishes ready state and rebuilds its navigation controls.
    await expect.poll(() => page.evaluate(() => (window as unknown as { __scrollCalls: ScrollIntoViewOptions[] }).__scrollCalls)).toContainEqual({ block: 'start', behavior: 'auto' });
    await target.evaluate(async (heading) => {
        let previous = heading.getBoundingClientRect().top;
        let stableFrames = 0;
        for (let frame = 0; frame < 300; frame++) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            const top = heading.getBoundingClientRect().top;
            stableFrames = Math.abs(top - previous) < 0.25 ? stableFrames + 1 : 0;
            previous = top;
            if (stableFrames >= 15) return;
        }
        throw new Error('Reduced-motion fragment destination did not settle');
    });
    await expect(target).toBeInViewport({ ratio: 1 });
    expect(page.url()).toBe(pageUrl);
});
