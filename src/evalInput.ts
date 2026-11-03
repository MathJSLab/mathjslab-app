import { appEngine } from './appEngine';
import type { EvalInputResult } from './CommandWorkspace';
import type { Interpreter } from 'mathjslab';

/**
 * Parse multiline input and recover the source slices for each top-level
 * statement so the prompt list can show what was evaluated.
 * @param {string} input Multiline input.
 * @returns {{ statements: string[]; lines: string[] }} An object containing statements and lines.
 */
function evalInputWithInterpreter(interpreter: Interpreter, input: string, reportError = true): EvalInputResult {
    const lines: string[] = input.split(/\r?\n/);
    const lineOffsets = [0, ...Array.from(input.matchAll(/\r?\n/g), (match) => match.index! + match[0].length)];
    try {
        const statements: string[] = [];
        const tree = interpreter.Parse(input);
        if (tree) {
            for (let i = 0; i < tree.list.length; i++) {
                const statement = tree.list[i]!;
                const previous = tree.list[i - 1];
                const next = tree.list[i + 1];
                // Keep indentation/trailing trivia where no other command shares
                // that line; shared lines use the parser's inclusive boundaries.
                const startColumn = !previous || previous.stop.line < statement.start.line ? 0 : statement.start.column;
                const stopColumn = !next || next.start.line > statement.stop.line ? lines[statement.stop.line - 1]!.length : statement.stop.column + 1;
                statements[i] = input.slice(lineOffsets[statement.start.line - 1] + startColumn, lineOffsets[statement.stop.line - 1] + stopColumn);
            }
            return { statements, lines };
        } else {
            return { statements: [], lines: [] };
        }
    } catch (error) {
        // Keep parse errors visible and report them to the workspace status.
        if (reportError) globalThis.alert(error);
        return { statements: [], lines, hasError: true, error };
    }
}
function evalInput(input: string, reportError = false): EvalInputResult {
    return evalInputWithInterpreter(appEngine.interpreter, input, reportError);
}
export { evalInput, evalInputWithInterpreter };
export default { evalInput };
