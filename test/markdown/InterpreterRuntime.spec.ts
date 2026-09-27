import type { Interpreter } from 'mathjslab';
import { getActiveInterpreter, withActiveInterpreter } from '../../src/InterpreterRuntime';

describe('MathJSLab interpreter runtime ownership', () => {
    test('restores the owning interpreter across nested evaluations and errors', () => {
        const first = { id: 'first' } as unknown as Interpreter;
        const second = { id: 'second' } as unknown as Interpreter;

        withActiveInterpreter(first, () => {
            expect(getActiveInterpreter()).toBe(first);
            expect(() =>
                withActiveInterpreter(second, () => {
                    expect(getActiveInterpreter()).toBe(second);
                    throw new Error('stop');
                }),
            ).toThrow('stop');
            expect(getActiveInterpreter()).toBe(first);
        });
        expect(() => getActiveInterpreter()).toThrow('outside an active evaluation');
    });
});
