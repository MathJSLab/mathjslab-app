/// <reference types="jest" />
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { abcExtension } from '../../src/markdown/extensions/abc/extension';
import { graphvizExtension } from '../../src/markdown/extensions/graphviz/extension';
import { mapsExtension } from '../../src/markdown/extensions/maps/extension';
import { mathJSLabExtension } from '../../src/markdown/extensions/mathjslab/extension';
import { mermaidExtension } from '../../src/markdown/extensions/mermaid/extension';
import { model3DExtension } from '../../src/markdown/extensions/model-3d/extension';
import { molecule3DExtension } from '../../src/markdown/extensions/molecule-3d/extension';
import { smilesExtension } from '../../src/markdown/extensions/smiles/extension';
import { vegaLiteExtension } from '../../src/markdown/extensions/vega-lite/extension';
import { verovioExtension } from '../../src/markdown/extensions/verovio/extension';
import { MarkdownEngine } from '../../src/MarkdownEngine';

type CorpusDocument = { file: string; extension: string; fences: string[]; source?: string };
type Corpus = { documents: CorpusDocument[]; combined: string[]; conflicts: string[] };

const corpusRoot = path.dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(fs.readFileSync(path.join(corpusRoot, 'corpus.json'), 'utf8')) as Corpus;
const read = (relative: string): string => fs.readFileSync(path.join(corpusRoot, relative), 'utf8');
const appEngine = (): MarkdownEngine =>
    new MarkdownEngine({
        profile: 'gfm',
        extensions: [
            mermaidExtension(),
            smilesExtension(),
            graphvizExtension(),
            abcExtension(),
            verovioExtension(),
            vegaLiteExtension(),
            mapsExtension(),
            molecule3DExtension(),
            model3DExtension(),
            mathJSLabExtension({
                toMathML: (source, display) => `<math data-mathjslab="${display}">${source}</math>`,
                createSession: async () => ({ parse: () => ({ statements: [] }), execute: () => ({ status: 'success' }) }),
            }),
        ],
    });

describe('Markdown compatibility corpus', () => {
    it.each(corpus.documents)('registers every fixture fence in $file', ({ file, extension, fences }) => {
        const container = document.createElement('div');
        container.innerHTML = appEngine().parse(read(file));
        for (const language of fences) {
            expect(container.querySelector(`[data-markdown-language="${language}"]`)).not.toBeNull();
        }
        if (fences.length) expect(container.querySelector(`[data-markdown-extension="${extension}"]`)).not.toBeNull();
    });

    it('keeps one fixture for every registered educational fence', () => {
        const expected = [
            'abc',
            'cif',
            'cube',
            'dot',
            'geojson',
            'gltf',
            'graphviz',
            'math',
            'mathjslab',
            'mei',
            'mermaid',
            'mmcif',
            'mol2',
            'musicxml',
            'obj',
            'pdb',
            'sdf',
            'smiles',
            'stl',
            'topojson',
            'vega-lite',
            'xyz',
        ];
        const present = [...new Set(corpus.documents.flatMap(({ fences }) => fences))].sort();
        expect(present).toEqual(expected);
    });

    it('exercises non-fence GFM extensions and both mathematical delimiter families', () => {
        const engine = appEngine();
        const parse = (file: string): HTMLDivElement => {
            const container = document.createElement('div');
            container.innerHTML = engine.parse(read(file));
            return container;
        };
        const headings = parse('extensions/heading-ids.md');
        expect(Array.from(headings.querySelectorAll('h1'), ({ id }) => id)).toEqual(['repeated-heading', 'repeated-heading-1']);
        expect(parse('extensions/syntax-highlight.md').querySelectorAll('pre code.hljs')).toHaveLength(3);
        expect(parse('extensions/mathjax.md').querySelectorAll('.mathjax-pending')).toHaveLength(4);
        const mathjslab = parse('extensions/mathjslab.md');
        expect(mathjslab.querySelectorAll('math[data-mathjslab]')).toHaveLength(3);
        expect(mathjslab.querySelector('[data-markdown-language="mathjslab"]')).not.toBeNull();
    });

    it('records authoritative sources for adapted official examples', () => {
        const sourced = corpus.documents.filter(({ source }) => source);
        expect(sourced.map(({ extension }) => extension).sort()).toEqual(['abc-music', 'graphviz', 'maps', 'vega-lite']);
        for (const fixture of sourced) expect(new URL(fixture.source!).protocol).toBe('https:');
    });

    it('keeps adapted official payloads valid in their standard textual formats', () => {
        const engine = appEngine();
        const sources = (file: string, language: string): string[] => {
            const container = document.createElement('div');
            container.innerHTML = engine.parse(read(file));
            return Array.from(container.querySelectorAll(`[data-markdown-language="${language}"] .markdown-extension-source`), (node) => node.textContent ?? '');
        };
        expect(sources('extensions/abc.md', 'abc')[0]).toMatch(/^X:1[\s\S]*^K:D$/m);
        expect(sources('extensions/graphviz.md', 'dot')[0]).toMatch(/^digraph G \{[\s\S]*\}$/);
        for (const language of ['geojson', 'topojson']) expect(() => JSON.parse(sources('extensions/maps.md', language)[0]!)).not.toThrow();
        for (const source of sources('extensions/vega-lite.md', 'vega-lite')) expect(() => JSON.parse(source)).not.toThrow();
    });

    it.each(corpus.combined)('parses combined document %s without losing registered blocks', (file) => {
        const container = document.createElement('div');
        container.innerHTML = appEngine().parse(read(file));
        expect(container.querySelector('h1')).not.toBeNull();
        expect(container.textContent).not.toContain('[object Object]');
        if (file.includes('all-extensions')) expect(container.querySelectorAll('[data-markdown-extension]').length).toBeGreaterThanOrEqual(8);
    });

    it('keeps MathJax, MathJSLab, prose, URLs, and code spans isolated', () => {
        const container = document.createElement('div');
        container.innerHTML = appEngine().parse(read('conflicts/delimiters.md'));
        expect(container.querySelectorAll('.mathjax-pending')).toHaveLength(3);
        expect(container.querySelectorAll('math[data-mathjslab]')).toHaveLength(3);
        expect(container.textContent).toContain('de $5 para $10');
        expect(container.textContent).toContain('50% para 60%');
        expect(container.querySelector('a')?.getAttribute('href')).toContain('a%20b?q=50%25');
        expect(container.querySelectorAll('code')).toHaveLength(4);
    });

    it('does not execute extension fences quoted by a larger Markdown fence', () => {
        const container = document.createElement('div');
        container.innerHTML = appEngine().parse(read('conflicts/fences.md'));
        expect(container.querySelector('[data-markdown-language="mermaid"]')).toBeNull();
        expect(container.querySelectorAll('[data-markdown-language="math"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-markdown-language="mathjslab"]')).toHaveLength(1);
    });

    it('resolves relative links and images from the fixture document URL', async () => {
        const engine = new MarkdownEngine({ profile: 'gfm' });
        const container = document.createElement('div');
        await engine.render(read('extensions/relative-urls.md'), container, { sourceUrl: new URL('https://example.test/test/markdown/extensions/relative-urls.md') });
        expect(container.querySelector('a')?.href).toBe('https://example.test/test/markdown/combined/gfm-and-math.md');
        expect(container.querySelector('img')?.src).toBe('https://example.test/test/markdown/resources/pixel.svg');
        await engine.dispose();
    });

    it('records a nonzero optional chunk baseline without counting the initial application asset', () => {
        const report = JSON.parse(read('chunk-baseline.json')) as { resources: Record<string, { bytes: number; files: Array<{ name: string }> }> };
        expect(Object.keys(report.resources).sort()).toEqual(['abc', 'graphviz', 'maps', 'mathjax', 'mermaid', 'model-3d', 'molecule-3d', 'smiles', 'vega-lite', 'verovio']);
        for (const resource of Object.values(report.resources)) {
            expect(resource.bytes).toBeGreaterThan(0);
            expect(resource.files.length).toBeGreaterThan(0);
            expect(resource.files.map(({ name }) => name)).not.toContain('markdown-document.js');
        }
    });
});
