import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const filename = `${process.env.MARKDOWN_EXAMPLE_SOURCE_ROOT ?? 'node_modules/mathjslab-markdown/example'}/pt/blocos-didaticos.md`;

test('keeps real lesson reference registries isolated with a shared engine', async ({ page }) => {
    test.setTimeout(120_000);
    const source = await readFile(filename, 'utf8');
    await page.goto('/test/browser/fixtures/lifecycle.html');
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
    const diagnostics = await page.evaluate(async (source) => {
        const api = (window as any).markdownTestApi;
        const engine = api.createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'] });
        const diagnostics: any[] = [];
        for (const [id, markdown] of [
            ['first', source],
            ['second', source.replace('{#pitagoras}', '{#isolated-pitagoras}') + '\n\n`{@ref pitagoras}`\n\n```markdown\n{@ref pitagoras}\n```'],
        ]) {
            const viewer = document.createElement('markdown-document') as any;
            viewer.id = id;
            viewer.engine = engine;
            viewer.context = { locale: 'pt', onDiagnostic: (d: any) => diagnostics.push({ document: id, ...d }) };
            viewer.markdown = markdown;
            document.body.append(viewer);
            await viewer.reload();
        }
        return diagnostics;
    }, source);
    const first = page.locator('#first');
    const second = page.locator('#second');
    await expect(first.locator('[data-markdown-reference="pitagoras"] a')).toHaveCount(2);
    await expect(second.locator('[data-markdown-reference="pitagoras"] a')).toHaveCount(0);
    await expect(second.locator('[data-markdown-reference="pitagoras"]')).toHaveText(['{@ref pitagoras}', '{@ref pitagoras}']);
    await expect(second.locator('code a')).toHaveCount(0);
    await expect(second.locator('pre code')).toContainText('{@ref pitagoras}');
    expect(diagnostics.filter((d: any) => d.document === 'first' && d.code.startsWith('cross-reference-'))).toEqual([]);
    expect(diagnostics.some((d: any) => d.document === 'second' && d.code === 'cross-reference-missing')).toBe(true);
    const ids = await page.locator('markdown-document').evaluateAll((hosts) => hosts.map((host) => host.shadowRoot?.querySelector('[data-markdown-block="figure"]')?.id));
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(2);
});
