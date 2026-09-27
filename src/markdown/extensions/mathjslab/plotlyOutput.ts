import type { MathJSLabNodeOutput } from './executor';
import type { MathJSLabWorkerOutput } from './workerProtocol';

export const materializePlotlyOutput = (output: Extract<MathJSLabWorkerOutput, { type: 'visualization'; renderer: 'plotly' }>): MathJSLabNodeOutput => {
    const node = document.createElement('div');
    node.className = 'plot-output';
    node.dataset.outputType = output.request.type;
    return {
        type: 'node',
        node,
        role: output.role,
        mount: async () => (await import('../../../PlotEngine')).PlotEngine.render(node, output.request),
        resize: async () => (await import('../../../PlotEngine')).PlotEngine.resize(node),
        dispose: async () => (await import('../../../PlotEngine')).PlotEngine.dispose(node),
    };
};
