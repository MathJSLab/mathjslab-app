/// <reference types="jest" />
import { createEducationalMarkdownEngine, educationalMarkdownFeatures } from '../../src/markdown/createEducationalMarkdownEngine';

describe('createEducationalMarkdownEngine', () => {
    it('registers only selected educational fences', async () => {
        const engine = createEducationalMarkdownEngine({ features: ['mermaid', 'smiles'] });
        const html = engine.parse('```mermaid\ngraph TD; A-->B\n```\n\n```dot\ndigraph { a -> b }\n```');
        expect(html).toContain('data-markdown-extension="mermaid"');
        expect(html).not.toContain('data-markdown-extension="graphviz"');
        await engine.dispose();
    });

    it('supports the complete catalog and removes duplicate selections', async () => {
        expect(educationalMarkdownFeatures).toHaveLength(9);
        const engine = createEducationalMarkdownEngine({ features: ['graphviz', 'graphviz'] });
        expect(() => engine.parse('```dot\ndigraph { a -> b }\n```')).not.toThrow();
        await engine.dispose();
    });
});
