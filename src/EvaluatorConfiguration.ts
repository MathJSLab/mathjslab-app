import './showOpenFilePickerPolyfill';
import { Evaluator, EvaluatorConfig, AliasNameTable, bundleConfiguration } from 'mathjslab';
import { appEngine } from './appEngine';
import { MathMarkdown } from './MathMarkdown';
import buildConfiguration from './build-configuration.json';
import { externalFunctionTable } from './externalFunctionTable';
import { externalCmdWListTable } from './externalCmdWListTable';

/**
 * To change the language after load (to be used in a language selection menu, for example).
 * @param lang
 */
appEngine.setLanguage = (lang?: string): void => {
    if (lang) {
        appEngine.lang = lang in languageAlias ? lang : appEngine.config.defaultLanguage!;
    }
    document.querySelector('html')!.setAttribute('lang', appEngine.lang);
    appEngine.shell.commandShell.setLanguage(appEngine.lang);
    EvaluatorConfiguration.aliasNameTable = languageAlias[appEngine.lang];
    appEngine.evaluator = new Evaluator(EvaluatorConfiguration);
    appEngine.evaluator.debug = buildConfiguration.debug;
    appEngine.shell.commandShell.evaluate();
};

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

export const EvaluatorConfiguration: EvaluatorConfig = {
    /**
     * Alias table
     */
    aliasNameTable: languageAlias[appEngine.lang],

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
 * To open file from device.
 */
appEngine.openFile = (): void => {
    EvaluatorConfiguration.externalFunctionTable!.open.func();
};

Object.assign(EvaluatorConfiguration.externalCmdWListTable!, {
    open: {
        func: (...args: string[]): void => {
            EvaluatorConfiguration.externalFunctionTable!.open.func(...args);
        },
    },
});

/**
 * Evaluator and MathMarkdown initialization.
 */
function bootstrap() {
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
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
    appEngine.lang = navigator.language.split('-')[0];
    if (!(appEngine.lang in languageAlias)) {
        appEngine.lang = appEngine.config.defaultLanguage!;
    }
    EvaluatorConfiguration.aliasNameTable = languageAlias[appEngine.lang];
    appEngine.evaluator = new Evaluator(EvaluatorConfiguration);
    appEngine.evaluator.debug = buildConfiguration.debug;
    appEngine.buildMessage = buildConfiguration.buildMessage + `, bundle: ${bundleConfiguration}`;
    MathMarkdown.initialize();
}
bootstrap();
