import './showOpenFilePickerPolyfill';
import { Interpreter, InterpreterConfig, AliasNameTable } from 'mathjslab';
import { appEngine } from './appEngine';
import { Markdown } from './Markdown';
import buildConfiguration from './build-configuration.json';
import { externalFunctionTable, openMathJSLabFile } from './externalFunctionTable';
import { externalCmdWListTable } from './externalCmdWListTable';
import i18n from './i18n';
import { languageAlias } from './InterpreterAliases';

export { languageAlias };

const aliasTableFor = (locale: string): AliasNameTable => {
    const aliasNameTable = languageAlias[locale];
    if (!aliasNameTable) {
        throw new Error(`unsupported locale: ${locale}`);
    }
    return aliasNameTable;
};

/**
 * Synchronize interpreter configuration and language-aware UI components with
 * the current application locale.
 */
const syncLanguage = (): void => {
    appEngine.lang = i18n.locale;
    InterpreterConfiguration.aliasNameTable = aliasTableFor(i18n.locale);
    /*
     * Update aliases in the existing interpreter context so locale changes do
     * not recreate the workspace, re-evaluate prompts, or replace user input.
     */
    appEngine.interpreter.context.setAliasNameTable(InterpreterConfiguration.aliasNameTable);
    if (appEngine.shell?.commandShell) {
        appEngine.shell.commandShell.setLanguage();
    }
    appEngine.shell?.example?.setLanguage();
};

/**
 * Change the application language.
 * @param lang Language code.
 */
appEngine.setLanguage = (lang?: string): void => {
    i18n.setLocale(lang);
};

i18n.addEventListener('languagechange', syncLanguage);

export const InterpreterConfiguration: InterpreterConfig = {
    /**
     * Alias table
     */
    aliasNameTable: aliasTableFor(i18n.locale),

    /**
     * External function table
     */
    externalFunctionTable,

    /**
     * External command word list table
     */
    externalCmdWListTable,
};

/**
 * Open a local script file through the configured external function.
 */
appEngine.openFile = (): void => {
    openMathJSLabFile();
};

Object.assign(InterpreterConfiguration.externalCmdWListTable!, {
    open: {
        func: (...args: string[]): void => {
            const openFunction = externalFunctionTable.open;
            if (!openFunction) {
                throw new Error('open function is not configured.');
            }
            openFunction.func(...args);
        },
    },
});

/**
 * Initialize the interpreter and Markdown services.
 */
function bootstrap() {
    const baseUrl =
        globalThis.location.protocol === 'file:' ? globalThis.location.href.substring(0, globalThis.location.href.lastIndexOf('/') + 1) : new URL('/', globalThis.location.href).href;
    if (typeof appEngine.config === 'undefined' || appEngine.config === null) {
        appEngine.config = {
            exampleBaseUrl: baseUrl,
            helpBaseUrl: baseUrl,
            defaultLanguage: 'en',
        };
    } else if (typeof appEngine.config === 'object') {
        if (appEngine.config === null) {
            appEngine.config = {
                exampleBaseUrl: baseUrl,
                helpBaseUrl: baseUrl,
                defaultLanguage: 'en',
            };
        } else {
            if (typeof appEngine.config.exampleBaseUrl !== 'undefined' && appEngine.config.exampleBaseUrl !== null) {
                if (appEngine.config.exampleBaseUrl![appEngine.config.exampleBaseUrl!.length - 1] !== '/') {
                    appEngine.config.exampleBaseUrl += '/';
                }
            } else {
                appEngine.config.exampleBaseUrl = baseUrl;
            }
            if (typeof appEngine.config.helpBaseUrl !== 'undefined' && appEngine.config.helpBaseUrl !== null) {
                if (appEngine.config.helpBaseUrl![appEngine.config.helpBaseUrl!.length - 1] !== '/') {
                    appEngine.config.helpBaseUrl += '/';
                }
            } else {
                appEngine.config.helpBaseUrl = baseUrl;
            }
            if (typeof appEngine.config.defaultLanguage === 'undefined' || appEngine.config.defaultLanguage === null) {
                appEngine.config.defaultLanguage = 'en';
            }
        }
    } else {
        throw new Error('invalid appEngine configuration.');
    }
    appEngine.lang = i18n.locale;
    InterpreterConfiguration.aliasNameTable = aliasTableFor(i18n.locale);
    appEngine.interpreter = Interpreter.Create(InterpreterConfiguration);
    appEngine.interpreter.debug = buildConfiguration.debug;
    appEngine.buildMessage = buildConfiguration.buildMessage;
    Markdown.initialize();
}
bootstrap();
