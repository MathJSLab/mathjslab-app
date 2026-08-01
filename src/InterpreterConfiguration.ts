import './showOpenFilePickerPolyfill';
import { Interpreter, InterpreterConfig, AliasNameTable } from 'mathjslab';
import { appEngine } from './appEngine';
import { Markdown } from './Markdown';
import buildConfiguration from './build-configuration.json';
import { externalFunctionTable } from './externalFunctionTable';
import { externalCmdWListTable } from './externalCmdWListTable';
import i18n from './i18n';

/**
 * Synchronize interpreter configuration and language-aware UI components with
 * the current application locale.
 */
const syncLanguage = (): void => {
    appEngine.lang = i18n.locale;
    InterpreterConfiguration.aliasNameTable = languageAlias[i18n.locale];
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

export const languageAlias: Record<string, AliasNameTable> = {
    en: {
        /* Number functions */
        abs: /^abs(olute)?$/,
        arg: /^arg(ument)?$|^angle$/,
        sign: /^sign(al)?$|^sgn$/,
        conj: /^conj(ugate)?$/,
        sqrt: /^sq(uare)?r(oo)?t$/,
        root: /^r(oo)?t$/,
        power: /^pow(er)?$/,
        exp: /^exp(onential)?$/,
        log: /^ln$/,
        log10: /^l((og)?arithm)10$/,
        asin: /^a(rc)?sine?$/,
        sin: /^sin$/,
        acos: /^a(rc)?cos(ine)?$/,
        cos: /^cos(ine)?$/,
        atan: /^a(rc)?tan(gent)?$/,
        tan: /^tan(gent)?$/,
        asinh: /^a(rea)?sine?h(((yp)?erb)?olic)?$/,
        sinh: /^sine?h(((yp)?erb)?olic)?$/,
        acosh: /^a(rea)?cos(ine)?h(((yp)?erb)?olic)?$/,
        cosh: /^cos(ine)?h(((yp)?erb)?olic)?$/,
        atanh: /^a(rea)?tan(gent)?h(((yp)?erb)?olic)?$/,
        tanh: /^tan(gent)?h(((yp)?erb)?olic)?$/,
        factorial: /^fact(orial)?$/,
        /* Matrix functions */
        eye: /^ident(ity)?$/,
        inv: /^inv(erse)?$/,
        det: /^det(erminant)?$/,
        trace: /^tr(ace)?$/,
        ctranspose: /^trans(p((ose)?)?)?$/,
        elem: /^elem(ent)?$/,
        row: /^line?$/,
        nrows: /^n(um)?lin(es)?$/,
        col: /^col(umn)?$/,
        ncols: /^n(um)?col(umn)?s$/,
        lu: /^lu(dec(omp(osition)?)?)?$/,
        plu: /^plu(dec(omp(osition)?)?)?$/,
        min: /^min(imum)??!(us)$/,
        max: /^max(imum)?$/,
        /* Special functions */
        plot2d: /^graph(ics?)?$/,
        histogram: /^hist(ogram)?$/,
    },
    es: {
        /* Number functions */
        abs: /^abs(olute)?$/,
        arg: /^arg(ument)?$|^angle$/,
        sign: /^sign(al)?$|^sgn$/,
        conj: /^conj(ugate)?$/,
        sqrt: /^sq(uare)?r(oo)?t$/,
        root: /^r(oo)?t$/,
        power: /^pow(er)?$/,
        exp: /^exp(onential)?$/,
        log: /^ln$/,
        log10: /^l((og)?arithm)10$/,
        asin: /^a(rc)?sine?$/,
        sin: /^sin$/,
        acos: /^a(rc)?cos(ine)?$/,
        cos: /^cos(ine)?$/,
        atan: /^a(rc)?tan(gent)?$/,
        tan: /^tan(gent)?$/,
        asinh: /^a(rea)?sine?h(((yp)?erb)?olic)?$/,
        sinh: /^sine?h(((yp)?erb)?olic)?$/,
        acosh: /^a(rea)?cos(ine)?h(((yp)?erb)?olic)?$/,
        cosh: /^cos(ine)?h(((yp)?erb)?olic)?$/,
        atanh: /^a(rea)?tan(gent)?h(((yp)?erb)?olic)?$/,
        tanh: /^tan(gent)?h(((yp)?erb)?olic)?$/,
        factorial: /^fact(orial)?$/,
        /* Matrix functions */
        eye: /^ident(ity)?$/,
        inv: /^inv(erse)?$/,
        det: /^det(erminant)?$/,
        trace: /^tr(ace)?$/,
        ctranspose: /^trans(p((ose)?)?)?$/,
        elem: /^elem(ent)?$/,
        row: /^line?$/,
        nrows: /^n(um)?lin(es)?$/,
        col: /^col(umn)?$/,
        ncols: /^n(um)?col(umn)?s$/,
        lu: /^lu(dec(omp(osition)?)?)?$/,
        plu: /^plu(dec(omp(osition)?)?)?$/,
        min: /^min(imum)??!(us)$/,
        max: /^max(imum)?$/,
        /* Special functions */
        plot2d: /^graph(ics?)?$/,
        histogram: /^hist(ogram)?$/,
    },
    pt: {
        /* Number functions */
        abs: /^abs(olut(o|e))?$/,
        arg: /^arg(ument(o)?)?$|^angle$|^angulo$/,
        sign: /^sign(al)?$|^sinal$|^sgn$/,
        conj: /^conj(uga(do|te)?)?$/,
        sqrt: /^r(ai)?z(2|q(uadrada)?)$|^sqrt$/,
        root: /^r(ai)?z$|^r(oo)?t$/,
        power: /^pot(encia)?$|^elev(ado)?|^pow(er)?$/,
        exp: /^exp(onen((cial)|(tial)))?$/,
        log: /^ln$/,
        log10: /^l((og)?aritmo)10$/,
        asin: /^a(rc)?s[ei]n$/,
        sin: /^s[ei]n$/,
        acos: /^a(rc)?cos$/,
        cos: /^cos$/,
        atan: /^a(rc)?t(g|an)$/,
        tan: /^t(g|an)$/,
        asinh: /^a(rc)?s[ei]nh$/,
        sinh: /^s[ei]nh$/,
        acosh: /^a(rc)?cosh$/,
        cosh: /^cosh$/,
        atanh: /^a(rc)?t(g|an)h$/,
        tanh: /^t(g|an)h$/,
        factorial: /^fa(c)?t(orial)?$/,
        binomial: /^binom(i(o|al))?$/,
        /* Matrix functions */
        eye: /^ident(i(dade|ty))?$|^eye$/,
        inv: /^inv(er(t(er)?|s[ea])?)?$/,
        det: /^det(erminant(e)?)?$/,
        trace: /^tr(aco|ace)$/,
        ctranspose: /^trans(p((ose)?|(osta)?))?$/,
        // lu: /^lu(dec(omp(osi[cç][aã]o|osition)?)?)?|(dec(omp(osicao|osition)?)?)?lu$/,
        // plu: /^plu(dec(omp(osi[cç][aã]o|osition)?)?)?|(dec(omp(osicao|osition)?)?)?plu$/,
        minus: /^menos$$/,
        min: /^min(imo)??!(us)$|^min(imum)??!(us)$/,
        max: /^max(imo)?$|^max(imum)?$/,
        mean: /^media|mean$/,
        /* Special functions */
        summation: /^somatorio$/,
        productory: /^produtorio$/,
        plus: /^mais$/,
        plot2d: /^gra(f(ico)?|ph?(ics?)?)?$/,
        histogram: /^hist(ogram(a)?)?$/,
    },
};

export const InterpreterConfiguration: InterpreterConfig = {
    /**
     * Alias table
     */
    aliasNameTable: languageAlias[i18n.locale],

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
    InterpreterConfiguration.externalFunctionTable!.open.func();
};

Object.assign(InterpreterConfiguration.externalCmdWListTable!, {
    open: {
        func: (...args: string[]): void => {
            InterpreterConfiguration.externalFunctionTable!.open.func(...args);
        },
    },
});

/**
 * Initialize the interpreter and Markdown services.
 */
function bootstrap() {
    const baseUrl = globalThis.location.href.substring(0, globalThis.location.href.lastIndexOf('/') + 1);
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
    InterpreterConfiguration.aliasNameTable = languageAlias[i18n.locale];
    appEngine.interpreter = Interpreter.Create(InterpreterConfiguration);
    appEngine.interpreter.debug = buildConfiguration.debug;
    appEngine.buildMessage = buildConfiguration.buildMessage;
    Markdown.initialize();
}
bootstrap();
