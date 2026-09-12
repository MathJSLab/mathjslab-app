import './InterpreterConfiguration';
import './components/components';
import { evalInput } from './evalInput';
import { evalCommand, evalPrompt } from './evalPrompt';
import { Shell } from './Shell';
import { appEngine } from './appEngine';
import i18n from './i18n';
import { type AppearanceMode, type AppearanceModeToggleEvent } from './components/appearance-mode/appearance-mode.component';
import { type LanguageSwitcher, type LanguageSwitcherSelectEvent } from './components/language-switcher/language-switcher.component';
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

const colorScheme = globalThis.matchMedia('(prefers-color-scheme: dark)');

const currentIconTheme = (): Theme => {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark' || theme === 'light') {
        return theme;
    }
    return colorScheme.matches ? 'dark' : 'light';
};

const themedHref = (href: string, theme: Theme): string => `${href}${href.includes('?') ? '&' : '?'}theme=${theme}`;

const syncThemeIcons = (): void => {
    const theme = currentIconTheme();
    const pageLogo = document.getElementById('page-logo') as HTMLImageElement | null;
    if (pageLogo) {
        pageLogo.src = theme === 'dark' ? '/images/mathjslab-logo-dark.svg' : '/images/mathjslab-logo-light.svg';
    }
    document.querySelectorAll<HTMLLinkElement>('link[data-appearance-icon]').forEach((icon) => {
        const href = theme === 'dark' ? icon.dataset.darkHref : icon.dataset.lightHref;
        if (href) {
            icon.href = themedHref(href, theme);
        }
    });
};

/**
 * Render the theme toggle label for the opposite available theme.
 */
const renderThemeButton = (): void => {
    const themeToggle = byId<AppearanceMode>('theme-toggle');
    themeToggle.setAttribute('mode', currentTheme());
    themeToggle.setAttribute('light-label', i18n.page.theme.light);
    themeToggle.setAttribute('dark-label', i18n.page.theme.dark);
    themeToggle.render();
};

/**
 * Apply the selected page theme.
 */
const setTheme = (theme: Theme): void => {
    document.documentElement.setAttribute('data-theme', theme);
    renderThemeButton();
    syncThemeIcons();
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
 * Load the localized project notes shown below the interactive shell.
 */
const loadReadme = async (): Promise<void> => {
    if (document.location.href.startsWith('file:')) {
        return;
    }
    try {
        const response = await globalThis.fetch(new URL(`/${i18n.page.page.readmeFile}`, globalThis.location.href));
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
    const language = byId<LanguageSwitcher>('language');
    language.setAttribute('locale', i18n.locale);
    language.setLanguage();
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
 * Initialize the theme from the browser preference.
 */
const initializeTheme = (): void => {
    document.documentElement.setAttribute('data-theme', colorScheme.matches ? 'dark' : 'light');
    syncThemeIcons();
};

/**
 * Connect static page controls and subscribe to locale changes.
 */
const initializePage = (): void => {
    initializeTheme();
    byId<LanguageSwitcher>('language').addEventListener('language-switcher-select', (event) => {
        event.preventDefault();
        appEngine.setLanguage((event as LanguageSwitcherSelectEvent).detail.locale);
        scrollToTop();
    });
    byId('open-file').addEventListener('click', () => appEngine.openFile());
    byId<AppearanceMode>('theme-toggle').addEventListener('appearance-mode-toggle', (event) => {
        event.preventDefault();
        setTheme((event as AppearanceModeToggleEvent).detail.mode);
    });
    colorScheme.addEventListener('change', syncThemeIcons);
    new MutationObserver(syncThemeIcons).observe(document.documentElement, {
        attributeFilter: ['data-theme'],
        attributes: true,
    });
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
        evalCommand,
        evalPrompt,
        evalInput,
    });
    initializePage();
}
void bootstrap();
