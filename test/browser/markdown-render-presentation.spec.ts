import { expect, test } from '@playwright/test';

test('preserves native diagram scale and only uses inline layout for supported renderers', async ({ page }) => {
    await page.goto('/test/browser/fixtures/index.html');
    const result = await page.evaluate(async () => {
        // Exercise the installed package in Shadow DOM, as used by the app.
        const moduleUrl = '/node_modules/mathjslab-markdown/dist/browser/core.js';
        const { createEducationalMarkdownEngine } = await import(moduleUrl);
        document.body.replaceChildren();
        const host = document.createElement('div');
        host.style.width = '900px';
        document.body.append(host);
        const shadow = host.attachShadow({ mode: 'open' });
        const container = document.createElement('div');
        shadow.append(container);
        const engine = createEducationalMarkdownEngine({ features: ['wavedrom', 'smiles', 'graphviz'] });
        const diagnostics: { message: string }[] = [];
        const wave = '{signal:[{name:"clock",wave:"p......"},{name:"data",wave:"x.3.4.x",data:["A","B"]}]}';
        const fence = (language: string, attributes: string, source: string) => `\`\`\`${language} ${attributes}\n${source}\n\`\`\``;
        const source = [
            fence('wavedrom', '', wave),
            fence('wavedrom', '{display=inline}', wave),
            fence('wavedrom', '{width=50%}', wave),
            fence('dot', '{display=inline}', 'digraph {A -> B}'),
            fence('smiles', '', 'CCO'),
            'Inline ethanol :smiles[CCO]{height=2rem} remains inside this paragraph.',
        ].join('\n\n');
        const session = await engine.renderDocument(source, container, { onDiagnostic: (diagnostic: { message: string }) => diagnostics.push(diagnostic) });
        const diagrams = Array.from(container.querySelectorAll<HTMLElement>('.wavedrom'));
        const metrics = diagrams.map((frame) => {
            const svg = frame.querySelector('svg')!;
            const box = svg.getBoundingClientRect();
            const viewBox = svg.viewBox.baseVal;
            return { display: getComputedStyle(frame).display, width: box.width, scaleX: box.width / viewBox.width, scaleY: box.height / viewBox.height };
        });
        const smiles = container.querySelector<SVGSVGElement>('div.smiles svg')!;
        const chemicalScale = smiles.getBoundingClientRect().width / smiles.viewBox.baseVal.width;
        const inline = container.querySelector<HTMLElement>('p > span.smiles')!;
        const graphDisplay = getComputedStyle(container.querySelector('.graphviz')!).display;
        const inlineDisplay = getComputedStyle(inline).display;
        const inlineHeight = inline.querySelector('svg')!.getBoundingClientRect().height;
        host.style.width = '280px';
        const narrowOverflow = diagrams.some((frame) => frame.querySelector('svg')!.getBoundingClientRect().width > frame.getBoundingClientRect().width + 1);
        await session.dispose();
        await engine.dispose();
        return { metrics, chemicalScale, inlineDisplay, inlineHeight, graphDisplay, narrowOverflow, warnings: diagnostics.length };
    });
    expect(result.metrics).toHaveLength(3);
    expect(result.metrics[0]!.scaleX).toBeCloseTo(1, 2);
    expect(result.metrics[1]!.width).toBeCloseTo(result.metrics[0]!.width, 2);
    expect(result.metrics[1]!.display).toBe('block');
    for (const metrics of result.metrics) expect(metrics.scaleX).toBeCloseTo(metrics.scaleY, 2);
    expect(result.graphDisplay).toBe('block');
    expect(result.chemicalScale).toBeCloseTo(1.75, 2);
    expect(result.inlineDisplay).toBe('inline-block');
    expect(result.inlineHeight).toBeCloseTo(32, 1);
    expect(result.narrowOverflow).toBe(false);
    expect(result.warnings).toBe(2);
});
