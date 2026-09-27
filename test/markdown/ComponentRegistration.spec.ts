import { MarkdownDocumentElement } from '../../src/markdown-component';

describe('Markdown component registration', () => {
    test('keeps the component module side-effect free and provides explicit registration', async () => {
        expect(customElements.get(MarkdownDocumentElement.tagName)).toBeUndefined();

        const registration = await import('../../src/markdown-component-register');

        expect(registration.MarkdownDocumentElement).toBe(MarkdownDocumentElement);
        expect(customElements.get(MarkdownDocumentElement.tagName)).toBe(MarkdownDocumentElement);
        expect(() => registration.defineMarkdownDocumentElement()).not.toThrow();
    });
});
