import { Interpreter, Decimal } from 'mathjslab';
import { commonExternalFunctionTable } from '../../src/commonExternalFunctionTable';
import { getActiveInterpreter } from '../../src/InterpreterRuntime';
import { currentPlotInterpreter, withPlotOutputCapture } from '../../src/PlotOutputCapture';

describe('session-owned synchronous external functions', () => {
    test('uses each owning workspace and restores scopes, precision and capture after errors', () => {
        const first = Interpreter.Create({ externalFunctionTable: { ...commonExternalFunctionTable } });
        const second = Interpreter.Create({ externalFunctionTable: { ...commonExternalFunctionTable } });
        const evaluate = (interpreter: Interpreter, source: string) => withPlotOutputCapture(interpreter, () => interpreter.Evaluate(interpreter.Parse(source)));
        evaluate(first, 'n=3');
        evaluate(second, 'n=4');
        expect(first.Unparse(evaluate(first, 'summation(k,1,n,k)+productory(k,1,n,k)').value).trim()).toBe('12');
        expect(second.Unparse(evaluate(second, 'summation(k,1,n,k)+productory(k,1,n,k)').value).trim()).toBe('34');
        const stackDepth = first.context.callStack!.length;
        const precision = Decimal.precision;
        expect(() => evaluate(first, 'summation(k,1,n,missing)')).toThrow();
        expect(() => evaluate(first, 'productory(k,1,n,missing)')).toThrow();
        expect(() => evaluate(first, 'plot2d(missing,t,0,1)')).toThrow();
        expect(first.context.callStack!.length).toBe(stackDepth);
        expect(Decimal.precision).toBe(precision);
        expect(() => getActiveInterpreter()).toThrow('outside an active evaluation');
        expect(() => currentPlotInterpreter()).toThrow('outside an interpreter evaluation');
        expect(evaluate(first, 'plot([1,2])').requests).toHaveLength(1);
        expect(evaluate(first, '1+1').requests).toEqual([]);
    });
});
