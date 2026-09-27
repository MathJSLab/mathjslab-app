/// <reference types="jest" />
import { createMarkdownOutline, MarkdownDocumentModel, type MarkdownCollectionManifest } from '../../src/markdown/MarkdownDocumentModel';

const manifest: MarkdownCollectionManifest = {
    version: 1,
    title: 'Linear Algebra',
    baseUrl: './notes/',
    locale: 'en',
    items: [
        { type: 'page', id: 'introduction', title: 'Introduction', source: 'index.md' },
        {
            type: 'group',
            title: 'Vectors',
            children: [
                { type: 'page', title: 'Operations', source: 'vectors/operations.md' },
                { type: 'page', id: 'basis', title: 'Basis', source: 'vectors/basis.md' },
            ],
        },
    ],
};

describe('Markdown document model', () => {
    it('builds a tree, derives stable ids and resolves document URLs', () => {
        const model = new MarkdownDocumentModel(manifest, 'https://course.test/course.json');
        expect(model.baseUrl.href).toBe('https://course.test/notes/');
        expect(model.items[1]?.type).toBe('group');
        expect(model.pages.map(({ id }) => id)).toEqual(['introduction', 'vectors/operations', 'vectors/basis']);
        expect(model.getPage('vectors/basis')?.url.href).toBe('https://course.test/notes/vectors/basis.md');
        expect(model.findPage('vectors/operations.md')?.id).toBe('vectors/operations');
        expect(model.findPage('basis.md', model.getPage('vectors/operations'))?.id).toBe('vectors/basis');
        expect(model.isNavigable(new URL('https://course.test/notes/vectors/basis.md#definition'))).toBe(true);
        expect(model.tableOfContents[1]?.children.map(({ title }) => title)).toEqual(['Operations', 'Basis']);
    });

    it('provides deterministic previous and next pages in manifest order', () => {
        const model = new MarkdownDocumentModel(manifest, 'https://course.test/course.json');
        expect(model.previous('introduction')).toBeUndefined();
        expect(model.next('introduction')?.id).toBe('vectors/operations');
        expect(model.previous('vectors/basis')?.id).toBe('vectors/operations');
        expect(model.next('vectors/basis')).toBeUndefined();
    });

    it('rejects unsupported versions, duplicate ids and duplicate page URLs', () => {
        expect(() => new MarkdownDocumentModel({ ...manifest, version: 2 as 1 })).toThrow('Unsupported Markdown collection version');
        expect(
            () =>
                new MarkdownDocumentModel({
                    version: 1,
                    title: 'Duplicates',
                    items: [
                        { type: 'page', id: 'same', title: 'One', source: 'one.md' },
                        { type: 'page', id: 'same', title: 'Two', source: 'two.md' },
                    ],
                }),
        ).toThrow('Duplicate Markdown document id');
        expect(
            () =>
                new MarkdownDocumentModel({
                    version: 1,
                    title: 'Duplicates',
                    items: [
                        { type: 'page', id: 'one', title: 'One', source: 'same.md' },
                        { type: 'page', id: 'two', title: 'Two', source: 'same.md#other' },
                    ],
                }),
        ).toThrow('Duplicate Markdown page URL');
    });

    it('omits hidden nodes from the default collection summary', () => {
        const model = new MarkdownDocumentModel({
            version: 1,
            title: 'Course',
            items: [
                { type: 'page', title: 'Visible', source: 'visible.md' },
                { type: 'page', title: 'Teacher notes', source: 'notes.md', hidden: true },
            ],
        });
        expect(model.tableOfContents.map(({ title }) => title)).toEqual(['Visible']);
        expect(model.createTableOfContents(true).map(({ title }) => title)).toEqual(['Visible', 'Teacher notes']);
        expect(model.getPage('notes')?.title).toBe('Teacher notes');
    });

    it('extracts a hierarchical outline and assigns missing unique ids', () => {
        const container = document.createElement('article');
        container.innerHTML = '<h1 id="lesson">Lesson</h1><h2>First topic</h2><h3>Detail</h3><h2 id="lesson">Repeated id</h2><h1>Summary</h1>';
        const outline = createMarkdownOutline(container);
        expect(outline.map(({ title }) => title)).toEqual(['Lesson', 'Summary']);
        expect(outline[0]?.children.map(({ title }) => title)).toEqual(['First topic', 'Repeated id']);
        expect(outline[0]?.children[0]?.children[0]?.title).toBe('Detail');
        expect(outline[0]?.children[0]?.id).toBe('first-topic');
        expect(outline[0]?.children[1]?.id).not.toBe('lesson');
        expect(container.querySelectorAll('#lesson')).toHaveLength(1);
    });

    it('supports level and inclusion filters and ignores extension internals', () => {
        const container = document.createElement('article');
        container.innerHTML = '<h1>Page title</h1><h2>Visible</h2><h2 data-skip>Skipped</h2><div data-markdown-extension="demo"><h2>Internal</h2></div>';
        const outline = createMarkdownOutline(container, { minLevel: 2, include: (heading) => !heading.hasAttribute('data-skip') });
        expect(outline.map(({ title }) => title)).toEqual(['Visible']);
    });
});
