import { test, expect } from '@playwright/test';
import { routeApplicationAssets } from './helpers/application';

test('browses nested examples with keyboard and fits desktop/mobile themes', async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    await routeApplicationAssets(page);
    await page.goto('/dist/pt/index.html?lang=pt');
    const root = page.locator('#example-graphics');
    await expect(root).toBeAttached({ timeout: 30_000 });
    await page.locator('#examples').locator('label').click();
    await expect(root).toBeVisible();
    const editor = page.locator('batch-code-editor textarea');
    // Root buttons appear before the initial asynchronous file load completes.
    await expect(editor).toHaveValue(/Delta = b\^2-4\*a\*c/);
    await editor.fill('conteúdo editado');
    const menu = page.locator('.example-menu');
    for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 844 });
        for (const theme of ['light', 'dark']) {
            await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
            await root.click();
            await expect(menu.getByRole('button', { name: /^Funções/ })).toBeFocused();
            expect(await menu.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
            await page.keyboard.press('Enter');
            await expect(menu).toContainText('Gráficos / Funções');
            await expect(editor).toHaveValue('conteúdo editado');
            expect(await menu.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
            const bounds = await menu.boundingBox();
            expect(bounds!.x).toBeGreaterThanOrEqual(0);
            expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
            expect(bounds!.y).toBeGreaterThanOrEqual(0);
            expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
            await page.screenshot({ path: testInfo.outputPath(`examples-${width}-${theme}.png`) });
            await menu.getByRole('button', { name: 'Voltar', exact: true }).click();
            await expect(menu.getByRole('button', { name: /^Funções/ })).toBeFocused();
            await page.keyboard.press('Escape');
            await expect(menu).toBeHidden();
            await expect(root).toBeFocused();
        }
    }
    await root.click();
    await menu.getByRole('button', { name: /^Funções/ }).click();
    const source = page.waitForResponse((response) => response.url().endsWith('/example/pt/graphics/functions/plot-trig.m'));
    await menu.getByRole('button', { name: 'Graficar uma função', exact: true }).click();
    expect((await source).ok()).toBe(true);
    await expect(menu).toBeHidden();
    await expect(editor).not.toHaveValue('conteúdo editado');
    await expect(root).toBeFocused();
});

test('scrolls long directories within a narrow viewport and keeps content after a failed load', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const children = Object.fromEntries(
        Array.from({ length: 80 }, (_, index) => [
            `entry-${index}`,
            {
                file: `entry-${index}.m`,
                caption: `Example ${index} with a longer caption`,
                description: 'Example',
            },
        ]),
    );
    const manifest = {
        initial: { file: 'initial.m', caption: 'Initial', description: 'Initial example' },
        list: { directory: 'list', caption: 'List', description: 'Long directory', children },
    };
    await page.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname === '/example/example.json') {
            await route.fulfill({ json: manifest });
        } else if (url.pathname === '/example/initial.m') {
            await route.fulfill({ contentType: 'text/plain', body: '1;' });
        } else if (url.pathname.startsWith('/example/list/')) {
            await route.fulfill({ status: 503, body: 'Unavailable' });
        } else if (url.origin === 'http://127.0.0.1:4173' && !url.pathname.startsWith('/dist/') && /\.(?:js|css)$/.test(url.pathname)) {
            url.pathname = `/dist${url.pathname}`;
            await route.continue({ url: url.href });
        } else await route.fallback();
    });
    await page.goto('/dist/en/index.html?lang=en');
    const root = page.locator('#example-list');
    await expect(root).toBeAttached();
    await page.locator('#examples').locator('label').click();
    await root.click();
    const menu = page.locator('.example-menu');
    await expect(menu).toBeVisible();
    expect(await menu.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    expect(await menu.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    const bounds = await menu.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
    await menu.getByRole('button', { name: 'Example 79 with a longer caption', exact: true }).click();
    await expect(page.locator('.example-status')).toHaveText('Unable to load the example. Please try again.');
    await expect(menu).toBeVisible();
    await expect(page.locator('batch-code-editor textarea')).toHaveValue('1;');
    await page.keyboard.press('Escape');
    await expect(root).toBeFocused();
});

test('loads new numerical and graphical exercises from the grouped catalogue', async ({ page }) => {
    await routeApplicationAssets(page);
    await page.goto('/dist/pt/index.html?lang=pt');
    const methods = page.locator('#example-numerical-methods');
    await expect(methods).toBeAttached();
    await page.locator('#examples').locator('label').click();
    const menu = page.locator('.example-menu');
    await methods.click();
    await menu.getByRole('button', { name: /^Integração e derivadas/ }).click();
    await menu.getByRole('button', { name: 'Regra dos trapézios composta', exact: true }).click();
    await expect(menu).toBeHidden();
    await expect(page.locator('batch-code-editor textarea')).toHaveValue(/example_check = absolute_error < 0\.0002/);
    await expect(page.locator('command-prompt .bad')).toHaveCount(0);
    await page.locator('#example-graphics').click();
    await menu.getByRole('button', { name: /^Funções/ }).click();
    await menu.getByRole('button', { name: 'Amostras de uma parábola', exact: true }).click();
    await expect(menu).toBeHidden();
    await expect(page.locator('batch-code-editor textarea')).toHaveValue(/% Amostras de uma parábola/);
    await expect(page.locator('command-prompt .bad')).toHaveCount(0);
    await expect(page.locator('.js-plotly-plot').first()).toBeVisible();
});

test('loads signal-processing and optimization exercises from the new categories', async ({ page }) => {
    await routeApplicationAssets(page);
    await page.goto('/dist/pt/index.html?lang=pt');
    const signals = page.locator('#example-signal-processing');
    await expect(signals).toBeAttached();
    await page.locator('#examples').locator('label').click();
    const menu = page.locator('.example-menu');
    await signals.click();
    await menu.getByRole('button', { name: /^Tempo e frequência/ }).click();
    await menu.getByRole('button', { name: 'DFT manual de quatro pontos', exact: true }).click();
    await expect(menu).toBeHidden();
    await expect(page.locator('batch-code-editor textarea')).toHaveValue(/% DFT manual de quatro pontos/);
    await expect(page.locator('command-prompt .bad')).toHaveCount(0);
    await page.locator('#example-optimization').click();
    await menu.getByRole('button', { name: /^Busca e descida/ }).click();
    await menu.getByRole('button', { name: 'Busca pela seção áurea', exact: true }).click();
    await expect(menu).toBeHidden();
    await expect(page.locator('batch-code-editor textarea')).toHaveValue(/example_check = abs\(estimate-1\.2\) < 0\.00001/);
    await expect(page.locator('command-prompt .bad')).toHaveCount(0);
});

test('constructs and uses objects through the object-oriented examples menu', async ({ page }) => {
    await routeApplicationAssets(page);
    await page.goto('/dist/pt/index.html?lang=pt');
    const programming = page.locator('#example-programming');
    await expect(programming).toBeAttached();
    await page.locator('#examples').locator('label').click();
    const menu = page.locator('.example-menu');
    for (const caption of ['Construtor de retângulo', 'Contador handle compartilhado', 'Composição de objetos']) {
        await programming.click();
        await menu.getByRole('button', { name: /^Programação orientada a objetos/ }).click();
        await menu.getByRole('button', { name: caption, exact: true }).click();
        await expect(menu).toBeHidden();
        await expect(page.locator('batch-code-editor textarea')).toHaveValue(new RegExp(`% ${caption}`));
        await expect(page.locator('command-prompt .bad')).toHaveCount(0);
    }
});

test('loads algorithms, data structures and the four newest categories with source references', async ({ page }) => {
    test.setTimeout(90_000);
    await routeApplicationAssets(page);
    await page.goto('/dist/pt/index.html?lang=pt');
    await expect(page.locator('#example-machine-learning')).toBeAttached({ timeout: 30_000 });
    await page.locator('#examples').locator('label').click();
    const menu = page.locator('.example-menu');
    const editor = page.locator('batch-code-editor textarea');
    await expect(editor).toHaveValue(/Delta = b\^2-4\*a\*c/);
    for (const [root, directory, caption] of [
        ['programming', 'Algoritmos', 'Mochila zero-um'],
        ['programming', 'Estruturas de dados', 'Tabela hash com sondagem linear'],
        ['machine-learning', 'Modelos elementares', 'K-means unidimensional'],
        ['computational-geometry', 'Geometria plana', 'Centroide de polígono'],
        ['image-processing', 'Imagens como matrizes', 'Dilatação binária em cruz'],
        ['simulation', 'Modelos discretos', 'Fila de eventos de um servidor'],
    ] as const) {
        await editor.fill('conteúdo preservado ao navegar');
        await page.locator(`#example-${root}`).click();
        await menu.getByRole('button', { name: new RegExp(`^${directory}`) }).click();
        await expect(editor).toHaveValue('conteúdo preservado ao navegar');
        expect(await menu.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        await menu.getByRole('button', { name: caption, exact: true }).click();
        await expect(menu).toBeHidden();
        await expect(editor).toHaveValue(new RegExp(`% ${caption}`));
        await expect(editor).toHaveValue(/% Referência temática .*https:\/\//);
        await expect(page.locator('command-prompt .bad')).toHaveCount(0);
    }
});

test('opens package Markdown lessons through the real command in each locale', async ({ page }) => {
    test.setTimeout(120_000);
    await routeApplicationAssets(page);
    const rawBase = 'https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/';
    const requested: string[] = [];
    await page.route(`${rawBase}**`, async (route) => {
        const url = route.request().url();
        requested.push(url);
        if (url.endsWith('/resources/pixel.svg')) {
            await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="green"/></svg>' });
        } else {
            await route.fulfill({ contentType: 'text/markdown', body: '# Remote package lesson\n\n![Lesson resource](resources/pixel.svg)\n' });
        }
    });
    for (const [locale, group, caption, filename] of [
        ['en', 'Music', 'The Mathematics and Physics of Music: From Pythagoras to Equal Temperament', 'music-pitagoras.md'],
        ['es', 'Música', 'Las matemáticas y la física de la música: de Pitágoras al temperamento igual', 'music-pitagoras.md'],
        ['pt', 'Música', 'A matemática e a física da música: de Pitágoras ao temperamento igual', 'music-pitagoras.md'],
        ['en', 'Mathematics and geometry', 'Arithmetic and geometric sequences', 'progressoes.md'],
        ['es', 'Matemáticas y geometría', 'Progresiones aritméticas y geométricas', 'progressoes.md'],
        ['pt', 'Matemática e geometria', 'Progressões aritméticas e geométricas', 'progressoes.md'],
    ] as const) {
        await page.goto(`/dist/${locale}/index.html?lang=${locale}`);
        await expect(page.locator('command-prompt .js-plotly-plot .main-svg').first()).toBeVisible({ timeout: 30_000 });
        const root = page.locator('#example-markdown');
        await expect(root).toBeAttached({ timeout: 30_000 });
        const editor = page.locator('batch-code-editor textarea');
        await expect(editor).toHaveValue(/Delta = b\^2-4\*a\*c/);
        await page.locator('#examples').locator('label').click();
        await root.click();
        const menu = page.locator('.example-menu');
        await menu.getByRole('button', { name: new RegExp(`^${group}`) }).click();
        const exampleResponse = page.waitForResponse((response) => new URL(response.url()).pathname.endsWith(`/${filename.replace('.md', '.m')}`));
        await menu.getByRole('button', { name: caption, exact: true }).click();
        const response = await exampleResponse;
        expect(response.ok()).toBe(true);
        expect(await response.finished()).toBeNull();
        await expect(menu).toBeHidden();
        const sourceUrl = `${rawBase}${locale}/${filename}`;
        await expect(editor).toHaveValue(new RegExp(`/example/${locale}/${filename.replace('.', '\\.')}`));
        const viewer = page.locator(`markdown-document[src="${sourceUrl}"]`);
        await expect(viewer).toHaveAttribute('state', 'ready', { timeout: 30_000 });
        await expect(viewer.getByRole('heading', { name: 'Remote package lesson' })).toBeVisible();
        await expect.poll(() => requested.includes(`${rawBase}${locale}/resources/pixel.svg`)).toBe(true);
        await expect(page.locator('command-prompt .bad')).toHaveCount(0);
    }
});
