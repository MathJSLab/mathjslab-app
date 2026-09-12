import { appEngine } from './appEngine';
import { CommandPromptEvalHandler } from './components/components';
import { CommandWorkspace, EvalCommandHandler, EvalInputHandler } from './CommandWorkspace';
import { Example } from './Example';
/**
 * Shell instantiation options.
 */
interface ShellOptions {
    shellId?: string;
    examplesId?: string;
    evalInput?: EvalInputHandler;
    evalCommand?: EvalCommandHandler;
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
    public readonly isFileProtocol: boolean = globalThis.location.href.startsWith('file:');
    public commandShell!: CommandWorkspace;
    public example?: Example;
    /**
     * `Shell` initialization (instantiation).
     * @param {ShellOptions} options Shell instantiation options.
     * @returns {Promise<Shell>} A promise for a `Shell` instance.
     */
    public static async initialize(options: ShellOptions): Promise<Shell> {
        const newShell = new Shell();
        if (options.shellId) {
            newShell.options.shellId = options.shellId;
            newShell.commandShell = new CommandWorkspace(options.shellId);
        } else {
            newShell.options.shellId = 'mathjslab-shell';
            const docShell = document.querySelectorAll('application-wrapper#mathjslab-shell');
            if (docShell.length === 1) {
                newShell.commandShell = new CommandWorkspace('mathjslab-shell');
            } else {
                if (docShell.length === 0) {
                    throw new Error(`cannot find 'application-wrapper' element with id = 'mathjslab-shell'.`);
                }
                throw new Error(`More than one 'application-wrapper#mathjslab-shell' element found.`);
            }
        }
        newShell.commandShell.interpreterPointer = appEngine.interpreter;
        if (options.evalCommand) {
            newShell.commandShell.evalCommand = options.evalCommand;
        }
        newShell.options.evalCommand = newShell.commandShell.evalCommand;
        if (options.evalPrompt) {
            newShell.commandShell.evalPrompt = options.evalPrompt;
        }
        newShell.options.evalPrompt = newShell.commandShell.evalPrompt;
        if (options.evalInput) {
            newShell.commandShell.evalInput = options.evalInput;
        }
        newShell.options.evalInput = newShell.commandShell.evalInput;
        newShell.commandShell.connect();
        newShell.commandShell.debugMessage(appEngine.buildMessage);
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
