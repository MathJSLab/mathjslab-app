import { Interpreter } from 'mathjslab';
import { currentPlotInterpreter, type PlotOutputRequest, withPlotOutputCapture } from '../../src/PlotOutputCapture';

const plot = (interpreter: Interpreter, values: number[]): void => {
    interpreter.Evaluate(interpreter.Parse(`plot([${values.join(',')}])`)!);
};
const values = (requests: readonly PlotOutputRequest[]) => requests.map((request) => request.data[0]!.y);

describe('MathJSLab Plotly output capture', () => {
    test('keeps native plot requests with their owning interpreter across nested evaluations', () => {
        const firstInterpreter = Interpreter.Create();
        const secondInterpreter = Interpreter.Create();
        const outer = withPlotOutputCapture(firstInterpreter, () => {
            expect(currentPlotInterpreter()).toBe(firstInterpreter);
            plot(firstInterpreter, [1, 2]);
            const inner = withPlotOutputCapture(secondInterpreter, () => {
                expect(currentPlotInterpreter()).toBe(secondInterpreter);
                plot(secondInterpreter, [3, 4]);
            });
            expect(currentPlotInterpreter()).toBe(firstInterpreter);
            plot(firstInterpreter, [5, 6]);
            return inner.requests;
        });
        expect(values(outer.requests)).toEqual([
            [1, 2],
            [5, 6],
        ]);
        expect(values(outer.value)).toEqual([[3, 4]]);
        expect(() => currentPlotInterpreter()).toThrow('outside an interpreter evaluation');
    });

    test('captures each native session plot once without retaining the preceding evaluation output', () => {
        const interpreter = Interpreter.Create();
        const captured = withPlotOutputCapture(interpreter, () => {
            plot(interpreter, [1, 2]);
            return true;
        });
        const value: boolean = captured.value;
        expect(value).toBe(true);
        expect(values(captured.requests)).toEqual([[1, 2]]);
        const subsequent = withPlotOutputCapture(interpreter, () => plot(interpreter, [3, 4]));
        expect(values(subsequent.requests)).toEqual([[3, 4]]);
        expect(values(captured.requests)).toEqual([[1, 2]]);
    });

    test('restores capture ownership after an exception and permits the next evaluation', () => {
        const interpreter = Interpreter.Create();
        expect(() =>
            withPlotOutputCapture(interpreter, () => {
                plot(interpreter, [1, 2]);
                throw new Error('failed operation');
            }),
        ).toThrow('failed operation');
        expect(() => currentPlotInterpreter()).toThrow('outside an interpreter evaluation');
        const subsequent = withPlotOutputCapture(interpreter, () => plot(interpreter, [3, 4]));
        expect(values(subsequent.requests)).toEqual([[3, 4]]);
    });
});
