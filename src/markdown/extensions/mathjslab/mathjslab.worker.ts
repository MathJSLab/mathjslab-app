import { InProcessMathJSLabRuntime, RuntimeWorkerServer, type RuntimeOutput } from 'mathjslab/runtime';
import { commonExternalFunctionTable } from '../../../commonExternalFunctionTable';
import { withActiveInterpreter } from '../../../InterpreterRuntime';
import { PlotEngine } from '../../../PlotEngine';
import { withPlotOutputCapture } from '../../../PlotOutputCapture';

new RuntimeWorkerServer(
    globalThis as unknown as ConstructorParameters<typeof RuntimeWorkerServer>[0],
    (host) =>
        new InProcessMathJSLabRuntime({
            host,
            sessionDefaults: { interpreter: { externalFunctionTable: { ...PlotEngine.externalFunctionTable, ...commonExternalFunctionTable } }, parfor: 'fallback' },
            evaluate: (interpreter, operation) => {
                const captured = withPlotOutputCapture(interpreter, () => withActiveInterpreter(interpreter, operation), PlotEngine);
                return {
                    value: captured.value,
                    outputs: captured.requests.map((request): RuntimeOutput => ({ type: 'visualization', renderer: 'plotly', request })),
                };
            },
        }),
);
