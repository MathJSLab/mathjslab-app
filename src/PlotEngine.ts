import type Plotly from 'plotly.js-dist-min';
import { type BuiltInFunctionTable, type PlotOutputRequest, type PlotTrace } from 'mathjslab';
import { getActiveInterpreter } from './InterpreterRuntime';
export type { PlotOutputRequest } from 'mathjslab';

const insertOutput = { type: '' };
const plotDataLayoutConfig: { data: PlotTrace[]; layout?: Record<string, unknown>; config?: Record<string, unknown> } = { data: [] };
export type PlotData = { data: number[]; X: (number | string)[]; MinX: number; MaxX: number; MinY: number; MaxY: number };
const plotData: PlotData = { data: [], X: [], MinX: 0, MaxX: 0, MinY: 0, MaxY: 0 };
const plotWidth = 100;
type PlotlyApi = typeof Plotly;

let plotlyApi: PlotlyApi | undefined;

const loadPlotly = async (): Promise<PlotlyApi> => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('Plotly rendering requires a browser document.');
    }

    if (plotlyApi) return plotlyApi;

    const loadedPlotly: PlotlyApi = (await import('plotly.js-dist-min')).default;
    plotlyApi = loadedPlotly;
    return loadedPlotly;
};

/** Application-owned lazy Plotly materialization and compatibility delegation. */
abstract class PlotEngine {
    private static outputCapture: ((request: PlotOutputRequest) => void) | undefined;
    public static setOutputCapture(capture: ((request: PlotOutputRequest) => void) | undefined): ((request: PlotOutputRequest) => void) | undefined {
        const previous = this.outputCapture;
        this.outputCapture = capture;
        return previous;
    }
    public static publish(request: PlotOutputRequest): void {
        plotDataLayoutConfig.data = request.data;
        plotDataLayoutConfig.layout = request.layout;
        plotDataLayoutConfig.config = request.config;
        insertOutput.type = request.type;
        this.outputCapture?.(request);
    }
    public static async render(parent: HTMLElement, request: PlotOutputRequest): Promise<void> {
        const plotly = await loadPlotly();
        await plotly.newPlot(parent, request.data as Plotly.Data[], request.layout as Partial<Plotly.Layout>, request.config as Partial<Plotly.Config>);
    }
    public static async resize(parent: HTMLElement): Promise<void> {
        const plotly = await loadPlotly();
        await plotly.Plots.resize(parent);
    }
    public static dispose(parent: HTMLElement): void {
        plotlyApi?.purge(parent);
    }
    public static readonly outputFunction: Record<string, (parent: HTMLElement) => void> = Object.fromEntries(
        ['plot', 'plot3', 'surf', 'plot2d', 'histogram'].map((type) => [
            type,
            (parent: HTMLElement): void => {
                void PlotEngine.render(parent, {
                    type: type as PlotOutputRequest['type'],
                    data: plotDataLayoutConfig.data,
                    layout: plotDataLayoutConfig.layout ?? {},
                    config: plotDataLayoutConfig.config ?? {},
                });
                insertOutput.type = '';
            },
        ]),
    );
    public static readonly externalFunctionTable: BuiltInFunctionTable = Object.fromEntries(
        ['plot', 'plot3', 'surf', 'plot2d', 'histogram'].map((id) => [
            id,
            {
                type: 'BUILTIN',
                id,
                mapper: false,
                ev: id === 'plot2d' ? [false, false, true, true] : id === 'histogram' ? [true, true] : [],
                func: (...args: unknown[]) => getActiveInterpreter().plotFunctions[id]!.func(...args),
            },
        ]),
    );
}
export { plotDataLayoutConfig, plotData, plotWidth, insertOutput, PlotEngine };
export default { plotDataLayoutConfig, plotData, plotWidth, insertOutput, PlotEngine };
