import type { Interpreter } from 'mathjslab';
import { getActiveInterpreter, withActiveInterpreter } from './InterpreterRuntime';
import type { PlotOutputRequest } from './PlotEngine';

export type { PlotOutputRequest } from './PlotEngine';

type PlotCapture = { readonly requests: PlotOutputRequest[] };
type PlotOutputCaptureHost = {
    setOutputCapture(capture: ((request: PlotOutputRequest) => void) | undefined): ((request: PlotOutputRequest) => void) | undefined;
};
let activePlotCapture: PlotCapture | undefined;

export const withPlotOutputCapture = <T>(
    interpreter: Interpreter,
    evaluate: (requests: readonly PlotOutputRequest[]) => T,
    host?: PlotOutputCaptureHost,
): { value: T; requests: readonly PlotOutputRequest[] } => {
    const previous = activePlotCapture;
    const capture: PlotCapture = { requests: [] };
    activePlotCapture = capture;
    const previousOutputCapture = host?.setOutputCapture((request) => capture.requests.push(request));
    try {
        return { value: withActiveInterpreter(interpreter, () => evaluate(capture.requests)), requests: capture.requests };
    } finally {
        host?.setOutputCapture(previousOutputCapture);
        activePlotCapture = previous;
    }
};

export const capturePlotOutput = (request: PlotOutputRequest): void => {
    if (!activePlotCapture) throw new Error('plot output requested outside an interpreter evaluation');
    activePlotCapture.requests.push(request);
};

export const tryCapturePlotOutput = (request: PlotOutputRequest): boolean => {
    if (!activePlotCapture) return false;
    activePlotCapture.requests.push(request);
    return true;
};

export const currentPlotInterpreter = (): Interpreter => {
    if (!activePlotCapture) throw new Error('plot evaluation requested outside an interpreter evaluation');
    return getActiveInterpreter();
};
