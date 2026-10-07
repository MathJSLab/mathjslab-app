import { InProcessMathJSLabRuntime, RuntimeWorkerServer, type RuntimeOutput, type RuntimeWorkerServerScope } from 'mathjslab/runtime';
import type { RuntimeOutboundMessage } from 'mathjslab/runtime';
import { commonExternalFunctionTable } from '../../../commonExternalFunctionTable';
import { withActiveInterpreter } from '../../../InterpreterRuntime';
import { PlotEngine } from '../../../PlotEngine';
import { withPlotOutputCapture } from '../../../PlotOutputCapture';

const dedicatedWorker = globalThis as unknown as {
    postMessage(message: RuntimeOutboundMessage, transfer?: ArrayBuffer[]): void;
};
const workerScope: RuntimeWorkerServerScope = {
    addEventListener: globalThis.addEventListener.bind(globalThis),
    removeEventListener: globalThis.removeEventListener.bind(globalThis),
    postMessage: (message, transfer = []) => {
        if ('type' in message && message.type === 'effect-request' && message.context.signal) {
            // AbortSignal is not structured-cloneable. The main-thread RemoteRuntime
            // supplies its own signal when it handles this effect request.
            const { signal: _signal, ...context } = message.context;
            const cloneableMessage: RuntimeOutboundMessage = { ...message, context };
            dedicatedWorker.postMessage(cloneableMessage, transfer);
            return;
        }
        dedicatedWorker.postMessage(message, transfer);
    },
};

new RuntimeWorkerServer(
    workerScope,
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
