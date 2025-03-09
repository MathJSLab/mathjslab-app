import { appEngine } from './appEngine';
import { EvalInputHandler, CommandPromptEvalHandler, CommandShell } from './components/components';
import { Example, ExampleEntry } from './Example';
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
    private readonly options: ShellOptions = {};
    private _shell: CommandShell;
    private example: Example;
    /**
     * ## `Shell` initialization (instantiation).
     * @param {ShellOptions} options Shell instantiation options.
     * @returns {Promise<Shell>} A promise for a `Shell` instance.
     */
    public static async initialize(options: ShellOptions): Promise<Shell> {
        const shell = new Shell();
        if (options.shellId) {
            shell.options.shellId = options.shellId;
            shell._shell = document.getElementById(options.shellId) as CommandShell;
        } else {
            shell.options.shellId = 'mathjslab-shell';
            const docShell = document.querySelectorAll('command-shell');
            if (docShell.length === 1 && docShell[0].tagName === CommandShell.tagName.toUpperCase()) {
                shell._shell = docShell[0] as CommandShell;
            } else {
                if (docShell.length === 0) {
                    throw new Error(`cannot find 'command-shell' element with id = '${options.shellId}'.`);
                } else {
                    throw new Error(
                        `More than one 'command-shell' element found. Specify the id of the 'command-shell' element to be used (options.shellId);`,
                    );
                }
            }
        }
        shell._shell.evaluatorPointer = appEngine.evaluator;
        shell._shell.debugMessage(appEngine.buildMessage);
        if (options.evalPrompt) {
            shell._shell.evalPrompt = options.evalPrompt;
        }
        shell.options.evalPrompt = shell._shell.evalPrompt;
        if (options.evalInput) {
            shell._shell.evalInput = options.evalInput;
        }
        shell.options.evalInput = shell._shell.evalInput;
        if (options.examplesId) {
            shell.options.examplesId = options.examplesId;
            shell.example = await Example.initialize(options.examplesId, shell._shell.load.bind(shell._shell));
        } else {
            shell.options.examplesId = '';
        }
        shell._shell.element.batch.element.evaluateButton.click();
        return shell;
    }
    /**
     * ### baseUrl getter.
     * @returns {string} baseUrl.
     */
    public get baseUrl(): string {
        return this.example.baseUrl;
    }
    /**
     * ### isFileProtocol getter.
     * @returns {boolean} isFileProtocol.
     */
    public get isFileProtocol(): boolean {
        return this.example.isFileProtocol;
    }
    /**
     * ### shellId getter.
     * @returns {string} shellId.
     */
    public get shellId(): string {
        return this.options.shellId!;
    }
    /**
     * ### shell getter.
     * @returns {CommandShell} shell.
     */
    public get shell(): CommandShell {
        return this._shell;
    }
    /**
     * ### examplesId getter.
     * @returns {string} examplesId.
     */
    public get examplesId(): string {
        return this.options.examplesId!;
    }
    /**
     * ### examples getter.
     * @returns {Record<string, ExampleEntry>} examples.
     */
    public get examples(): Record<string, ExampleEntry> {
        return this.example.examples;
    }
}
export { ShellOptions, Shell };
export default Shell;
