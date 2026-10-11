import '../../../src/markdown/extensions/mathjslab/mathjslab.worker';
import { getActiveInterpreter } from '../../../src/InterpreterRuntime';
import { currentPlotInterpreter } from '../../../src/PlotOutputCapture';

// Test-only observer: probe the actual production Worker while its host is waiting.
globalThis.addEventListener('message', (event: MessageEvent) => {
    if (event.data?.type !== 'test-context-probe') return;
    const active = (operation: () => unknown): boolean => {
        try {
            operation();
            return true;
        } catch {
            return false;
        }
    };
    (globalThis as unknown as { postMessage(value: unknown): void }).postMessage({
        type: 'test-context-result',
        interpreter: active(getActiveInterpreter),
        plots: active(currentPlotInterpreter),
    });
});
