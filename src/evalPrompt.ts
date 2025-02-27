/**
 * Prompt Evaluator
 */

import { CommandPrompt } from './components/components';
import { insertOutput, outputFunction, MathMarkdown, AST } from './EvaluatorConfiguration';
/**
 * Evaluate prompt.
 * @param {CommandPrompt} prompt Command prompt to evaluate.
 * @param {number} _index Unused.
 */
function evalPrompt(prompt: CommandPrompt, _index?: number): void {
    let tree: AST.NodeInput;
    try {
        tree = globalThis.EvaluatorPointer.Parse(prompt.element.input.value);
        if (tree) {
            const unparse_input = globalThis.EvaluatorPointer.Unparse(tree);
            const eval_input = globalThis.EvaluatorPointer.Evaluate(tree);
            if (globalThis.EvaluatorPointer.exitStatus === globalThis.EvaluatorPointer.response.OK) {
                prompt.element.frameBox.className = 'good';
                const unparse_eval_input = globalThis.EvaluatorPointer.Unparse(eval_input);
                if (unparse_input !== unparse_eval_input) {
                    const evalsign =
                        typeof tree.list[0].type === 'string' &&
                        tree.list[0].type.substring(tree.list[0].type.length - 1, tree.list[0].type.length) === '='
                            ? '&rArr;'
                            : '=';
                    prompt.element.output.innerHTML =
                        '<table><tr><td>' +
                        globalThis.EvaluatorPointer.UnparseMathML(tree) +
                        `</td><td><math xmlns = 'http://www.w3.org/1998/Math/MathML' display='block'><mo>${evalsign}</mo></math></td><td>` +
                        globalThis.EvaluatorPointer.UnparseMathML(eval_input) +
                        '</td></tr></table>';
                } else {
                    prompt.element.output.innerHTML = '<table><tr><td>' + globalThis.EvaluatorPointer.UnparseMathML(tree) + '</td></tr></table>';
                }
                if (insertOutput.type !== '') {
                    const output = document.createElement('div');
                    prompt.element.output.append(output);
                    outputFunction[insertOutput.type](output);
                }
                if (globalThis.EvaluatorPointer.debug) {
                    prompt.element.output.innerHTML +=
                        '<pre>' +
                        '<br /><br />Input   : ' +
                        JSON.stringify(tree, (key: string, value: any) => (key !== 'parent' ? value : value === null ? 'root' : true), 2) +
                        '<br /><br />Evaluate: ' +
                        JSON.stringify(eval_input, (key: string, value: any) => (key !== 'parent' ? value : value === null ? 'root' : true), 2) +
                        '<br /><br />Unparse Input   :' +
                        unparse_input +
                        '<br /><br />Unparse Evaluate:' +
                        unparse_eval_input +
                        '</pre>';
                }
            }
        }
    } catch (error) {
        prompt.element.frameBox.className = 'bad';
        prompt.element.output.innerHTML =
            "<table><tr><td align='left'>" +
            globalThis.EvaluatorPointer.UnparseMathML(tree) +
            '</td></tr></table><br />' +
            error +
            (globalThis.EvaluatorPointer.debug
                ? '<br /><br /><pre>Input   : ' +
                  JSON.stringify(tree, (key: string, value: any) => (key !== 'parent' ? value : value === null ? 'root' : true), 2) +
                  '</pre>'
                : '');
        if (globalThis.EvaluatorPointer.debug) throw error;
    }
    MathMarkdown.mathTypeset();
}
export { evalPrompt };
export default evalPrompt;
