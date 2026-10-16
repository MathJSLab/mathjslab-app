import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';

jest.unstable_mockModule('../../src/appEngine', () => ({ appEngine: { interpreter: {} } }));

describe('application educational Markdown integration', () => {
    test('registers all educational syntax without importing optional renderer libraries', async () => {
        const { Markdown } = await import('../../src/Markdown');
        const source =
            ':::: theorem Claim {#claim}\n\nText.\n\n::: solution\n\nAnswer.\n\n:::\n\n::::\n\n{@ref claim} [@source]\n\n' +
            ['wavedrom', 'geometry', 'tikz', 'circuitikz', 'bibtex', 'csl-json', 'bibliography'].map((language) => '\x60\x60\x60' + language + '\n{}\n\x60\x60\x60').join('\n\n');
        const container = document.createElement('div');
        container.innerHTML = Markdown.parse(source);
        expect(container.querySelector('[data-markdown-block="theorem"]')).not.toBeNull();
        expect(container.querySelector('details[data-markdown-block="solution"]')).not.toBeNull();
        expect(container.querySelector('[data-markdown-reference]')).not.toBeNull();
        expect(container.querySelector('[data-markdown-citation]')).not.toBeNull();
        for (const language of ['wavedrom', 'geometry', 'tikz', 'circuitikz', 'bibtex', 'csl-json', 'bibliography'])
            expect(container.querySelector('[data-markdown-language="' + language + '"]')).not.toBeNull();
    });

    test.each(['pt', 'en', 'es'])('renders the unchanged %s lesson with nested blocks and links', async (locale) => {
        const { Markdown } = await import('../../src/Markdown');
        const source = readFileSync(new URL('../fixtures/markdown/educational/' + locale + '/blocos-didaticos.md', import.meta.url), 'utf8');
        const container = document.createElement('div');
        const diagnostics: unknown[] = [];
        const session = await Markdown.renderDocument(source, container, { locale, onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) });
        expect(diagnostics).toEqual([]);
        expect(container.querySelectorAll('[data-markdown-block]')).toHaveLength(5);
        expect(container.querySelectorAll('[data-markdown-reference] a')).toHaveLength(4);
        expect(container.querySelector('details')?.hasAttribute('open')).toBe(false);
        await session.dispose();
    });
});
