/**
 * Prompt Interpreter
 */

import { Interpreter, appEngine, withCommandOutputTarget } from './appEngine';
import { CommandPrompt } from './components/command-prompt/command-prompt.component';
import { InterpreterError, type NodeInput } from 'mathjslab';
import { outputFunction, insertOutput } from './outputFunction';
import { formatErrorForHTML } from './formatErrorForHTML';
import { type CommandOutputTarget, PromptOutputTarget } from './CommandOutputTarget';

/**
 * Evaluate one command and render it into the supplied presentation target.
 * @param input Command source to evaluate.
 * @param target Destination for formatted output and rich result nodes.
 */
function evalCommand(input: string, target: CommandOutputTarget): boolean {
    let tree: NodeInput | undefined;
    return withCommandOutputTarget(target, () => {
        try {
            tree = appEngine.interpreter.Parse(input);
            if (tree) {
                const unparse_input = appEngine.interpreter.Unparse(tree);
                const eval_input = appEngine.interpreter.Evaluate(tree);
                if (appEngine.interpreter.exitStatus === Interpreter.response.OK) {
                    target.setState('good');
                    const unparse_eval_input = appEngine.interpreter.Unparse(eval_input);
                    if (unparse_input !== unparse_eval_input) {
                        const evalsign =
                            typeof tree.list[0].type === 'string' && tree.list[0].type.substring(tree.list[0].type.length - 1, tree.list[0].type.length) === '=' ? '&rArr;' : '=';
                        target.setHTML(
                            '<table><tr><td>' +
                                appEngine.interpreter.UnparseMathML(tree) +
                                `</td><td><math xmlns = 'http://www.w3.org/1998/Math/MathML' display='block'><mo>${evalsign}</mo></math></td><td>` +
                                appEngine.interpreter.UnparseMathML(eval_input) +
                                '</td></tr></table>',
                        );
                    } else {
                        target.setHTML('<table><tr><td>' + appEngine.interpreter.UnparseMathML(tree) + '</td></tr></table>');
                    }
                    if (insertOutput.type !== '') {
                        const output = document.createElement('div');
                        output.className = 'plot-output';
                        target.append(output);
                        const renderOutput = outputFunction[insertOutput.type];
                        if (!renderOutput) {
                            throw new Error(`unknown output type: ${insertOutput.type}`);
                        }
                        renderOutput(output);
                    }
                    if (appEngine.interpreter.debug) {
                        const debugOutput = document.createElement('template');
                        debugOutput.innerHTML =
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
                        target.append(debugOutput.content);
                    }
                    return true;
                }
            }
        } catch (error) {
            target.setState('bad');
            target.setHTML(
                (tree ? "<table><tr><td align='left'>" + appEngine.interpreter.UnparseMathML(tree) + '</td></tr></table><br />' : '') +
                    formatErrorForHTML(error as InterpreterError) +
                    (appEngine.interpreter.debug
                        ? '<br /><br /><pre>Input   : ' + JSON.stringify(tree, (key: string, value: any) => (key !== 'parent' ? value : value === null ? 'root' : true), 2) + '</pre>'
                        : ''),
            );
            if (appEngine.interpreter.debug) throw error;
        }
        return false;
    });
}

/**
 * Evaluate an interactive prompt through the shared command evaluator.
 * @param prompt Command prompt to evaluate.
 * @param _index Unused.
 */
function evalPrompt(prompt: CommandPrompt, _index?: number): void {
    evalCommand(prompt.value, new PromptOutputTarget(prompt));
}
export { evalCommand, evalPrompt };
export default { evalCommand, evalPrompt };
