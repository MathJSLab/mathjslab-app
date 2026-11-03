import { Interpreter } from 'mathjslab';
import { prepareCommandPresentation, commandResultTable } from '../../src/CommandPresentation';

describe('legacy command presentation', () => {
    const interpreter = Interpreter.Create();
    const render = (source: string) => {
        const input = prepareCommandPresentation(interpreter, source);
        const value = interpreter.Evaluate(interpreter.Parse(source));
        return commandResultTable(input, interpreter.Unparse(value), interpreter.UnparseMathML(value));
    };
    it('prints unchanged assignments once and computed assignments with their input and arrow', () => {
        for (const source of ['a=1', 'b=-10', 'c=21']) expect(render(source).rows[0]!.cells).toHaveLength(1);
        const delta = render('Delta=b^2-4*a*c');
        expect(delta.rows[0]!.cells).toHaveLength(3);
        expect(delta.rows[0]!.cells[1]!.textContent).toBe('⇒');
        expect(delta.rows[0]!.cells[2]!.textContent).toContain('16');
    });
    it('keeps the original equality sign for ordinary reduced expressions', () => {
        const value = render('1+1');
        expect(value.rows[0]!.cells[1]!.textContent).toBe('=');
        expect(value.rows[0]!.cells[2]!.textContent).toBe('2');
    });
    it('retains the input for commands whose runtime result is empty', () => {
        const table = commandResultTable(prepareCommandPresentation(interpreter, 'clear'), '\n', '');
        expect(table.rows[0]!.cells).toHaveLength(1);
        expect(table.textContent).toContain('clear');
    });
});
