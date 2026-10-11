import type { Interpreter } from 'mathjslab';
import { getActiveInterpreter, withActiveInterpreter } from './InterpreterRuntime';
import type { PlotOutputRequest } from 'mathjslab';

export type { PlotOutputRequest } from 'mathjslab';

type PlotCapture = { readonly requests: PlotOutputRequest[] };
type PlotOutputCaptureHost = {
    publish?(request: PlotOutputRequest): void;
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
        return {
            value: interpreter.withPlotOutput(
                (request) => (host?.publish ? host.publish(request) : capture.requests.push(request)),
                () => withActiveInterpreter(interpreter, () => evaluate(capture.requests)),
            ),
            requests: capture.requests,
        };
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
