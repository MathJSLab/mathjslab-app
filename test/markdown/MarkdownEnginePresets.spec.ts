import { createMarkdownEnginePreset, markdownEnginePresets, type MarkdownEnginePreset } from '../../src/markdown/createMarkdownEnginePreset';

describe('named Markdown engine presets', () => {
    test.each([
        ['core', 'core', 'strict'],
        ['gfm', 'gfm', 'sanitized'],
        ['education-basic', 'gfm', 'sanitized'],
        ['education-full', 'gfm', 'sanitized'],
        ['trusted-local', 'gfm', 'trusted'],
        ['safe-remote', 'gfm', 'sanitized'],
    ] as const)('%s keeps syntax and security policy explicit', async (preset, profile, securityMode) => {
        const definition = markdownEnginePresets[preset];
        expect(definition.profile).toBe(profile);
        expect(definition.securityMode).toBe(securityMode);

        const engine = createMarkdownEnginePreset(preset);
        expect(engine.profile).toBe(profile);
        await engine.dispose();
    });

    it('keeps safe remote resource defaults explicit and supports independent overrides', async () => {
        expect(markdownEnginePresets['safe-remote'].resourcePolicy).toEqual({ allowNetwork: true, allowDataUrls: false });

        const engine = createMarkdownEnginePreset('trusted-local', { profile: 'core', securityMode: 'strict', features: [] });
        expect(engine.profile).toBe('core');
        const html = await engine.renderHTML('<script>unsafe()</script>');
        expect(html).toContain('&lt;script&gt;');
        expect(html).not.toContain('<script>');
        await engine.dispose();
    });

    it('registers only the selected educational renderers in a preset', async () => {
        const engine = createMarkdownEnginePreset('education-basic');
        const html = engine.parse('```smiles\nCCO\n```\n\n```dot\ndigraph { a -> b }\n```');
        expect(html).toContain('data-markdown-extension="smiles"');
        expect(html).not.toContain('data-markdown-extension="graphviz"');
        await engine.dispose();
    });

    it('accepts all documented preset names through the typed API', () => {
        const names: MarkdownEnginePreset[] = ['core', 'gfm', 'education-basic', 'education-full', 'trusted-local', 'safe-remote'];
        expect(names).toHaveLength(Object.keys(markdownEnginePresets).length);
    });
});
