import type { Interpreter } from 'mathjslab';

/** Trusted syntax markup and normalized source captured in the owning numeric environment. */
export type CommandPresentation = { normalized: string; markup: string; sign: string };

/** Capture syntax before evaluation, while the owning numeric environment is active. */
export function prepareCommandPresentation(interpreter: Interpreter, source: string): CommandPresentation {
    const tree = interpreter.Parse(source);
    const operation = tree.list?.[0]?.type;
    return {
        normalized: interpreter.Unparse(tree).trim(),
        markup: interpreter.UnparseMathML(tree),
        sign: typeof operation === 'string' && operation.endsWith('=') ? '&rArr;' : '=',
    };
}

/** Preserve the prompt's original input/result comparison and compact left-aligned table. */
export function commandResultTable(input: CommandPresentation | undefined, resultText = '', resultMarkup = ''): HTMLTableElement {
    const table = document.createElement('table');
    table.className = 'command-result';
    table.style.marginInlineStart = '0';
    table.style.marginInlineEnd = 'auto';
    table.style.width = 'max-content';
    const row = table.insertRow();
    const cell = (markup: string) => {
        row.insertCell().innerHTML = markup;
    };
    if (input) {
        cell(input.markup);
        if (resultText.trim() && input.normalized !== resultText.trim()) {
            cell(`<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mo>${input.sign}</mo></math>`);
            cell(resultMarkup);
        }
    } else cell(resultMarkup);
    return table;
}
