import { InProcessMathJSLabRuntime, RuntimeWorkerServer, type RuntimeOutput, type RuntimeWorkerServerScope } from 'mathjslab/runtime';
import { commonExternalFunctionTable } from '../../../commonExternalFunctionTable';
import { withActiveInterpreter } from '../../../InterpreterRuntime';
import { withPlotOutputCapture } from '../../../PlotOutputCapture';

new RuntimeWorkerServer(
    globalThis as unknown as RuntimeWorkerServerScope,
    (host) =>
        new InProcessMathJSLabRuntime({
            host,
            sessionDefaults: { interpreter: { externalFunctionTable: { ...commonExternalFunctionTable } }, parfor: 'fallback' },
            evaluate: (interpreter, operation) => {
                const captured = withPlotOutputCapture(interpreter, () => withActiveInterpreter(interpreter, operation));
                return {
                    value: captured.value,
                    outputs: captured.requests.map((request): RuntimeOutput => ({ type: 'visualization', renderer: 'plotly', request })),
                };
            },
        }),
);
