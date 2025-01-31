import './fetchPolyfill';
import './showOpenFilePickerPolyfill';
import openFileDialog from './openFileDialog';

import {
    AST,
    Decimal,
    ComplexDecimal,
    MultiArray,
    Evaluator,
    CharString,
    LinearAlgebra,
    EvaluatorConfig,
    AliasNameTable,
    bundleConfiguration,
} from 'mathjslab';

import type { ElementType } from 'mathjslab';

export { Evaluator };

import { MathMarkdown } from './MathMarkdown';
export { MathMarkdown };

import buildConfiguration from './build-configuration.json';
import DynamicModule from './DynamicModule';

export type MathJSLabCalcConfiguration = {
    exampleBaseUrl?: string;
    helpBaseUrl?: string;
    defaultLanguage?: string;
};

declare global {
    var EvaluatorPointer: Evaluator;

    var MathJSLabCalc: MathJSLabCalcConfiguration;

    var MathJSLabCalcBuildMessage: string;

    var lang: string;

    var setLanguage: (lang?: string) => void;

    var openFile: () => void;
}

/**
 * To change the language after load (to be used in a language selection menu, for example).
 * @param lang
 */
global.setLanguage = (lang?: string): void => {
    if (lang) {
        global.lang = lang in languageAlias ? lang : (MathJSLabCalc.defaultLanguage as string);
    }
    document.querySelector('html')!.setAttribute('lang', global.lang);
    global.ShellPointer.setLanguage();
    EvaluatorConfiguration.aliasNameTable = languageAlias[global.lang];
    global.EvaluatorPointer = new Evaluator(EvaluatorConfiguration);
    global.EvaluatorPointer.debug = buildConfiguration.debug;
    global.ShellPointer.batchExec(new Event('click'));
};

/**
 * To open file from device.
 */
global.openFile = (): void => {
    EvaluatorConfiguration.externalFunctionTable!.open.func();
};

const openFileOptionMathJSLab: OpenFilePickerOptions & { multiple?: false | undefined } = {
    multiple: false,
    types: [
        {
            description: 'MathJSLab files',
            accept: { 'text/plain': ['.txt', '.m'] },
        },
    ],
    excludeAcceptAllOption: true,
};

const openFileOptionMarkdown: OpenFilePickerOptions & { multiple?: false | undefined } = {
    multiple: false,
    types: [
        {
            description: 'Markdown files',
            accept: { 'text/plain': ['.txt', '.md'] },
        },
    ],
    excludeAcceptAllOption: true,
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

declare const Chart: any;

export type PlotData = {
    data: Array<number>;
    X: Array<number | string>;
    MinX: number;
    MaxX: number;
    MinY: number;
    MaxY: number;
};

export const plotData: PlotData = {
    data: [],
    X: [],
    MinX: 0,
    MaxX: 0,
    MinY: 0,
    MaxY: 0,
};

export const plotWidth = 100;

export const insertOutput = { type: '' };

export const _plotData: Plotly.Data[] = [];

export const outputFunction: { [k: string]: Function } = {
    plot: function (parent: string): void {
        DynamicModule.use('plotly', (Plotly: any) => {
            const trace1 = {
                x: [1, 2.5, 3, 4],
                y: [10, 15, 13, 17],
                type: 'scatter',
            };

            const trace2 = {
                x: [1, 2, 3, 4],
                y: [16, 5, 11, 9],
                type: 'scatter',
            };

            const data = [trace1, trace2];

            Plotly.newPlot(parent, data);
        });
        insertOutput.type = '';
    },
    plot3: function (parent: string): void {
        DynamicModule.use('plotly', (Plotly: any) => {
            const line3d = {
                x: [] as number[],
                y: [] as number[],
                z: [] as number[],
                type: 'scatter3d',
                mode: 'lines',
            };
            // create some nice looking data with sin/cos
            const steps = 500;
            const axisMax = 314;
            const tmax = 4 * 2 * Math.PI;
            const axisStep = axisMax / steps;
            for (let t = 0; t < tmax; t += tmax / steps) {
                const r = 1;
                const x = r * Math.sin(t);
                const y = r * Math.cos(t);
                const z = t / tmax;
                line3d.x.push(x);
                line3d.y.push(y);
                line3d.z.push(z);
            }

            const data = [line3d];

            const layout = {
                autosize: true,
            };
            Plotly.newPlot(parent, data, layout);
        });
        insertOutput.type = '';
    },
    surf: function (parent: string): void {
        insertOutput.type = '';
        DynamicModule.use('plotly', (Plotly: any) => {
            function custom(x: number, y: number) {
                return Math.sin(x / 50) * Math.cos(y / 50) * 50 + 50;
            }

            const steps = 50; // number of datapoints will be steps*steps
            const axisMax = 314;
            const axisStep = axisMax / steps;

            const surface1 = {
                x: new Array(steps) as number[],
                y: new Array(steps) as number[],
                z: new Array(steps) as number[][],
                type: 'surface',
            };

            for (let x = 0, i = 0; x < axisMax; x += axisStep, i++) {
                surface1.x[i] = x;
                surface1.z[i] = new Array(steps) as number[];
                for (let y = 0, j = 0; y < axisMax; y += axisStep, j++) {
                    if (i === 0) {
                        surface1.y[j] = y;
                    }
                    surface1.z[i][j] = custom(x, y);
                }
            }

            const data = [surface1];

            const layout = {
                title: '3D Plot',
                autosize: true,
            };
            Plotly.newPlot(parent, data, layout);
        });
        insertOutput.type = '';
    },
    plot2d: function (parent: string): void {
        DynamicModule.use('plotly', (Plotly: any) => {
            const trace = {
                x: plotData.X,
                y: plotData.data,
                type: 'lines',
            };

            const data = [trace];

            Plotly.newPlot(parent, data);
        });
        insertOutput.type = '';
    },
    histogram: function (parent: string): void {
        DynamicModule.use('plotly', (Plotly: any) => {
            const histogram = {
                x: plotData.X,
                y: plotData.data,
                type: 'bar',
            };

            const data = [histogram];

            Plotly.newPlot(parent, data);
        });
        insertOutput.type = '';
    },
};

export const EvaluatorConfiguration: EvaluatorConfig = {
    /**
     * Alias table
     */
    aliasNameTable: languageAlias[global.lang],

    /**
     * External function table
     */
    externalFunctionTable: {
        summation: {
            type: 'BUILTIN',
            mapper: false,
            ev: [false, true, true, false],
            func: (variable: AST.NodeIdentifier, start: ComplexDecimal, end: ComplexDecimal, expr: AST.NodeExpr): ComplexDecimal => {
                if (!start.im.eq(0)) throw new Error('complex number sum index');
                if (!end.im.eq(0)) throw new Error('complex number sum index');
                let result: ComplexDecimal = ComplexDecimal.zero();
                const sum_function_name = `summation_${global.crypto.randomUUID()}`;
                global.EvaluatorPointer.localTable[sum_function_name] = {};
                for (let i = start.re.toNumber(); i <= end.re.toNumber(); i++) {
                    global.EvaluatorPointer.localTable[sum_function_name][variable.id] = new ComplexDecimal(i, 0);
                    result = ComplexDecimal.add(result, global.EvaluatorPointer.Evaluator(expr, true, sum_function_name));
                }
                delete global.EvaluatorPointer.localTable[sum_function_name];
                return result;
            },
            unparserMathML: (tree: any): string => {
                return (
                    '<mstyle displaystyle="true"><munderover><mo>&sum;</mo><mrow>' +
                    global.EvaluatorPointer.unparserMathML(tree.args[0]) +
                    '<mo>=</mo>' +
                    global.EvaluatorPointer.unparserMathML(tree.args[1]) +
                    '</mrow><mrow>' +
                    global.EvaluatorPointer.unparserMathML(tree.args[2]) +
                    '</mrow>' +
                    '</munderover>' +
                    global.EvaluatorPointer.unparserMathML(tree.args[3]) +
                    '</mstyle>'
                );
            },
        },

        productory: {
            type: 'BUILTIN',
            mapper: false,
            ev: [false, true, true, false],
            func: (variable: AST.NodeIdentifier, start: ComplexDecimal, end: ComplexDecimal, expr: AST.NodeExpr): ComplexDecimal => {
                if (!start.im.eq(0)) throw new Error('complex number prod index');
                if (!end.im.eq(0)) throw new Error('complex number prod index');
                let result: ComplexDecimal = ComplexDecimal.one();
                const prod_function_name = `productory_${global.crypto.randomUUID()}`;
                global.EvaluatorPointer.localTable[prod_function_name] = {};
                for (let i = start.re.toNumber(); i <= end.re.toNumber(); i++) {
                    global.EvaluatorPointer.localTable[prod_function_name][variable.id] = new ComplexDecimal(i, 0);
                    result = ComplexDecimal.mul(result, global.EvaluatorPointer.Evaluator(expr, true, prod_function_name));
                }
                delete global.EvaluatorPointer.localTable[prod_function_name];
                return result;
            },
            unparserMathML: (tree: any): string => {
                return (
                    '<mstyle displaystyle="true"><munderover><mo>&prod;</mo><mrow>' +
                    global.EvaluatorPointer.unparserMathML(tree.args[0]) +
                    '<mo>=</mo>' +
                    global.EvaluatorPointer.unparserMathML(tree.args[1]) +
                    '</mrow><mrow>' +
                    global.EvaluatorPointer.unparserMathML(tree.args[2]) +
                    '</mrow>' +
                    '</munderover>' +
                    global.EvaluatorPointer.unparserMathML(tree.args[3]) +
                    '</mstyle>'
                );
            },
        },

        plot: {
            type: 'BUILTIN',
            mapper: false,
            ev: [],
            func: (...args: ElementType[]): AST.NodeExpr => {
                insertOutput.type = 'plot';
                return AST.nodeIndexExpr(AST.nodeIdentifier('plot'), AST.nodeList(args));
            },
        },

        plot3: {
            type: 'BUILTIN',
            mapper: false,
            ev: [],
            func: (...args: ElementType[]): AST.NodeExpr => {
                insertOutput.type = 'plot3';
                return AST.nodeIndexExpr(AST.nodeIdentifier('plot3'), AST.nodeList(args));
            },
        },

        surf: {
            type: 'BUILTIN',
            mapper: false,
            ev: [],
            func: (...args: ElementType[]): AST.NodeExpr => {
                insertOutput.type = 'surf';
                return AST.nodeIndexExpr(AST.nodeIdentifier('surf'), AST.nodeList(args));
            },
        },

        plot2d: {
            type: 'BUILTIN',
            mapper: false,
            ev: [false, false, true, true],
            func: (expr: AST.NodeExpr, variable: AST.NodeIdentifier, minx: ComplexDecimal, maxx: ComplexDecimal): AST.NodeExpr => {
                insertOutput.type = 'plot2d';
                if (!minx.im.eq(0)) {
                    throw new Error('complex number in plot2d minimum x axis');
                } else {
                    plotData.MinX = minx.re.toNumber();
                }
                if (!maxx.im.eq(0)) {
                    throw new Error('complex number in plot2d maximum x axis');
                } else {
                    plotData.MaxX = maxx.re.toNumber();
                }
                const deltaX = (plotData.MaxX - plotData.MinX) / plotWidth;
                const plot_function_name = `plot2d_${global.crypto.randomUUID()}`;
                global.EvaluatorPointer.localTable[plot_function_name] = {};
                const save_precision = Decimal.precision;
                Decimal.set({ precision: 20 });
                plotData.MaxY = 0;
                plotData.MinY = 0;
                plotData.X = [];
                plotData.data = [];
                for (let i = 0; i < plotWidth; i++) {
                    global.EvaluatorPointer.localTable[plot_function_name][variable.id] = new ComplexDecimal(plotData.MinX + deltaX * i, 0);
                    plotData.X[i] = global.EvaluatorPointer.localTable[plot_function_name][variable.id].re.toNumber();
                    const data_y = global.EvaluatorPointer.Evaluator(expr, true, plot_function_name);
                    if (isFinite(data_y.re.toNumber()) && isFinite(data_y.im.toNumber()) && data_y.im.eq(0)) {
                        plotData.data[i] = data_y.re.toNumber();
                    } else {
                        throw new Error('non real number in plot2d y axis');
                    }
                    plotData.MaxY = Math.max(plotData.MaxY, plotData.data[i]);
                    plotData.MinY = Math.min(plotData.MinY, plotData.data[i]);
                }
                delete global.EvaluatorPointer.localTable[plot_function_name];
                Decimal.set({ precision: save_precision });
                return AST.nodeIndexExpr(AST.nodeIdentifier('plot2d'), AST.nodeList([expr, variable, minx, maxx]));
            },
        },

        histogram: {
            type: 'BUILTIN',
            mapper: false,
            ev: [true, true],
            func: (IMAG: MultiArray, DOM?: MultiArray): AST.NodeExpr => {
                insertOutput.type = 'histogram';
                if (IMAG.dimension[0] !== 1) {
                    IMAG = LinearAlgebra.transpose(IMAG);
                }
                if (DOM && DOM.dimension[0] !== 1) {
                    DOM = LinearAlgebra.transpose(DOM);
                }
                plotData.MaxY = 0;
                plotData.MinY = 0;
                plotData.X = [];
                plotData.data = [];
                for (let i = 0; i < IMAG.dimension[1]; i++) {
                    if (DOM) {
                        if (DOM.array[0][i] instanceof ComplexDecimal) {
                            plotData.X[i] = (DOM.array[0][i] as ComplexDecimal).re.toNumber();
                        } else if (DOM.array[0][i] instanceof CharString) {
                            plotData.X[i] = (DOM.array[0][i] as any).str;
                        }
                    } else {
                        plotData.X[i] = i;
                    }
                    if (
                        isFinite((IMAG.array[0][i] as ComplexDecimal).re.toNumber()) &&
                        isFinite((IMAG.array[0][i] as ComplexDecimal).im.toNumber()) &&
                        (IMAG.array[0][i] as ComplexDecimal).im.eq(0)
                    ) {
                        plotData.data[i] = (IMAG.array[0][i] as ComplexDecimal).re.toNumber();
                    } else {
                        throw new Error('non real number in histogram y axis');
                    }
                    plotData.MaxY = Math.max(plotData.MaxY, plotData.data[i]);
                    plotData.MinY = Math.min(plotData.MinY, plotData.data[i]);
                }
                return AST.nodeIndexExpr(AST.nodeIdentifier('histogram'), AST.nodeList([IMAG, DOM]));
            },
        },

        open: {
            type: 'BUILTIN',
            mapper: false,
            ev: [true],
            func: (url?: CharString): AST.NodeExpr => {
                const promptSet = global.ShellPointer.currentPromptSet;
                if (url) {
                    if (global.ShellPointer.isFileProtocol) {
                        promptSet.box.className = 'bad';
                        promptSet.output.innerHTML = 'open function unavailable <b>offline</b>.';
                    } else {
                        global
                            .fetch(url.str)
                            .then((response) => {
                                if (response.ok) {
                                    return response.text();
                                } else {
                                    throw new URIError('Load error.');
                                }
                            })
                            .then((responseFile: string) => {
                                global.ShellPointer.openContent(responseFile);
                            })
                            /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
                            .catch((error) => {
                                promptSet.box.className = 'bad';
                                promptSet.output.innerHTML = `open: error loading ${url.str}`;
                            });
                    }
                    return AST.nodeIndexExpr(AST.nodeIdentifier('open'), AST.nodeList([url.str]));
                } else {
                    openFileDialog((content: string) => {
                        global.ShellPointer.openContent(content);
                    }, openFileOptionMathJSLab);
                    return AST.nodeIndexExpr(AST.nodeIdentifier('open'), AST.nodeListFirst());
                }
            },
        },

        markdown: {
            type: 'BUILTIN',
            mapper: false,
            ev: [true],
            func: (url?: CharString): AST.NodeExpr => {
                const promptSet = global.ShellPointer.currentPromptSet;
                if (url) {
                    if (global.ShellPointer.isFileProtocol) {
                        promptSet.box.className = 'bad';
                        promptSet.output.innerHTML = 'markdown function unavailable <b>offline</b>.';
                    } else {
                        global
                            .fetch(url.str)
                            .then((response) => {
                                if (response.ok) {
                                    return response.text();
                                } else {
                                    throw new URIError('Load error.');
                                }
                            })
                            .then((responseFile: string) => {
                                promptSet.box.className = 'doc';
                                promptSet.output.innerHTML = MathMarkdown.md2html(responseFile);
                                MathMarkdown.typeset();
                            })
                            /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
                            .catch((error) => {
                                promptSet.box.className = 'bad';
                                promptSet.output.innerHTML = `markdown: error loading ${url.str}`;
                            });
                    }
                    return AST.nodeIndexExpr(AST.nodeIdentifier('markdown'), AST.nodeList([url.str]));
                } else {
                    openFileDialog((content: string) => {
                        promptSet.box.className = 'doc';
                        promptSet.output.innerHTML = MathMarkdown.md2html(content);
                        MathMarkdown.typeset();
                    }, openFileOptionMarkdown);
                    return AST.nodeIndexExpr(AST.nodeIdentifier('markdown'), AST.nodeListFirst());
                }
            },
        },

        load: {
            type: 'BUILTIN',
            mapper: false,
            ev: [true],
            func: (...url: CharString[]): AST.NodeExpr => {
                const promptSet = global.ShellPointer.currentPromptSet;
                const loadContent = (content: string, name: string) => {
                    let error: boolean = false;
                    let errorMessage: string = '';
                    insertOutput.type = '';
                    promptSet.output.innerHTML = '';
                    try {
                        const tree = global.EvaluatorPointer.Parse(content);
                        if (tree) {
                            global.EvaluatorPointer.Evaluate(tree);
                        }
                    } catch (e) {
                        error = true;
                        errorMessage = `load: error loading ${name}: ${e}`;
                    }
                    if (error) {
                        promptSet.box.className = 'bad';
                        promptSet.output.innerHTML = errorMessage;
                    } else {
                        promptSet.box.className = 'good';
                        promptSet.output.innerHTML = `Loaded script from ${name}</ br>`;
                    }
                    global.ShellPointer.refreshNameList();
                };
                if (url.length > 0) {
                    if (global.ShellPointer.isFileProtocol) {
                        promptSet.box.className = 'bad';
                        promptSet.output.innerHTML = 'load function unavailable <b>offline</b>.';
                    } else {
                        url.forEach((file: CharString) => {
                            global
                                .fetch(file.str)
                                .then((response) => {
                                    if (response.ok) {
                                        return response.text();
                                    } else {
                                        throw new URIError('Load error.');
                                    }
                                })
                                .then((responseFile: string) => {
                                    loadContent(responseFile, file.str);
                                })
                                /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
                                .catch((error) => {
                                    promptSet.box.className = 'bad';
                                    promptSet.output.innerHTML = `load: error loading ${file.str}`;
                                });
                        });
                    }
                    return AST.nodeIndexExpr(AST.nodeIdentifier('load'), AST.nodeList([...url.map((url) => AST.nodeString(url.str))]));
                } else {
                    openFileDialog((content: string) => {
                        loadContent(content, 'file');
                    }, openFileOptionMathJSLab);
                    return AST.nodeIndexExpr(AST.nodeIdentifier('load'), AST.nodeListFirst());
                }
            },
        },
    },

    /**
     * External command word list table
     */
    externalCmdWListTable: {
        help: {
            func: (...args: string[]): void => {
                const encodeName = (name: string): string => {
                    name = global.EvaluatorPointer.aliasName(name);
                    const result: string[] = [];
                    for (let i = 0; i < name.length; i++) {
                        const c = name.charCodeAt(i);
                        if (
                            (c >= 48 && c <= 57) || // digit
                            (c >= 65 && c <= 90) || // Upper case letter
                            (c >= 97 && c <= 122) // Lower case letter
                        ) {
                            result.push(name[i]);
                        } else {
                            result.push(`%${name.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0')}`);
                        }
                    }
                    return result.join('');
                };
                const promptSet = global.ShellPointer.currentPromptSet;
                if (args.length == 1) {
                    if (global.ShellPointer.isFileProtocol) {
                        promptSet.box.className = 'bad';
                        promptSet.output.innerHTML = 'help command unavailable <b>offline</b>.';
                    } else {
                        global
                            .fetch(`${global.MathJSLabCalc.helpBaseUrl}help/${global.lang}/${encodeURIComponent(encodeName(args[0]))}.md`)
                            .then((response) => {
                                if (response.ok) {
                                    promptSet.box.className = 'info';
                                    return response.text();
                                } else {
                                    promptSet.box.className = 'bad';
                                    return `help ${args[0]} not found.`;
                                }
                            })
                            .then((responseText) => {
                                promptSet.output.innerHTML = MathMarkdown.md2html(responseText);
                                MathMarkdown.typeset();
                            });
                    }
                } else if (args.length == 0) {
                    promptSet.box.className = 'info';
                    global
                        .fetch(`${global.MathJSLabCalc.helpBaseUrl}help/${global.lang}/help.md`)
                        .then((response) => {
                            if (response.ok) {
                                promptSet.box.className = 'info';
                                return response.text();
                            } else {
                                promptSet.box.className = 'bad';
                                return `help ${args[0]} not found.`;
                            }
                        })
                        .then((responseText) => {
                            promptSet.output.innerHTML = MathMarkdown.md2html(
                                responseText +
                                    global.EvaluatorPointer.builtInFunctionList
                                        .map((func) => `\`${func}\``)
                                        .sort()
                                        .join(', '),
                            );
                            MathMarkdown.typeset();
                        });
                } else {
                    promptSet.box.className = 'bad';
                    promptSet.output.innerHTML = `help: function called with too many inputs`;
                }
            },
        },

        open: {
            func: (...args: string[]): void => {
                EvaluatorConfiguration.externalFunctionTable!.open.func(...args);
            },
        },
    },
};

/**
 * Evaluator and MathMarkdown initialization.
 */
function bootstrap() {
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    if (typeof global.MathJSLabCalc === 'undefined') {
        global.MathJSLabCalc = {
            exampleBaseUrl: baseUrl,
            helpBaseUrl: baseUrl,
            defaultLanguage: 'en',
        };
    } else {
        if (global.MathJSLabCalc.exampleBaseUrl !== undefined || global.MathJSLabCalc.exampleBaseUrl !== null) {
            if (global.MathJSLabCalc.exampleBaseUrl![global.MathJSLabCalc.exampleBaseUrl!.length - 1] !== '/') {
                global.MathJSLabCalc.exampleBaseUrl += '/';
            }
        } else {
            global.MathJSLabCalc.exampleBaseUrl = baseUrl;
        }
        if (global.MathJSLabCalc.helpBaseUrl !== undefined || global.MathJSLabCalc.helpBaseUrl !== null) {
            if (global.MathJSLabCalc.helpBaseUrl![global.MathJSLabCalc.helpBaseUrl!.length - 1] !== '/') {
                global.MathJSLabCalc.helpBaseUrl += '/';
            }
        } else {
            global.MathJSLabCalc.helpBaseUrl = baseUrl;
        }
        if (global.MathJSLabCalc.defaultLanguage === undefined || global.MathJSLabCalc.defaultLanguage === null) {
            global.MathJSLabCalc.defaultLanguage = 'en';
        }
    }
    global.lang = navigator.language.split('-')[0];
    if (!(global.lang in languageAlias)) {
        global.lang = global.MathJSLabCalc.defaultLanguage as string;
    }
    EvaluatorConfiguration.aliasNameTable = languageAlias[global.lang];
    global.EvaluatorPointer = new Evaluator(EvaluatorConfiguration);
    global.EvaluatorPointer.debug = buildConfiguration.debug;
    global.MathJSLabCalcBuildMessage = buildConfiguration.buildMessage + `, bundle: ${bundleConfiguration}`;
    MathMarkdown.initialize();
}
bootstrap();
