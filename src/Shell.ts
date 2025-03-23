import { appEngine } from './appEngine';
import { EvalInputHandler, CommandPromptEvalHandler, CommandShell } from './components/components';
import { Example } from './Example';
/**
 * Shell instantiation options.
 */
interface ShellOptions {
    shellId?: string;
    examplesId?: string;
    evalInput?: EvalInputHandler;
    evalPrompt?: CommandPromptEvalHandler;
}
/**
 * # Shell class.
 * This class has only one public static method:
 * `Shell.initialize(options: ShellOptions)`. Additionally the class
 * implements getters of some properties and methods of other objects and
 * properties of this class.
 */
class Shell {
    public readonly options: ShellOptions = {};
    public readonly isFileProtocol: boolean = window.location.href.startsWith('file:');
    public commandShell: CommandShell;
    public example: Example;
    /**
     * `Shell` initialization (instantiation).
     * @param {ShellOptions} options Shell instantiation options.
     * @returns {Promise<Shell>} A promise for a `Shell` instance.
     */
    public static async initialize(options: ShellOptions): Promise<Shell> {
        const newShell = new Shell();
        if (options.shellId) {
            newShell.options.shellId = options.shellId;
            newShell.commandShell = document.getElementById(options.shellId) as CommandShell;
        } else {
            newShell.options.shellId = 'mathjslab-shell';
            const docShell = document.querySelectorAll('command-shell');
            if (docShell.length === 1 && docShell[0].tagName === CommandShell.tagName.toUpperCase()) {
                newShell.commandShell = docShell[0] as CommandShell;
            } else {
                if (docShell.length === 0) {
                    throw new Error(`cannot find 'command-shell' element with id = '${options.shellId}'.`);
                } else {
                    throw new Error(`More than one 'command-shell' element found. Specify the id of the 'command-shell' element to be used (options.shellId);`);
                }
            }
        }
        newShell.commandShell.evaluatorPointer = appEngine.evaluator;
        newShell.commandShell.debugMessage(appEngine.buildMessage);
        if (options.evalPrompt) {
            newShell.commandShell.evalPrompt = options.evalPrompt;
        }
        newShell.options.evalPrompt = newShell.commandShell.evalPrompt;
        if (options.evalInput) {
            newShell.commandShell.evalInput = options.evalInput;
        }
        newShell.options.evalInput = newShell.commandShell.evalInput;
        if (options.examplesId) {
            newShell.options.examplesId = options.examplesId;
            newShell.example = await Example.initialize(options.examplesId, newShell.commandShell.load.bind(newShell.commandShell));
        } else {
            newShell.options.examplesId = '';
        }
        return newShell;
    }
}
export { type ShellOptions, Shell };
export default { Shell };
