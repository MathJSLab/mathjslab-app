import type { Interpreter } from 'mathjslab';
import { getActiveInterpreter, withActiveInterpreter } from './InterpreterRuntime';
import type { PlotOutputRequest } from 'mathjslab';

export type { PlotOutputRequest } from 'mathjslab';

type PlotCapture = { readonly requests: PlotOutputRequest[] };
let activePlotCapture: PlotCapture | undefined;

export const withPlotOutputCapture = <T>(interpreter: Interpreter, evaluate: (requests: readonly PlotOutputRequest[]) => T): { value: T; requests: readonly PlotOutputRequest[] } => {
    const previous = activePlotCapture;
    const capture: PlotCapture = { requests: [] };
    activePlotCapture = capture;
    try {
        return {
            value: interpreter.withPlotOutput(
                (request) => capture.requests.push(request),
                () => withActiveInterpreter(interpreter, () => evaluate(capture.requests)),
            ),
            requests: capture.requests,
        };
    } finally {
        activePlotCapture = previous;
    }
};

export const currentPlotInterpreter = (): Interpreter => {
    if (!activePlotCapture) throw new Error('plot evaluation requested outside an interpreter evaluation');
    return getActiveInterpreter();
};
