import { appEngine } from './appEngine';
import firstExample from './first-example.json';
import i18n from './i18n';
import { exampleLeaves } from './example-manifest.cjs';
import type { ExampleEntry, ExampleDirectory, ExampleLeaf, LocalizedText } from './ExampleManifest';

type LoadExampleHandler = (text?: string) => any;
type DirectoryLevel = { keys: string[]; entry: ExampleDirectory };

/** Loads individual examples and browses manifest directories without changing shell content. */
class Example {
    public readonly baseUrl: string;
    public readonly isFileProtocol: boolean;
    private examplesRecord: Record<string, ExampleEntry> = {};
    private readonly loadHandler: LoadExampleHandler;
    private examplesAvailable = false;
    private readonly examplesContainer: HTMLElement;
    private readonly buttons = new Map<HTMLButtonElement, ExampleEntry>();
    private leaves: ExampleLeaf[] = [];
    private readonly menu = document.createElement('div');
    private readonly status = document.createElement('p');
    private origin: HTMLButtonElement | undefined;
    private levels: DirectoryLevel[] = [];
    private failed = false;

    private constructor(id: string, loadHandler: LoadExampleHandler) {
        this.baseUrl = globalThis.location.href.substring(0, globalThis.location.href.lastIndexOf('/') + 1);
        this.isFileProtocol = this.baseUrl.startsWith('file:');
        this.loadHandler = loadHandler;
        this.examplesContainer = document.getElementById(id)!;
        this.menu.id = `${id}-menu`;
        this.menu.className = 'example-menu';
        this.menu.hidden = true;
        this.menu.setAttribute('role', 'region');
        this.status.className = 'example-status';
        this.status.setAttribute('role', 'status');
        document.addEventListener('click', (event) => {
            // Rendering the next level detaches the clicked button before this
            // event reaches document; its original event path still contains the menu.
            if (this.origin && !event.composedPath().includes(this.menu) && !event.composedPath().includes(this.origin)) this.closeMenu(false);
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.origin) {
                event.preventDefault();
                this.closeMenu();
            }
        });
        window.addEventListener('resize', () => this.positionMenu());
        window.addEventListener('scroll', () => this.positionMenu(), true);
    }

    public get examples(): Record<string, ExampleEntry> {
        return this.examplesRecord;
    }

    private localizedText(text: LocalizedText, lang = i18n.locale): string {
        if (typeof text === 'string') return text;
        return text[lang] ?? text[i18n.defaultLocale] ?? text[appEngine.config.defaultLanguage!] ?? Object.values(text)[0] ?? '';
    }

    private setButtonCaption(button: HTMLButtonElement, entry: ExampleEntry): void {
        button.textContent = this.localizedText(entry.caption);
        button.title = this.localizedText(entry.description);
    }

    private exampleUrl(leaf: ExampleLeaf): string {
        const languagePath = typeof leaf.entry.caption === 'object' ? `${i18n.locale}/` : '';
        return `${appEngine.config.exampleBaseUrl}example/${languagePath}${leaf.path.split('/').map(encodeURIComponent).join('/')}`;
    }

    private async loadExample(keys: string[]): Promise<boolean> {
        try {
            const leaf = this.leaves.find((item) => JSON.stringify(item.keys) === JSON.stringify(keys));
            if (!leaf) throw new Error('Unknown example.');
            const response = await globalThis.fetch(this.exampleUrl(leaf));
            if (!response.ok) throw new Error('Network response error.');
            const text = await response.text();
            this.loadHandler(text);
            this.failed = false;
            this.updateStatus();
            return true;
        } catch {
            this.failed = true;
            this.updateStatus();
            return false;
        }
    }

    private updateStatus(): void {
        this.status.textContent = this.failed ? i18n.format('exampleBrowser.loadError') : '';
    }

    private closeMenu(focus = true): void {
        const origin = this.origin;
        origin?.setAttribute('aria-expanded', 'false');
        this.origin = undefined;
        this.levels = [];
        this.menu.hidden = true;
        if (focus) origin?.focus();
    }

    private positionMenu(): void {
        if (!this.origin) return;
        const rect = this.origin.getBoundingClientRect();
        const width = Math.min(360, Math.max(0, window.innerWidth - 16));
        this.menu.style.width = `${width}px`;
        this.menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`;
        const bottom = Math.max(8, Math.min(rect.bottom, window.innerHeight - 8));
        const top = Math.max(8, Math.min(rect.top, window.innerHeight - 8));
        const below = window.innerHeight - bottom - 8;
        const above = top - 8;
        const useBelow = below >= Math.min(240, above);
        this.menu.style.maxHeight = `${Math.max(0, useBelow ? below : above)}px`;
        this.menu.style.top = `${useBelow ? bottom : Math.max(8, top - this.menu.offsetHeight)}px`;
    }

    private renderMenu(focus = true): void {
        const level = this.levels.at(-1);
        if (!level) return;
        this.menu.replaceChildren();
        this.menu.setAttribute('aria-label', this.localizedText(level.entry.caption));
        const heading = document.createElement('p');
        heading.className = 'example-menu-path';
        heading.textContent = this.levels.map((item) => this.localizedText(item.entry.caption)).join(' / ');
        this.menu.append(heading);
        if (this.levels.length > 1) {
            const back = document.createElement('button');
            back.textContent = i18n.format('exampleBrowser.back');
            back.addEventListener('click', () => {
                const previous = this.levels.pop()!;
                this.renderMenu(false);
                Array.from(this.menu.querySelectorAll<HTMLButtonElement>('button'))
                    .find((button) => button.dataset.entryKey === previous.keys.at(-1))
                    ?.focus();
            });
            this.menu.append(back);
        }
        const list = document.createElement('ul');
        for (const [key, entry] of Object.entries(level.entry.children)) {
            const item = document.createElement('li');
            const button = this.entryButton(entry, [...level.keys, key], false);
            button.dataset.entryKey = key;
            item.append(button);
            list.append(item);
        }
        this.menu.append(list);
        if (!list.childElementCount) {
            const empty = document.createElement('p');
            empty.textContent = i18n.format('exampleBrowser.empty');
            this.menu.append(empty);
        }
        this.menu.hidden = false;
        this.menu.tabIndex = -1;
        this.positionMenu();
        if (focus) (this.menu.querySelector<HTMLButtonElement>('button') ?? this.menu).focus();
    }

    private entryButton(entry: ExampleEntry, keys: string[], root: boolean): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button';
        this.setButtonCaption(button, entry);
        if (root) {
            button.id = `example-${encodeURIComponent(keys[0]!)}`;
            this.buttons.set(button, entry);
        }
        if (entry.directory !== undefined) {
            button.classList.add('example-directory');
            if (root) {
                button.setAttribute('aria-expanded', 'false');
                button.setAttribute('aria-controls', this.menu.id);
            }
            button.addEventListener('click', () => {
                if (root) {
                    if (this.origin === button) {
                        this.closeMenu();
                        return;
                    }
                    this.closeMenu(false);
                    this.origin = button;
                    button.setAttribute('aria-expanded', 'true');
                    this.levels = [{ keys, entry }];
                } else this.levels.push({ keys, entry });
                this.renderMenu();
            });
        } else {
            button.addEventListener('click', async () => {
                button.disabled = true;
                try {
                    if (await this.loadExample(keys)) this.closeMenu();
                } finally {
                    button.disabled = false;
                }
            });
        }
        return button;
    }

    public setLanguage(): void {
        if (!this.isFileProtocol && this.examplesAvailable) {
            this.buttons.forEach((entry, button) => this.setButtonCaption(button, entry));
            const active = document.activeElement as HTMLElement | null;
            const focusedKey = this.menu.contains(active) ? active?.dataset.entryKey : undefined;
            const menuFocused = this.menu.contains(active);
            if (this.origin) {
                this.renderMenu(false);
                if (menuFocused) {
                    const buttons = Array.from(this.menu.querySelectorAll<HTMLButtonElement>('button'));
                    (buttons.find((button) => button.dataset.entryKey === focusedKey) ?? this.menu).focus();
                }
            }
            this.updateStatus();
        }
    }

    private async load(): Promise<void> {
        if (!this.examplesContainer || !this.loadHandler) throw new Error('Examples container and load handler are required.');
        if (!this.isFileProtocol) {
            try {
                const response = await globalThis.fetch(`${appEngine.config.exampleBaseUrl}example/example.json`);
                if (!response.ok) throw new Error('Examples unavailable.');
                const data = await response.json();
                this.leaves = exampleLeaves(data);
                this.examplesRecord = data;
                this.examplesAvailable = true;
            } catch {
                this.examplesAvailable = false;
            }
        }
        if (this.isFileProtocol || !this.examplesAvailable) {
            this.loadHandler(this.localizedText(firstExample.content as LocalizedText));
            return;
        }
        for (const [key, entry] of Object.entries(this.examplesRecord)) {
            this.examplesContainer.append(this.entryButton(entry, [key], true));
        }
        this.examplesContainer.append(this.status);
        document.body.append(this.menu);
        const first = this.leaves[0];
        if (!first || !(await this.loadExample(first.keys))) this.loadHandler(this.localizedText(firstExample.content as LocalizedText));
    }

    public static async initialize(id: string, loadHandler: LoadExampleHandler): Promise<Example> {
        const example = new Example(id, loadHandler);
        await example.load();
        i18n.addEventListener('languagechange', () => example.setLanguage());
        return example;
    }
}
export type { ExampleEntry, LoadExampleHandler };
export { Example };
export default { Example };
