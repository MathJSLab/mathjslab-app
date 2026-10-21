import { markdownHDLConfiguration } from '../../src/MarkdownHDLConfiguration';

const assets = 'http://localhost/lab/hdl/';
test('trusted app supplies browser extensions and policies without storage or environment settings', async () => {
    const configuration = markdownHDLConfiguration(assets);
    expect(configuration.extensions.map((extension) => extension.name)).toEqual(['hdl', 'hdl-interactive']);
    expect(configuration.executionPolicy).toEqual({ hdl: { enabled: true }, 'hdl-interactive': { enabled: true } });
    for (const extension of configuration.extensions) {
        const container = document.createElement('div');
        const fence = extension.fences![0]!;
        await fence.render(container, '{}', { executionPolicy: {} });
        expect(container.querySelector('[role=alert]')).not.toBeNull();
        expect(container.querySelector('[data-hdl-action]')).toBeNull();
        await fence.dispose?.(container);
    }
});
test('tool assets must be same-origin HTTP directories', () => {
    expect(() => markdownHDLConfiguration('https://external.test/hdl/')).toThrow();
    expect(() => markdownHDLConfiguration('file:///hdl/')).toThrow();
    expect(() => markdownHDLConfiguration('http://localhost/hdl')).toThrow();
});

test('VHDL synthesis delegates to the real extension and respects document denial', async () => {
    const configuration = markdownHDLConfiguration(assets);
    const fence = configuration.extensions[0]!.fences!.find((fence) => fence.language === 'vhdl-run')!;
    const container = document.createElement('div');
    const diagnostics: string[] = [];
    await fence.render(container, JSON.stringify({ operation: 'synthesize', top: 'gate', files: [{ name: 'gate.vhd', source: 'entity gate is end;' }] }), {
        executionPolicy: { hdl: { enabled: false } },
        onDiagnostic: (diagnostic) => diagnostics.push(diagnostic.code ?? ''),
    });
    expect(diagnostics).toContain('hdl-execution-disabled');
    expect(container.querySelector('.netlist svg')).toBeNull();
    await fence.dispose?.(container);
    expect(container.childElementCount).toBe(0);
});

test.each(['pt', 'en', 'es'])('VHDL simulation and interactivity delegate to policy-aware extensions in %s', async (locale) => {
    const configuration = markdownHDLConfiguration(assets);
    for (const extension of configuration.extensions) {
        const fence = extension.fences!.find((fence) => fence.language.startsWith('vhdl-'))!;
        const container = document.createElement('div');
        const diagnostics: string[] = [];
        await fence.render(container, '{"operation":"simulate"}', {
            locale,
            executionPolicy: { hdl: { enabled: false }, 'hdl-interactive': { enabled: false } },
            onDiagnostic: (diagnostic) => diagnostics.push(diagnostic.code ?? ''),
        });
        expect(diagnostics).toContain(extension.name === 'hdl' ? 'hdl-execution-disabled' : 'hdl-interactive-disabled');
        expect(container.querySelector('[data-hdl-action], svg')).toBeNull();
        expect(container.textContent).not.toContain('operation: "synthesize"');
        await fence.dispose?.(container);
        expect(container.childElementCount).toBe(0);
    }
});
