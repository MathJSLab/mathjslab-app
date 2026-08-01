import './InterpreterConfiguration';
import { evalInput } from './evalInput';
import { evalPrompt } from './evalPrompt';
import { Shell } from './Shell';
import { appEngine } from './appEngine';
import i18n from './i18n';
import './main.scss';

type Theme = 'dark' | 'light';

/**
 * Get a required page element by id.
 */
const byId = <T extends HTMLElement>(id: string): T => {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`missing page element: ${id}`);
    }
    return element as T;
};

/**
 * Replace trusted localized markup in a static page container.
 */
const setHTML = (id: string, value: string): void => {
    byId(id).innerHTML = value;
};

/**
 * Replace localized plain text in a static page container.
 */
const setText = (id: string, value: string): void => {
    byId(id).textContent = value;
};

/**
 * Read the active page theme from the document root.
 */
const currentTheme = (): Theme => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

/**
 * Render the theme toggle label for the opposite available theme.
 */
const renderThemeButton = (): void => {
    setText('theme-toggle', currentTheme() === 'dark' ? i18n.page.theme.light : i18n.page.theme.dark);
};

/**
 * Apply and persist the selected page theme.
 */
const setTheme = (theme: Theme): void => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    renderThemeButton();
};

/**
 * Toggle between the supported page themes.
 */
const toggleTheme = (): void => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
};

/**
 * Return to the top of the page after startup or locale changes.
 */
const scrollToTop = (): void => {
    globalThis.setTimeout(() => {
        globalThis.scrollTo(0, 0);
    }, 600);
};

/**
 * Build the language selector from the locales registered by the i18n service.
 */
const renderLanguageOptions = (): void => {
    const language = byId<HTMLSelectElement>('language');
    language.replaceChildren();
    for (const locale of i18n.locales) {
        const option = document.createElement('option');
        option.value = locale;
        option.textContent = i18n.languageNames[locale];
        language.append(option);
    }
};

/**
 * Load the localized project notes shown below the interactive shell.
 */
const loadReadme = async (): Promise<void> => {
    if (document.location.href.startsWith('file:')) {
        return;
    }
    try {
        const response = await globalThis.fetch(i18n.page.page.readmeFile);
        if (!response.ok) {
            throw new URIError(i18n.page.error.loadTextNetwork);
        }
        byId('mathjslab-readme').innerHTML = appEngine.Markdown.parse(await response.text());
    } catch (error) {
        console.error(error);
    }
};

/**
 * Render all static page strings for the active locale.
 */
const renderPage = (): void => {
    i18n.applyDocumentLanguage();
    byId<HTMLSelectElement>('language').value = i18n.locale;
    setHTML('title', i18n.page.page.titleHtml);
    setHTML('subtitle', i18n.page.page.subtitleHtml);
    setHTML('abstract', i18n.page.page.abstractHtml);
    setHTML('trademark-notice', i18n.page.page.trademarkNoticeHtml);
    (byId('examples') as any).element.title.textContent = i18n.page.page.examples;
    setText('open-file', i18n.page.page.openFile);
    (byId('readme') as any).element.title.textContent = i18n.page.page.readme;
    setText('github-repository', i18n.page.page.githubRepository);
    setText('curriculum', i18n.page.page.curriculum);
    renderThemeButton();
    void loadReadme();
};

/**
 * Initialize the theme from localStorage or the browser preference.
 */
const initializeTheme = (): void => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (globalThis.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
};

/**
 * Connect static page controls and subscribe to locale changes.
 */
const initializePage = (): void => {
    initializeTheme();
    renderLanguageOptions();
    byId<HTMLSelectElement>('language').addEventListener('change', (event) => {
        appEngine.setLanguage((event.currentTarget as HTMLSelectElement).value);
        scrollToTop();
    });
    byId('open-file').addEventListener('click', () => appEngine.openFile());
    byId('theme-toggle').addEventListener('click', toggleTheme);
    i18n.addEventListener('languagechange', renderPage);
    renderPage();
    scrollToTop();
    const app = document.querySelector<HTMLDivElement>('div#app');
    if (app) {
        app.style.marginBottom = '100%';
    }
};

/**
 * Initialize the application shell and connect the interpreter callbacks used
 * by the command prompt and examples panel.
 */
async function bootstrap(): Promise<void> {
    appEngine.shell = await Shell.initialize({
        shellId: 'mathjslab-shell',
        examplesId: 'mathjslab-examples',
        evalPrompt,
        evalInput,
    });
    initializePage();
}
bootstrap();
