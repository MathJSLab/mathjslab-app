import type Plotly from 'plotly.js-dist-min';
import type { PlotOutputRequest } from 'mathjslab';
export type { PlotOutputRequest } from 'mathjslab';

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

/** Application-owned lazy Plotly rendering. */
abstract class PlotEngine {
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
}
export { PlotEngine };
export default { PlotEngine };
