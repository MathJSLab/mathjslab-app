import { IntlMessageFormat } from 'intl-messageformat';

/**
 * Shared locale and message formatting service for the web application.
 *
 * The app keeps existing `setLanguage` hooks on components, but all locale
 * detection, persistence, and ICU formatting now flows through this singleton.
 */
type Locale = 'en' | 'es' | 'pt';
type MessageTree = string | MessageTree[] | { [key: string]: MessageTree };
type MessageValues = Parameters<IntlMessageFormat['format']>[0];

/**
 * Locale source messages.
 *
 * Keys ending in `Html` intentionally contain trusted markup that is rendered
 * into static page containers. Other strings can be formatted through ICU.
 */
const source = {
    en: {
        locale: 'en',
        htmlLang: 'en',
        languageName: 'English',
        app: {
            title: 'MathJSLab',
            description: 'An interpreter with language syntax like MATLAB®/Octave. ISBN 978-65-00-82338-7.',
        },
        page: {
            titleHtml: '<a href="https://github.com/MathJSLab/mathjslab-app" target="_blank" rel="noopener">MathJSLab</a>',
            subtitleHtml:
                'An <a href="https://en.wikipedia.org/wiki/Interpreter_(computing)" target="_blank" rel="noopener">interpreter</a> with language syntax like <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a>',
            abstractHtml:
                'This is a demo application of the <a href="https://www.npmjs.com/package/mathjslab" target="_blank" rel="noopener">MathJSLab</a> <a href="https://en.wikipedia.org/wiki/Npm" target="_blank" rel="noopener">npm package</a> (<a href="https://github.com/MathJSLab/mathjslab" target="_blank" rel="noopener">repository</a>), an emulator of a subset of the <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a> language written completely in <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener">TypeScript</a>. This application is intended for educational purposes. See the <a href="#readme">notes</a> below for detailed information.',
            trademarkNoticeHtml:
                '<strong>Important Notice:</strong> This software, the <strong><a href="https://mathjslab.com/">MathJSLab</a>, is not affiliated, sponsored, or endorsed by <a href="https://www.mathworks.com/">The MathWorks, Inc.</a></strong> <a href="https://www.mathworks.com/products/matlab.html">MATLAB&reg;</a> is a registered trademark of <a href="https://www.mathworks.com/">The MathWorks, Inc.</a> For more information about <a href="https://www.mathworks.com/products/matlab.html">MATLAB</a>, visit <a href="https://www.mathworks.com/">www.mathworks.com</a>.',
            readmeFile: 'README.md',
            examples: 'Examples',
            openFile: 'Open...',
            readme: 'More Info',
            githubRepository: 'GitHub Repository',
            curriculum: 'Curriculum',
        },
        shell: {
            variables: 'Variables',
            evaluate: 'Evaluate',
        },
        theme: {
            dark: 'dark',
            light: 'light',
        },
        help: {
            unavailableOfflineHtml: 'help command unavailable <b>offline</b>.',
            tooManyInputs: 'help: function called with too many inputs',
            notFound: 'help: {topic} not found.',
        },
        error: {
            loadTextNetwork: 'loadText: Network error.',
        },
    },
    es: {
        locale: 'es',
        htmlLang: 'es',
        languageName: 'Español',
        app: {
            title: 'MathJSLab',
            description: 'Un intérprete con sintaxis de lenguaje como MATLAB®/Octave. ISBN 978-65-00-82338-7.',
        },
        page: {
            titleHtml: '<a href="https://github.com/MathJSLab/mathjslab-app" target="_blank" rel="noopener">MathJSLab</a>',
            subtitleHtml:
                'Un <a href="https://es.wikipedia.org/wiki/Int%C3%A9rprete_(inform%C3%A1tica)" target="_blank" rel="noopener">intérprete</a> con sintaxis de lenguaje como <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a>',
            abstractHtml:
                'Esta es una aplicación de demostración del <a href="https://es.wikipedia.org/wiki/Npm" target="_blank" rel="noopener">paquete npm</a> <a href="https://www.npmjs.com/package/mathjslab" target="_blank" rel="noopener">MathJSLab</a> (<a href="https://github.com/MathJSLab/mathjslab" target="_blank" rel="noopener">repositorio</a>), un emulador de un subconjunto del lenguaje <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a> escrito completamente en <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener">TypeScript</a>. Esta aplicación está destinada a fines educativos. Consulte las <a href="#readme">notas</a> a continuación para obtener información detallada.',
            trademarkNoticeHtml:
                '<strong>Aviso Importante:</strong> Este software, <strong><a href="https://mathjslab.com/">MathJSLab</a>, no está afiliado, patrocinado ni respaldado por <a href="https://www.mathworks.com/">The MathWorks, Inc.</a></strong> <a href="https://www.mathworks.com/products/matlab.html">MATLAB&reg;</a> es una marca registrada de <a href="https://www.mathworks.com/">The MathWorks, Inc.</a> Para más información sobre <a href="https://www.mathworks.com/products/matlab.html">MATLAB</a>, visita <a href="https://www.mathworks.com">www.mathworks.com</a>.',
            readmeFile: 'LEAME.md',
            examples: 'Ejemplos',
            openFile: 'Abrir...',
            readme: 'Más información',
            githubRepository: 'Repositorio GitHub',
            curriculum: 'Currículum',
        },
        shell: {
            variables: 'Variables',
            evaluate: 'Computar',
        },
        theme: {
            dark: 'oscuro',
            light: 'claro',
        },
        help: {
            unavailableOfflineHtml: 'comando help no disponible <b>sin conexión</b>.',
            tooManyInputs: 'help: función llamada con demasiadas entradas',
            notFound: 'help: {topic} no encontrado.',
        },
        error: {
            loadTextNetwork: 'loadText: Error de red.',
        },
    },
    pt: {
        locale: 'pt',
        htmlLang: 'pt-BR',
        languageName: 'Português',
        app: {
            title: 'MathJSLab',
            description: 'Um interpretador com sintaxe de linguagem como MATLAB®/Octave. ISBN 978-65-00-82338-7.',
        },
        page: {
            titleHtml: '<a href="https://github.com/MathJSLab/mathjslab-app" target="_blank" rel="noopener">MathJSLab</a>',
            subtitleHtml:
                'Um <a href="https://pt.wikipedia.org/wiki/Interpretador" target="_blank" rel="noopener">interpretador</a> com sintaxe de linguagem como o <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a>',
            abstractHtml:
                'Este é um aplicativo de demonstração do <a href="https://pt.wikipedia.org/wiki/Npm_(software)" target="_blank" rel="noopener">pacote npm</a> <a href="https://www.npmjs.com/package/mathjslab" target="_blank" rel="noopener">MathJSLab</a> (<a href="https://github.com/MathJSLab/mathjslab" target="_blank" rel="noopener">repositório</a>), um emulador de um subconjunto da linguagem <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a> escrito completamente em <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener">TypeScript</a>. Este aplicativo é destinado a fins educacionais. Consulte as <a href="#readme">notas</a> abaixo para obter informações detalhadas.',
            trademarkNoticeHtml:
                '<strong>Aviso Importante:</strong> Este software, o <strong><a href="https://mathjslab.com/">MathJSLab</a>, não é afiliado, patrocinado ou endossado por <a href="https://www.mathworks.com/">The MathWorks, Inc.</a></strong> <a href="https://www.mathworks.com/products/matlab.html">MATLAB&reg;</a> é uma marca registrada de <a href="https://www.mathworks.com/">The MathWorks, Inc.</a> Para mais informações sobre o <a href="https://www.mathworks.com/products/matlab.html">MATLAB</a>, visite <a href="https://www.mathworks.com">www.mathworks.com</a>.',
            readmeFile: 'LEIAME.md',
            examples: 'Exemplos',
            openFile: 'Abrir...',
            readme: 'Mais Informações',
            githubRepository: 'Repositório GitHub',
            curriculum: 'Currículo Lattes',
        },
        shell: {
            variables: 'Variáveis',
            evaluate: 'Computar',
        },
        theme: {
            dark: 'escuro',
            light: 'claro',
        },
        help: {
            unavailableOfflineHtml: 'comando help indisponível <b>offline</b>.',
            tooManyInputs: 'help: função chamada com muitas entradas',
            notFound: 'help: {topic} não encontrado.',
        },
        error: {
            loadTextNetwork: 'loadText: Erro de rede.',
        },
    },
} as const;

const locales = Object.keys(source) as Locale[];

/**
 * Normalize a browser, query-string, or stored language code to a supported
 * application locale.
 */
const normalizeLocale = (locale?: string | null): Locale => {
    const language = locale?.toLowerCase().split('-')[0] as Locale | undefined;
    return language && locales.includes(language) ? language : 'en';
};

/**
 * Prepare non-parameterized page messages for direct rendering.
 *
 * ICU messages with placeholders and rich HTML strings are left untouched so
 * callers can format them explicitly or assign them to HTML containers.
 */
const formatValue = (value: MessageTree, locale: Locale): any => {
    if (typeof value === 'string') {
        if (value.includes('{') || value.includes('<')) {
            return value;
        }
        return new IntlMessageFormat(value, locale).format();
    }
    if (Array.isArray(value)) {
        return value.map((entry) => formatValue(entry, locale));
    }
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, formatValue(entry, locale)]));
};

const pages = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, formatValue(values, locale as Locale)])) as Record<Locale, any>;

/**
 * Resolve a dotted message path against a locale message tree.
 */
const getByPath = (messages: MessageTree, path: string): MessageTree => {
    return path.split('.').reduce<MessageTree>((current, key) => {
        if (typeof current !== 'object' || Array.isArray(current)) {
            return '';
        }
        return current[key] ?? '';
    }, messages);
};

/**
 * Pick the startup locale from `?lang=`, then localStorage, then the browser.
 */
const getInitialLocale = (): Locale => {
    const params = new URLSearchParams(globalThis.location.search);
    return normalizeLocale(params.get('lang') || globalThis.localStorage.getItem('mathjslab-app:locale') || globalThis.navigator.language);
};

/**
 * Locale coordinator used by the page, components, examples, help command, and
 * interpreter alias configuration.
 */
class I18n extends EventTarget {
    public readonly defaultLocale: Locale = 'en';
    public readonly locales = locales;
    public readonly languageNames = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, values.languageName])) as Record<Locale, string>;
    public readonly pages = pages;
    private currentLocale: Locale = getInitialLocale();

    public get locale(): Locale {
        return this.currentLocale;
    }

    public get page(): any {
        return this.pages[this.currentLocale];
    }

    /**
     * Format an ICU message in the current locale.
     */
    public format(path: string, values?: MessageValues): string {
        const message = getByPath(source[this.currentLocale], path);
        if (typeof message !== 'string') {
            return '';
        }
        return String(new IntlMessageFormat(message, this.currentLocale).format(values));
    }

    /**
     * Change and persist the current locale, then notify language-aware code.
     */
    public setLocale(locale?: string | null): void {
        const nextLocale = normalizeLocale(locale);
        if (nextLocale === this.currentLocale) {
            return;
        }
        this.currentLocale = nextLocale;
        globalThis.localStorage.setItem('mathjslab-app:locale', nextLocale);
        this.applyDocumentLanguage();
        this.dispatchEvent(new CustomEvent('languagechange', { detail: { locale: nextLocale } }));
    }

    /**
     * Apply localized document metadata used by browsers and link previews.
     */
    public applyDocumentLanguage(): void {
        document.documentElement.lang = this.page.htmlLang;
        document.title = this.page.app.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', this.page.app.description);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', this.page.app.description);
        document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', this.page.app.description);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', this.page.app.description);
    }
}

const i18n = new I18n();

export { type Locale, i18n };
export default i18n;
