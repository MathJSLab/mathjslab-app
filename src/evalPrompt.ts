/**
 * Prompt Evaluator
 */

import { Evaluator, appEngine } from './appEngine';
import { CommandPrompt } from './components/components';
import { type NodeInput } from 'mathjslab';
import { Markdown } from './Markdown';
import { outputFunction, insertOutput } from './outputFunction';
/**
 * Evaluate prompt.
 * @param {CommandPrompt} prompt Command prompt to evaluate.
 * @param {number} _index Unused.
 */
function evalPrompt(prompt: CommandPrompt, _index?: number): void {
    let tree: NodeInput;
    try {
        tree = appEngine.evaluator.Parse(prompt.element.input.value);
        if (tree) {
            const unparse_input = appEngine.evaluator.Unparse(tree);
            const eval_input = appEngine.evaluator.Evaluate(tree);
            if (appEngine.evaluator.exitStatus === Evaluator.response.OK) {
                prompt.element.frameBox.className = 'good';
                const unparse_eval_input = appEngine.evaluator.Unparse(eval_input);
                if (unparse_input !== unparse_eval_input) {
                    const evalsign = typeof tree.list[0].type === 'string' && tree.list[0].type.substring(tree.list[0].type.length - 1, tree.list[0].type.length) === '=' ? '&rArr;' : '=';
                    prompt.element.output.innerHTML =
                        '<table><tr><td>' +
                        appEngine.evaluator.UnparseMathML(tree) +
                        `</td><td><math xmlns = 'http://www.w3.org/1998/Math/MathML' display='block'><mo>${evalsign}</mo></math></td><td>` +
                        appEngine.evaluator.UnparseMathML(eval_input) +
                        '</td></tr></table>';
                } else {
                    prompt.element.output.innerHTML = '<table><tr><td>' + appEngine.evaluator.UnparseMathML(tree) + '</td></tr></table>';
                }
                if (insertOutput.type !== '') {
                    const output = document.createElement('div');
                    prompt.element.output.append(output);
                    outputFunction[insertOutput.type](output);
                }
                if (appEngine.evaluator.debug) {
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
            appEngine.evaluator.UnparseMathML(tree) +
            '</td></tr></table><br />' +
            error +
            (appEngine.evaluator.debug
                ? '<br /><br /><pre>Input   : ' + JSON.stringify(tree, (key: string, value: any) => (key !== 'parent' ? value : value === null ? 'root' : true), 2) + '</pre>'
                : '');
        if (appEngine.evaluator.debug) throw error;
    }
    // Markdown.mathTypeset();
}
export { evalPrompt };
export default { evalPrompt };
