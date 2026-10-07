import type { MathJSLabNodeOutput, MathJSLabPlotlyRequest } from './executor';
import type { MathJSLabWorkerOutput } from './workerProtocol';

export type MathJSLabPlotRenderer = {
    readonly render: (container: HTMLElement, request: MathJSLabPlotlyRequest) => void | Promise<void>;
    readonly resize?: (container: HTMLElement) => void | Promise<void>;
    readonly dispose?: (container: HTMLElement) => void | Promise<void>;
};

export const materializePlotlyOutput = (output: Extract<MathJSLabWorkerOutput, { type: 'visualization'; renderer: 'plotly' }>, renderer?: MathJSLabPlotRenderer): MathJSLabNodeOutput => {
    if (!renderer) throw new Error('A Plotly renderer must be supplied to materialize MathJSLab visualization output.');
    const node = document.createElement('div');
    node.className = 'plot-output';
    node.dataset.outputType = output.request.type;
    return {
        type: 'node',
        node,
        role: output.role,
        mount: () => renderer.render(node, output.request),
        ...(renderer.resize ? { resize: () => renderer.resize!(node) } : {}),
        ...(renderer.dispose ? { dispose: () => renderer.dispose!(node) } : {}),
    };
};
