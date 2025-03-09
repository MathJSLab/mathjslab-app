import type * as PlotlyType from 'plotly.js';
import { type ElementType, AST, BuiltInFunctionTable, CharString, ComplexDecimal, Decimal, LinearAlgebra, MultiArray } from 'mathjslab';
import DynamicModule from './DynamicModule';
import { insertOutput } from './outputFunction';
import { appEngine } from './appEngine';

export const plotDataLayoutConfig: Plotly.PlotlyDataLayoutConfig = {
    data: [],
};

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

abstract class PlotEngine {
    public static readonly outputFunction: { [k: string]: Function } = {
        plot: function (parent: string): void {
            DynamicModule.use('plotly', async (Plotly: Promise<typeof PlotlyType>) => {
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

                const data = [trace1, trace2] as Plotly.Data[];
                (await Plotly).newPlot(parent, data);
            });
            insertOutput.type = '';
        },
        plot3: function (parent: string): void {
            DynamicModule.use('plotly', async (Plotly: Promise<typeof PlotlyType>) => {
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

                const data = [line3d] as Plotly.Data[];

                const layout = {
                    autosize: true,
                };
                (await Plotly).newPlot(parent, data, layout);
            });
            insertOutput.type = '';
        },
        surf: function (parent: string): void {
            insertOutput.type = '';
            DynamicModule.use('plotly', async (Plotly: Promise<typeof PlotlyType>) => {
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

                const data = [surface1] as Plotly.Data[];

                const layout = {
                    title: '3D Plot',
                    autosize: true,
                };
                (await Plotly).newPlot(parent, data, layout);
            });
            insertOutput.type = '';
        },
        plot2d: function (output: HTMLElement): void {
            DynamicModule.use('plotly', async (Plotly: Promise<typeof PlotlyType>) => {
                const trace = {
                    x: plotData.X,
                    y: plotData.data,
                    type: 'lines',
                };

                const data = [trace] as Plotly.Data[];
                const layout = {};
                const config = {
                    displayModeBar: false, // Mostra ou esconde a barra
                    responsive: true, // Faz o gráfico se ajustar ao tamanho do container
                    staticPlot: false, // Se `true`, o gráfico fica estático, sem interações
                    // scrollZoom: true, // Permite zoom com a roda do mouse
                };
                (await Plotly).newPlot(output, data, layout, config);
            });
            insertOutput.type = '';
        },
        histogram: function (parent: string): void {
            DynamicModule.use('plotly', async (Plotly: Promise<typeof PlotlyType>) => {
                const histogram = {
                    x: plotData.X,
                    y: plotData.data,
                    type: 'bar',
                };

                const data = [histogram] as Plotly.Data[];

                (await Plotly).newPlot(parent, data);
            });
            insertOutput.type = '';
        },
    };

    public static readonly externalFunctionTable: BuiltInFunctionTable = {
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
                const plot_function_name = `plot2d_${globalThis.crypto.randomUUID()}`;
                appEngine.evaluator.localTable[plot_function_name] = {};
                const save_precision = Decimal.precision;
                Decimal.set({ precision: 20 });
                plotData.MaxY = 0;
                plotData.MinY = 0;
                plotData.X = [];
                plotData.data = [];
                for (let i = 0; i < plotWidth; i++) {
                    appEngine.evaluator.localTable[plot_function_name][variable.id] = new ComplexDecimal(plotData.MinX + deltaX * i, 0);
                    plotData.X[i] = appEngine.evaluator.localTable[plot_function_name][variable.id].re.toNumber();
                    const data_y = appEngine.evaluator.Evaluator(expr, true, plot_function_name);
                    if (isFinite(data_y.re.toNumber()) && isFinite(data_y.im.toNumber()) && data_y.im.eq(0)) {
                        plotData.data[i] = data_y.re.toNumber();
                    } else {
                        throw new Error('non real number in plot2d y axis');
                    }
                    plotData.MaxY = Math.max(plotData.MaxY, plotData.data[i]);
                    plotData.MinY = Math.min(plotData.MinY, plotData.data[i]);
                }
                delete appEngine.evaluator.localTable[plot_function_name];
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
                            plotData.X[i] = (DOM.array[0][i] as CharString).str;
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
    };

    public static plot(...args: ElementType[]): AST.NodeExpr {}

    public static plot3(...args: ElementType[]): AST.NodeExpr {}

    public static surf(...args: ElementType[]): AST.NodeExpr {}
}

export { PlotEngine };
export default PlotEngine;
