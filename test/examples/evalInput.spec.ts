import { jest } from '@jest/globals';
import { Interpreter } from 'mathjslab';

jest.unstable_mockModule('../../src/appEngine', () => ({ appEngine: {} }));
const { evalInputWithInterpreter } = await import('../../src/evalInput');

describe('editor statement recovery', () => {
    it('executes all logistic classifier statements without truncating identifiers', () => {
        const interpreter = Interpreter.Create();
        const source = [
            'features = [-2,-1,0,1,2]; scores = 2*features-0.5;',
            'probabilities = 1./(1+exp(-scores)); predictions = probabilities >= 0.5;',
            'example_check = all(predictions == [0,0,0,1,1]) && all(probabilities > 0 & probabilities < 1)',
        ].join('\n');
        const result = evalInputWithInterpreter(interpreter, source);
        expect(result.hasError).toBeUndefined();
        expect(result.statements).toEqual([
            'features = [-2,-1,0,1,2];',
            'scores = 2*features-0.5;',
            'probabilities = 1./(1+exp(-scores));',
            'predictions = probabilities >= 0.5;',
            source.split('\n')[2],
        ]);
        for (const statement of result.statements) interpreter.Evaluate(interpreter.Parse(statement));
        expect(interpreter.Unparse(interpreter.Evaluate(interpreter.Parse('example_check'))).trim()).toBe('true');
    });

    it.each(['\n', '\r\n'])('keeps multiline matrices separate from a following command with %j', (newline) => {
        const interpreter = Interpreter.Create();
        const source = ['a = [1;', '2]; b = 3;'].join(newline);
        const result = evalInputWithInterpreter(interpreter, source);
        expect(result.statements).toEqual([`a = [1;${newline}2];`, 'b = 3;']);
    });

    it.each(['\n', '\r\n'])('recovers a multiline command sharing its first and last lines with %j', (newline) => {
        const interpreter = Interpreter.Create();
        const matrix = `a = [1,2;${newline} 3,4;${newline} 5,6];`;
        const result = evalInputWithInterpreter(interpreter, `x = 1; ${matrix} predictions = 1./2 + 3.*4; final = predictions`);
        expect(result.statements).toEqual(['x = 1;', matrix, 'predictions = 1./2 + 3.*4;', 'final = predictions']);
    });

    it('preserves source formatting when coordinates are accurate', () => {
        const interpreter = Interpreter.Create();
        expect(evalInputWithInterpreter(interpreter, '  a = 1 + 2  ').statements).toEqual(['  a = 1 + 2  ']);
    });

    it.each(['\n', '\r\n'])('preserves multiline formatting, internal separators and output suppression with %j', (newline) => {
        const interpreter = Interpreter.Create();
        const first = `  a = [1, 2;${newline}       3, 4];`;
        const source = `${first} b = 3${newline}c = 4;`;
        const parse = jest.spyOn(interpreter, 'Parse');
        const unparse = jest.spyOn(interpreter, 'Unparse');
        const result = evalInputWithInterpreter(interpreter, source);
        expect(result.statements).toEqual([first, 'b = 3', 'c = 4;']);
        expect(parse).toHaveBeenCalledTimes(1);
        expect(unparse).not.toHaveBeenCalled();
        parse.mockRestore();
        unparse.mockRestore();
        expect(result.statements.map((command) => !!interpreter.Parse(command).list[0].omitOutput)).toEqual([true, false, true]);
    });
});

it.each(['.*', './', '.\\', '.^', ".'"])('recovers literal commands after %s', (operator) => {
    const interpreter = Interpreter.Create();
    const first = operator === ".'" ? "a = 12.';" : `a = 12${operator}2;`;
    expect(evalInputWithInterpreter(interpreter, `${first}  predictions = 7;`).statements).toEqual([first, 'predictions = 7;']);
});
