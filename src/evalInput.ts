import { appEngine } from './appEngine';
import type { EvalInputResult } from './CommandWorkspace';

/**
 * Parse multiline input and recover the source slices for each top-level
 * statement so the prompt list can show what was evaluated.
 * @param {string} input Multiline input.
 * @returns {{ statements: string[]; lines: string[] }} An object containing statements and lines.
 */
function evalInput(input: string): EvalInputResult {
    const lines: string[] = input.split(/\r?\n/);
    try {
        const statements: string[] = [];
        const tree = appEngine.interpreter.Parse(input);
        if (tree) {
            for (let i = 0; i < tree.list.length; i++) {
                const statement = tree.list[i]!;
                const previous = tree.list[i - 1];
                const next = tree.list[i + 1];
                const startLine = lines[statement.start.line - 1] ?? '';
                const stopLine = lines[statement.stop.line - 1] ?? '';
                if (statement.stop.line === statement.start.line) {
                    // Preserve a whole single-line statement when it is alone on that line.
                    if ((!previous || previous.stop.line < statement.start.line) && (!next || next.start.line > statement.start.line)) {
                        statements[i] = startLine;
                    } else {
                        statements[i] = startLine.substring(statement.start.column, statement.stop.column + 1);
                    }
                } else {
                    let result: string;
                    if (!previous || previous.stop.line < statement.start.line) {
                        result = startLine + '\n';
                    } else {
                        result = startLine.substring(statement.start.column) + '\n';
                    }
                    if (statement.stop.line > statement.start.line + 1) {
                        result += lines.slice(statement.start.line, statement.stop.line - 1).join('\n') + '\n';
                    }
                    if (!next || next.start.line > statement.start.line) {
                        result += stopLine;
                    } else {
                        result += stopLine.substring(0, statement.stop.column);
                    }
                    statements[i] = result.trim();
                }
            }
            return { statements, lines };
        } else {
            return { statements: [], lines: [] };
        }
    } catch (error) {
        // Keep parse errors visible and report them to the workspace status.
        globalThis.alert(error);
        return { statements: [], lines, hasError: true };
    }
}
export { evalInput };
export default { evalInput };
