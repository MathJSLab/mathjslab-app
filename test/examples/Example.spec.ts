import { jest } from '@jest/globals';
import type { ExampleEntry } from '../../src/ExampleManifest';

let locale = 'en';
const messages: Record<string, Record<string, string>> = {
    en: { back: 'Back', empty: 'Empty', loadError: 'Load failed' },
    pt: { back: 'Voltar', empty: 'Vazio', loadError: 'Falha ao carregar' },
};
const languageListeners: (() => void)[] = [];
jest.unstable_mockModule('../../src/appEngine', () => ({ appEngine: { config: { exampleBaseUrl: '/', defaultLanguage: 'en' } } }));
jest.unstable_mockModule('../../src/i18n', () => ({
    default: {
        get locale() {
            return locale;
        },
        defaultLocale: 'en',
        format: (key: string) => messages[locale]![key.split('.').at(-1)!],
        addEventListener: (_event: string, callback: () => void) => languageListeners.push(callback),
    },
}));
const { Example } = await import('../../src/Example');
const caption = { en: 'File', pt: 'Arquivo' };
const file = (name = 'lesson.m'): ExampleEntry => ({ file: name, caption, description: 'Description' });
const folder = (children: Record<string, ExampleEntry>, directory = 'folder'): ExampleEntry => ({
    directory,
    children,
    caption: { en: directory, pt: `pt-${directory}` },
    description: 'Directory',
});
const fetchMock = jest.fn<typeof fetch>();
const receive = jest.fn();
const settle = async () => {
    for (let i = 0; i < 8; i++) await Promise.resolve();
};
const button = (text: string, parent: ParentNode = document) => Array.from(parent.querySelectorAll<HTMLButtonElement>('button')).find((item) => item.textContent === text)!;
const menu = () => document.querySelector<HTMLElement>('.example-menu')!;

async function initialize(manifest: Record<string, ExampleEntry>) {
    document.body.innerHTML = '<div id="examples"></div><button id="outside">Outside</button>';
    fetchMock.mockImplementation(async (input) => ({ ok: true, json: async () => manifest, text: async () => `source:${String(input)}` }) as Response);
    return Example.initialize('examples', receive);
}

describe('example directory browser', () => {
    beforeEach(() => {
        locale = 'en';
        receive.mockClear();
        fetchMock.mockReset();
        globalThis.fetch = fetchMock;
    });
    afterEach(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        languageListeners.length = 0;
        document.body.replaceChildren();
    });

    it('loads the first nested leaf, navigates without loading, returns focus and loads localized paths', async () => {
        await initialize({ root: folder({ nested: folder({ repeated: file() }, 'nested') }) });
        expect(fetchMock).toHaveBeenLastCalledWith('/example/en/folder/nested/lesson.m');
        receive.mockClear();
        button('folder').click();
        expect(button('nested', menu())).toBe(document.activeElement);
        button('nested', menu()).click();
        expect(menu().textContent).toContain('folder / nested');
        expect(receive).not.toHaveBeenCalled();
        button('Back', menu()).click();
        expect(button('nested', menu())).toBe(document.activeElement);
        button('nested', menu()).click();
        button('File', menu()).focus();
        locale = 'pt';
        languageListeners.forEach((listener) => listener());
        expect(menu().textContent).toContain('pt-folder / pt-nested');
        expect(button('Arquivo', menu())).toBe(document.activeElement);
        expect(receive).not.toHaveBeenCalled();
        button('Arquivo', menu()).click();
        await settle();
        expect(fetchMock).toHaveBeenLastCalledWith('/example/pt/folder/nested/lesson.m');
        expect(menu().hidden).toBe(true);
        expect(button('pt-folder')).toBe(document.activeElement);
    });

    it('supports root files, repeated keys, empty directories and all closing actions', async () => {
        await initialize({ repeated: file(), a: folder({ repeated: file('other.m') }, 'a'), b: folder({}, 'b') });
        expect(fetchMock).toHaveBeenLastCalledWith('/example/en/lesson.m');
        button('a').click();
        button('File', menu()).click();
        await settle();
        expect(fetchMock).toHaveBeenLastCalledWith('/example/en/a/other.m');
        button('a').click();
        button('b').click();
        expect(button('a').getAttribute('aria-expanded')).toBe('false');
        expect(menu().textContent).toContain('Empty');
        expect(document.activeElement).toBe(menu());
        button('b').click();
        expect(menu().hidden).toBe(true);
        button('a').click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(menu().hidden).toBe(true);
        expect(document.activeElement).toBe(button('a'));
        button('a').click();
        button('Outside').click();
        expect(menu().hidden).toBe(true);
    });

    it('preserves shell content and menu after network failure, translates the error and allows retry', async () => {
        await initialize({ a: folder({ file: file() }) });
        receive.mockClear();
        button('folder').click();
        fetchMock.mockResolvedValue({ ok: false } as Response);
        button('File', menu()).click();
        await settle();
        expect(receive).not.toHaveBeenCalled();
        expect(menu().hidden).toBe(false);
        expect(document.querySelector('[role=status]')!.textContent).toBe('Load failed');
        locale = 'pt';
        languageListeners.forEach((listener) => listener());
        expect(document.querySelector('[role=status]')!.textContent).toBe('Falha ao carregar');
        fetchMock.mockResolvedValue({ ok: true, text: async () => 'retry' } as Response);
        button('Arquivo', menu()).click();
        await settle();
        expect(receive).toHaveBeenCalledWith('retry');
        expect(document.querySelector('[role=status]')!.textContent).toBe('');
    });

    it('keeps legacy strings and uses the bundled fallback when the manifest is invalid or unavailable', async () => {
        await initialize({ legacy: { file: 'old.m', caption: 'Legacy', description: 'Old' } });
        expect(fetchMock).toHaveBeenLastCalledWith('/example/old.m');
        await initialize({ broken: { file: '../escape.m', caption: 'Bad', description: 'Bad' } });
        expect(receive).toHaveBeenCalledTimes(2);
        expect(document.querySelectorAll('#examples button')).toHaveLength(0);
        fetchMock.mockRejectedValue(new Error('offline'));
        await Example.initialize('examples', receive);
        expect(receive).toHaveBeenCalledTimes(3);
    });
});
