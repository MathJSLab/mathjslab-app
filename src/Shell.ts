import createHTMLElement from './createHTMLElement';
import firstExample from './first-example.json';
import { CharString, FunctionHandle, MultiArray } from 'mathjslab';

import { FixedScrollPanel } from './components/components';

/**
 * Event handler.
 */
export type EventHandler = (event: Event) => void;

/**
 * Evaluator handlers
 */
export type EvalInputHandler = (input: HTMLTextAreaElement) => [string[], string[]];
export type EvalPromptHandler = (frame: HTMLDivElement, box: HTMLDivElement, input: HTMLTextAreaElement, output: HTMLDivElement) => void;

/**
 * Shell instantiation options.
 */
export interface ShellOptions {
    containerId: string;
    examplesId: string;
    evalInput?: EvalInputHandler;
    evalPrompt?: EvalPromptHandler;
    input: string;
}

export interface PromptEntry {
    container: HTMLDivElement;
    box: HTMLDivElement;
    input: HTMLTextAreaElement;
    output: HTMLDivElement;
}

export interface ExampleEntry {
    file: string;
    caption: string;
    description: string;
}

/**
 * Shell class.
 */
export class Shell {
    baseUrl: string;
    isFileProtocol: boolean;
    isTouchCapable: boolean;
    options: ShellOptions;
    examples: Record<string, ExampleEntry>;
    examplesAvailable: boolean;
    container: HTMLDivElement;
    shell: HTMLDivElement;
    // variablesPanel: FixedScrollPanel;
    variables: HTMLDivElement;
    variablesHeading: HTMLHeadingElement;
    nameTable: HTMLDivElement;
    nameList: HTMLUListElement;
    evalInput: EvalInputHandler;
    evalPrompt: EvalPromptHandler;
    examplesContainer: HTMLDivElement;
    batchContainer: HTMLDivElement;
    batchBox: HTMLDivElement;
    batchWrapper: HTMLDivElement;
    batchInput: HTMLTextAreaElement;
    batchButton: HTMLButtonElement;
    promptContainer: HTMLDivElement;
    inputLines: string[];
    input: string;
    statements: string[];
    promptUid: string[];
    promptSet: Record<string, PromptEntry>;
    promptIndex: number;

    private constructor() {
        this.baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        this.isFileProtocol = this.baseUrl.startsWith('file:');
        this.isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;
    }

    /**
     * Shell initialization (instantiation).
     * @param options
     * @returns
     */
    public static async initialize(options: ShellOptions): Promise<Shell> {
        const shell = new Shell();
        shell.options = options;
        shell.container = document.getElementById(options.containerId) as HTMLDivElement;
        while (shell.container.firstChild) {
            shell.container.removeChild(shell.container.firstChild);
        }
        shell.container.className = 'prompt-container';
        if (options.evalInput) {
            shell.evalInput = options.evalInput;
        } else {
            shell.evalInput = function (input: HTMLTextAreaElement): [string[], string[]] {
                /* eslint-disable-next-line no-console */
                console.log(`evalInput(${input.value})`);
                return [[], input.value.split(/\r?\n/)];
            };
        }
        if (options.evalPrompt) {
            shell.evalPrompt = options.evalPrompt;
        } else {
            shell.evalPrompt = function (div: HTMLDivElement, box: HTMLDivElement, input: HTMLTextAreaElement, output: HTMLDivElement) {
                /* eslint-disable-next-line no-console */
                console.log(`evalPrompt(${input.value})`);
                output.innerHTML = `evalPrompt(${input.value})`;
            };
        }
        shell.shell = createHTMLElement('div', shell.container, 'shell_' + options.containerId, 'shell');
        if (!shell.isFileProtocol) {
            shell.examplesContainer = document.getElementById(options.examplesId) as HTMLDivElement;
            await global
                .fetch(`${global.MathJSLabCalc.exampleBaseUrl}example/example.json`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Examples unavailable.');
                    }
                    return response.json();
                })
                .then((data) => {
                    shell.examples = data;
                    shell.examplesAvailable = true;
                })
                /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
                .catch((error) => {
                    shell.examplesAvailable = false;
                });
        }
        shell.variables = createHTMLElement('div', shell.container, 'variables_' + options.containerId, 'variables');
        shell.variablesHeading = createHTMLElement('h2', shell.variables, null, 'green');
        shell.variablesHeading.setAttribute('align', 'center');
        window.addEventListener('scroll', shell.variablesPanelResize.bind(shell));
        window.addEventListener('resize', () => {
            shell.batchResize.bind(shell)();
            shell.variablesPanelResize.bind(shell)();
        });
        shell.nameTable = createHTMLElement('div', shell.variables, 'nameTable_' + options.containerId);
        shell.nameList = createHTMLElement('ul', shell.nameTable, null, 'namelist');

        // shell.variablesPanel = document.createElement('fixed-scroll-panel') as FixedScrollPanel;
        // shell.container.append(shell.variablesPanel);
        // shell.variablesPanel.setAttribute('id', 'variables_' + options.containerId);

        shell.batchContainer = createHTMLElement('div', shell.shell, 'batch_' + options.containerId, 'batch');
        shell.batchBox = createHTMLElement('div', shell.batchContainer, 'batchbox_' + options.containerId, 'good');
        shell.batchBox.setAttribute('align', 'center');
        shell.batchWrapper = createHTMLElement('div', shell.batchBox, 'batchwrapper_' + options.containerId);
        shell.batchInput = createHTMLElement('textarea', shell.batchWrapper, 'batchtext_' + options.containerId, 'inputarea');
        shell.batchInput.addEventListener('change', shell.batchResize.bind(shell));
        shell.batchDelayedResize = function (event: Event): void {
            window.setTimeout(shell.batchResize.bind(shell), 0);
        };
        shell.batchInput.addEventListener('cut', shell.batchDelayedResize.bind(shell));
        shell.batchInput.addEventListener('paste', shell.batchDelayedResize.bind(shell));
        shell.batchInput.addEventListener('drop', shell.batchDelayedResize.bind(shell));
        shell.batchInput.addEventListener('keydown', shell.batchDelayedResize.bind(shell));
        shell.batchInput.focus();
        shell.batchInput.select();
        shell.batchButton = createHTMLElement('button', shell.batchBox, 'batchbutton_', 'inputbutton');
        shell.batchButton.addEventListener('click', shell.batchExec.bind(shell));
        shell.batchInput.addEventListener('focus', shell.batchFocus.bind(shell));
        shell.batchInput.addEventListener('blur', shell.batchBlur.bind(shell));

        shell.promptContainer = createHTMLElement('div', shell.shell, 'prompt_' + options.containerId);
        if (global.EvaluatorPointer.debug) {
            const promptFoot = createHTMLElement('p', shell.shell);
            promptFoot.innerHTML = global.MathJSLabCalcBuildMessage;
        }
        shell.promptUid = [];
        shell.promptSet = {};
        shell.promptIndex = -1;
        shell.batchInput.value = shell.input = options.input;
        shell.batchResize.bind(shell)();
        if (shell.isFileProtocol || !shell.examplesAvailable) {
            shell.openContent(firstExample.content);
        } else {
            let first = true;
            for (const example in shell.examples) {
                const button = createHTMLElement('button', shell.examplesContainer, 'example-' + example);
                button.innerHTML = shell.examples[example].caption;
                button.addEventListener('click', async (event: Event): Promise<void> => {
                    const exampleId = (event.target as any).id.substring(8);
                    const response = await global.fetch(`${global.MathJSLabCalc.exampleBaseUrl}example/${shell.examples[exampleId].file}`);
                    if (!response.ok) {
                        throw new Error('Network response error.');
                    }
                    shell.openContent(await response.text());
                });
                if (first) {
                    button.click();
                    first = false;
                }
            }
        }
        shell.setLanguage();
        shell.promptAppend();
        return shell;
    }

    /**
     * Change strings depending on the language.
     * @param lang Language.
     */
    public setLanguage(lang?: string) {
        if (lang) {
            global.lang = lang;
        }
        this.variablesHeading.innerHTML = {
            en: 'Variables',
            es: 'Variables',
            pt: 'Variáveis',
        }[global.lang] as string;
        this.batchButton.innerHTML = {
            en: 'Evaluate',
            es: 'Computar',
            pt: 'Computar',
        }[global.lang] as string;
    }

    /**
     * Get current promptSet.
     */
    public get currentPromptSet(): PromptEntry {
        return this.promptSet[this.promptUid[this.promptIndex]];
    }

    /**
     * Batch input resize.
     * @param event
     */
    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public batchResize(event?: Event): void {
        this.batchInput.style.height = '1em';
        this.batchInput.style.height = this.batchInput.scrollHeight + 27 + 'px';
        this.variablesPanelResize();
    }

    /**
     * Variables panel resize.
     * @param event
     */
    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public variablesPanelResize(event?: Event): void {
        let Y = window.scrollY - this.container.offsetTop + window.innerHeight * 0.025;
        const maxY = this.container.offsetHeight - this.variables.offsetHeight;
        if (Y < 0) {
            Y = 0;
        } else if (Y > maxY) {
            Y = maxY;
        }
        this.variables.style.top = Y + 'px';
        this.variables.style.left = this.shell.offsetWidth + 'px';
        this.variables.style.height = Math.min(this.container.offsetHeight, window.innerHeight) * 0.9 + 'px';
    }

    /**
     * Batch input delayed resize.
     * @param event
     */

    // public batchDelayedResize(event: Event): void {
    //     window.setTimeout(this.batchResize, 0);
    // }

    public batchDelayedResize: EventHandler;
    /**
     * Batch input focus event handler.
     * @param event
     */
    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public batchFocus(event: Event): void {
        /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
        const onfocus = document.activeElement;
    }

    /**
     * Batch execution (button click) event handler.
     * @param event
     */
    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public batchExec(event: Event): void {
        this.promptClean();
        this.loadInput();
        this.variablesPanelResize();
        this.batchButton.focus();
    }

    /**
     * Open content.
     * @param content
     */
    public openContent(content: string): void {
        this.batchInput.value = content;
        this.promptClean();
        this.cleanNameList();
        this.loadInput();
    }

    /**
     * Clean name list in variables panel.
     */
    public cleanNameList(): void {
        this.nameList.remove();
        this.nameList = createHTMLElement('ul', this.nameTable, null, 'namelist');
    }

    /**
     * Refresh name list in variables panel.
     */
    public refreshNameList(): void {
        this.cleanNameList();
        for (const name in global.EvaluatorPointer.nameTable) {
            if (!global.EvaluatorPointer.nativeNameTableList.includes(name)) {
                const nameTableEntry = global.EvaluatorPointer.nameTable[name];
                const nameListEntry = createHTMLElement('li', this.nameList);
                if (nameTableEntry instanceof FunctionHandle) {
                    nameListEntry.innerHTML = `&commat; ${name}(${nameTableEntry.parameter.map((arg: { id: any }) => arg.id).join(',')})`;
                } else {
                    let resultType: string = '';
                    if (nameTableEntry.type !== undefined) {
                        if (nameTableEntry instanceof MultiArray) {
                            resultType = '[' + nameTableEntry.dimension.join('x') + ']';
                        } else if (nameTableEntry instanceof CharString) {
                            resultType = '(abc)';
                        } else {
                            resultType = '#';
                        }
                        if (nameTableEntry.type === 0) {
                            if (resultType[0] === '[') {
                                resultType += '&not;';
                            } else {
                                resultType = '&not;';
                            }
                        } else if (nameTableEntry.type === 2) {
                            resultType += '*';
                        }
                    }
                    nameListEntry.innerHTML = `${resultType} ${name}`;
                }
            }
        }
    }

    /**
     * Load code from batchInput, separing statements and creating prompts.
     */
    public loadInput(): void {
        // Separe statements and lines.
        const [statements, lines] = this.evalInput(this.batchInput);
        this.statements = statements;
        this.inputLines = lines;
        // Append empty statement if last statement is not an empty string (to create an empty prompt at the end).
        if (this.statements.length === 0) {
            this.statements = [''];
        } else if (this.statements[this.statements.length - 1].trim() !== '') {
            this.statements.push('');
        }
        for (let i = 0; i < this.statements.length; i++) {
            this.promptAppend(this.statements[i]);
        }
        this.batchResize();
        this.promptSet[this.promptUid[0]].input.focus();
    }

    /**
     * Batch blur event handler
     * @param event
     */
    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public batchBlur(event: Event): void {
        global.EvaluatorPointer.Restart();
        this.cleanNameList();
        this.promptClean();
        this.variablesPanelResize();
    }

    /**
     * Prompt focus event handler
     * @param event
     */
    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public promptFocus(event: Event): void {
        this.promptIndex = this.promptUid.indexOf(document.activeElement?.id.substring(1) as string);
    }

    /**
     * Prompt blur event handler
     * @param event
     */
    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public promptBlur(event: Event): void {
        const onblur = this.promptSet[this.promptUid[this.promptIndex]].input;
        if (this.isTouchCapable && onblur.value != '') {
            this.evalPrompt(
                this.promptSet[onblur.id.substring(1)].container,
                this.promptSet[onblur.id.substring(1)].box,
                this.promptSet[onblur.id.substring(1)].input,
                this.promptSet[onblur.id.substring(1)].output,
            );
        }
    }

    /**
     *
     */
    public promptClean(): void {
        for (const i in this.promptSet) {
            this.promptSet[i].container.remove();
        }
        this.cleanNameList();
    }

    /**
     * Append prompt with optional expression.
     * @param text Expression to evaluate in prompt appended.
     */
    public promptAppend(text?: string | null): void {
        const uid = global.crypto.randomUUID();
        const div = createHTMLElement('div', this.promptContainer, 'd' + uid);
        this.promptCreate(uid, div);
        this.promptIndex++;
        this.promptUid.push(uid);
        this.promptSet[uid].input.value = text ?? '';
        this.promptSet[uid].input.style.height = '1em';
        this.promptSet[uid].input.style.height = this.promptSet[uid].input.scrollHeight + 'px';
        this.promptSet[uid].input.focus();
        if (this.isTouchCapable) {
            this.promptSet[uid].input.blur();
        } else {
            this.evalPrompt(this.promptSet[uid].container, this.promptSet[uid].box, this.promptSet[uid].input, this.promptSet[uid].output);
        }
    }

    /**
     * Creates prompt structure.
     * @param uid
     * @param promptFrame
     */
    public promptCreate(uid: string, promptFrame: HTMLDivElement): void {
        const box = createHTMLElement('div', promptFrame, 'p' + uid, 'good');
        const table = createHTMLElement('table', box);
        table.style.width = '100%';
        const tr = createHTMLElement('tr', table);
        let td: HTMLTableCellElement;
        td = createHTMLElement('td', tr, null, 'cursor');
        td.innerHTML = '&#x300B;';
        td = createHTMLElement('td', tr);
        const input = createHTMLElement('textarea', td, 'i' + uid, 'inputprompt');
        input.addEventListener('focus', this.promptFocus.bind(this));
        input.addEventListener('blur', this.promptBlur.bind(this));
        input.addEventListener('keydown', this.promptKeydown.bind(this));

        const promptResize = () => {
            input.style.height = '1em';
            input.style.height = input.scrollHeight + 'px';
        };
        /* 0-timeout to get the already changed textarea */
        const promptDelayedResize = () => {
            window.setTimeout(promptResize, 0);
        };
        const inputFocus = () => {
            if (!this.isTouchCapable) input.focus();
        };
        input.addEventListener('change', promptResize);
        input.addEventListener('cut', promptDelayedResize);
        input.addEventListener('paste', promptDelayedResize);
        input.addEventListener('drop', promptDelayedResize);
        input.addEventListener('keydown', promptDelayedResize);
        box.addEventListener('click', inputFocus);
        promptResize();

        const output = createHTMLElement('div', box, 'o' + uid, 'output');

        this.promptSet[uid] = {
            container: promptFrame,
            box,
            input,
            output,
        };
        this.refreshNameList();
    }

    /**
     * Prompt keyboard event handler.
     * @param event
     * @returns
     */
    public promptKeydown(event: KeyboardEvent) {
        let onfocus = document.activeElement as HTMLTextAreaElement;
        if (!event.ctrlKey && !event.altKey && !event.metaKey) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (onfocus.selectionStart == 0) {
                    // Creates previous prompt if enter is pressed with cursor at 0.
                    const pdiv = document.getElementById('d' + onfocus?.id.substring(1));
                    const uid = global.crypto.randomUUID();
                    const div = createHTMLElement('div', null, 'd' + uid);
                    this.promptCreate(uid, div);
                    this.promptUid.splice(this.promptIndex, 0, uid);
                    this.promptIndex++;
                    this.promptContainer.insertBefore(div, pdiv);
                    onfocus.style.width = '90%';
                    onfocus.style.height = '1em';
                    onfocus.style.height = onfocus.scrollHeight + 'px';
                } else {
                    if (this.promptIndex + 1 == this.promptUid.length) {
                        // Append to end.
                        const uid = global.crypto.randomUUID();
                        const div = createHTMLElement('div', this.promptContainer, 'd' + uid);
                        this.promptCreate(uid, div);
                        this.promptUid.push(uid);
                        this.promptIndex++;
                    }
                    this.evalPrompt(
                        this.promptSet[onfocus.id.substring(1)].container,
                        this.promptSet[onfocus.id.substring(1)].box,
                        this.promptSet[onfocus.id.substring(1)].input,
                        this.promptSet[onfocus.id.substring(1)].output,
                    );
                    // Go to the next prompt.
                    onfocus = this.promptSet[this.promptUid[this.promptUid.indexOf(onfocus.id.substring(1)) + 1]].input;
                    onfocus.focus();
                    onfocus.selectionStart = onfocus.value.length;
                    this.refreshNameList();
                }
                if (!event.shiftKey) return false;
            } else if (
                // Deletes prompt if it is null and press backspace in column 0.
                event.key === 'Backspace' &&
                onfocus.selectionStart == 0
            ) {
                if (this.promptIndex !== 0 && this.promptSet[this.promptUid[this.promptIndex - 1]].input.value.trim() === '') {
                    // Deletes previous prompt.
                    this.promptSet[this.promptUid[this.promptIndex - 1]].container.remove();
                    delete this.promptSet[this.promptUid[this.promptIndex - 1]];
                    this.promptUid.splice(this.promptIndex - 1, 1);
                    this.promptIndex--;
                    event.preventDefault();
                } else if (this.promptSet[this.promptUid[this.promptIndex]].input.value.trim() === '') {
                    // Deletes current prompt.
                    this.promptSet[this.promptUid[this.promptIndex]].container.remove();
                    delete this.promptSet[this.promptUid[this.promptIndex]];
                    this.promptUid.splice(this.promptIndex, 1);
                    this.promptIndex--;
                    this.promptSet[this.promptUid[this.promptIndex]].input.focus();
                    event.preventDefault();
                }
            } else if (event.key === 'ArrowUp') {
                if (this.promptIndex > 0 && onfocus.selectionStart <= onfocus.value.split(/\r?\n/)[0].length) {
                    this.promptSet[this.promptUid[this.promptUid.indexOf(onfocus.id.substring(1)) - 1]].input.focus();
                    event.preventDefault();
                }
            } else if (event.key === 'ArrowDown') {
                const promptLines = onfocus.value.split(/\r?\n/);
                promptLines.pop();
                if (this.promptIndex + 1 < this.promptUid.length && onfocus.selectionStart >= promptLines.join('\n').length + 1) {
                    this.promptSet[this.promptUid[this.promptUid.indexOf(onfocus.id.substring(1)) + 1]].input.focus();
                    event.preventDefault();
                }
            }
        }
    }
}
