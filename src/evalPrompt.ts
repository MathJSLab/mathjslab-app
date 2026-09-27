/**
 * Prompt Interpreter
 */

import { Interpreter, appEngine, withCommandOutputTarget } from './appEngine';
import { CommandPrompt } from './components/command-prompt/command-prompt.component';
import { InterpreterError, type NodeInput } from 'mathjslab';
import { PlotEngine } from './PlotEngine';
import { withPlotOutputCapture } from './PlotOutputCapture';
import { formatErrorForHTML } from './formatErrorForHTML';
import { type CommandOutputTarget, PromptOutputTarget } from './CommandOutputTarget';

/**
 * Evaluate one command and render it into the supplied presentation target.
 * @param input Command source to evaluate.
 * @param target Destination for formatted output and rich result nodes.
 */
function evalCommandWithInterpreter(interpreter: Interpreter, input: string, target: CommandOutputTarget): boolean {
    let tree: NodeInput | undefined;
    return withCommandOutputTarget(target, () => {
        return withPlotOutputCapture(
            interpreter,
            (plotOutputs) => {
                try {
                    tree = interpreter.Parse(input);
                    if (tree) {
                        const unparse_input = interpreter.Unparse(tree);
                        const eval_input = interpreter.Evaluate(tree);
                        if (interpreter.exitStatus === Interpreter.response.OK) {
                            target.setState('good');
                            const unparse_eval_input = interpreter.Unparse(eval_input);
                            if (unparse_input !== unparse_eval_input) {
                                const evalsign =
                                    typeof tree.list[0].type === 'string' && tree.list[0].type.substring(tree.list[0].type.length - 1, tree.list[0].type.length) === '=' ? '&rArr;' : '=';
                                target.setHTML(
                                    '<table><tr><td>' +
                                        interpreter.UnparseMathML(tree) +
                                        `</td><td><math xmlns = 'http://www.w3.org/1998/Math/MathML' display='block'><mo>${evalsign}</mo></math></td><td>` +
                                        interpreter.UnparseMathML(eval_input) +
                                        '</td></tr></table>',
                                );
                            } else {
                                target.setHTML('<table><tr><td>' + interpreter.UnparseMathML(tree) + '</td></tr></table>');
                            }
                            for (const plot of plotOutputs) {
                                if (target.renderRichOutput) {
                                    target.renderRichOutput(
                                        plot.type,
                                        (output) => PlotEngine.render(output, plot),
                                        (output) => PlotEngine.dispose(output),
                                        (output) => PlotEngine.resize(output),
                                    );
                                } else {
                                    const output = document.createElement('div');
                                    output.className = 'plot-output';
                                    target.append(output);
                                    void PlotEngine.render(output, plot);
                                }
                            }
                            if (interpreter.debug) {
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
                        (tree ? "<table><tr><td align='left'>" + interpreter.UnparseMathML(tree) + '</td></tr></table><br />' : '') +
                            formatErrorForHTML(error as InterpreterError) +
                            (interpreter.debug
                                ? '<br /><br /><pre>Input   : ' + JSON.stringify(tree, (key: string, value: any) => (key !== 'parent' ? value : value === null ? 'root' : true), 2) + '</pre>'
                                : ''),
                    );
                    if (interpreter.debug) throw error;
                }
                return false;
            },
            PlotEngine,
        ).value;
    });
}

function evalCommand(input: string, target: CommandOutputTarget): boolean {
    return evalCommandWithInterpreter(appEngine.interpreter, input, target);
}

/**
 * Evaluate an interactive prompt through the shared command evaluator.
 * @param prompt Command prompt to evaluate.
 * @param _index Unused.
 */
function evalPrompt(prompt: CommandPrompt, _index?: number): void {
    evalCommand(prompt.value, new PromptOutputTarget(prompt));
}
export { evalCommand, evalCommandWithInterpreter, evalPrompt };
export default { evalCommand, evalPrompt };
