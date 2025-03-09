import type * as PlotlyType from 'plotly.js';
import { type ElementType, AST } from 'mathjslab';
import DynamicModule from './DynamicModule';

export const plotDataLayoutConfig: Plotly.PlotlyDataLayoutConfig = {
    data: [],
};

export const insertOutput = { type: '' };

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

export const outputFunction: { [k: string]: Function } = {
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
    plot2d: function (parent: string): void {
        DynamicModule.use('plotly', async (Plotly: Promise<typeof PlotlyType>) => {
            const trace = {
                x: plotData.X,
                y: plotData.data,
                type: 'lines',
            };

            const data = [trace] as Plotly.Data[];

            (await Plotly).newPlot(parent, data);
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

export default abstract class PlotEngine {
    public static plot(...args: ElementType[]): AST.NodeExpr {}

    public static plot3(...args: ElementType[]): AST.NodeExpr {}

    public static surf(...args: ElementType[]): AST.NodeExpr {}
}
