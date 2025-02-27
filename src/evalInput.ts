/**
 * Input Evaluator
 */

/**
 * Evaluate multiline input.
 * @param {string} input Multiline input.
 * @returns {{ statements: string[]; lines: string[] }} An object containing statements and lines.
 */
function evalInput(input: string): { statements: string[]; lines: string[] } {
    try {
        const statements: string[] = [];
        const lines: string[] = input.split(/\r?\n/);
        const tree = globalThis.EvaluatorPointer.Parse(input);
        if (tree) {
            for (let i = 0; i < tree.list.length; i++) {
                if (tree.list[i].stop.line === tree.list[i].start.line) {
                    // if statement is single line and there's no other statement in the same line then pass entire line.
                    if (
                        (i === 0 || tree.list[i - 1].stop.line < tree.list[i].start.line) &&
                        (i === tree.list.length - 1 || tree.list[i + 1].start.line > tree.list[i].start.line)
                    ) {
                        statements[i] = lines[tree.list[i].start.line - 1];
                    } else {
                        statements[i] = lines[tree.list[i].start.line - 1].substring(tree.list[i].start.column, tree.list[i].stop.column + 1);
                    }
                } else {
                    let result: string;
                    if (i === 0 || tree.list[i - 1].stop.line < tree.list[i].start.line) {
                        result = lines[tree.list[i].start.line - 1] + '\n';
                    } else {
                        result = lines[tree.list[i].start.line - 1].substring(tree.list[i].start.column) + '\n';
                    }
                    if (tree.list[i].stop.line > tree.list[i].start.line + 1) {
                        result += lines.slice(tree.list[i].start.line, tree.list[i].stop.line - 1).join('\n') + '\n';
                    }
                    if (i === tree.list.length - 1 || tree.list[i + 1].start.line > tree.list[i].start.line) {
                        result += lines[tree.list[i].stop.line - 1];
                    } else {
                        result += lines[tree.list[i].stop.line - 1].substring(0, tree.list[i].stop.column);
                    }
                    statements[i] = result.trim();
                }
            }
            return { statements, lines };
        } else {
            return { statements: [], lines: [] };
        }
    } catch (error) {
        // TODO: Better error handling.
        globalThis.alert(error);
        return { statements: [], lines: [] };
    }
}
export { evalInput };
export default evalInput;
