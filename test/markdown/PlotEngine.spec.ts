import type { Interpreter } from 'mathjslab';
import { capturePlotOutput, type PlotOutputRequest, withPlotOutputCapture } from '../../src/PlotOutputCapture';

const request = (value: number): PlotOutputRequest => ({
    type: 'plot',
    data: [{ y: [value], type: 'scatter' }],
    layout: { autosize: true },
    config: { responsive: true },
});

describe('MathJSLab Plotly output capture', () => {
    test('captures immutable requests per interpreter evaluation and restores nested captures', () => {
        const firstInterpreter = {} as Interpreter;
        const secondInterpreter = {} as Interpreter;

        const outer = withPlotOutputCapture(firstInterpreter, () => {
            capturePlotOutput(request(1));
            const inner = withPlotOutputCapture(secondInterpreter, () => capturePlotOutput(request(2)));
            capturePlotOutput(request(3));
            return inner.requests;
        });

        expect(outer.requests).toHaveLength(2);
        expect(outer.value).toHaveLength(1);
        expect(outer.requests.map((request) => request.type)).toEqual(['plot', 'plot']);
        expect((outer.requests[0]!.data[0] as { y: number[] }).y).toEqual([1]);
        expect((outer.value[0]!.data[0] as { y: number[] }).y).toEqual([2]);
        expect((outer.requests[1]!.data[0] as { y: number[] }).y).toEqual([3]);
    });

    test('rejects plotting outside an active evaluation capture', () => {
        expect(() => capturePlotOutput(request(1))).toThrow('outside an interpreter evaluation');
    });
});
