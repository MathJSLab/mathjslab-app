import $ from 'basic-dom-helper';
import firstExample from './first-example.json';

/**
 * Shell evaluator prompt handler
 */
export type EvalPromptHandler = (frame: HTMLDivElement, box: HTMLDivElement, input: HTMLTextAreaElement, output: HTMLDivElement) => void;

export interface BatchOptions {
    cleanOnBlur: boolean;
}

export interface PromptOptions {
    cleanOnBlur: boolean;
}

/**
 * Shell instantiation options.
 */
export interface ShellOptions {
    containerId: string;
    evalPrompt?: EvalPromptHandler;
    inputLines: string[];
    batch?: BatchOptions | boolean;
    prompt?: PromptOptions | boolean;
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
 * External reference for instantiated class to be used when context 'this' is
 * compromised (like in event listeners).
 */
let that: Shell;

/**
 * Shell prompt class.
 */
export class Shell {
    baseUrl: string;
    fileProtocol: boolean;
    examples: Record<string, ExampleEntry>;
    container: HTMLDivElement;
    evalPrompt: EvalPromptHandler;
    isTouchCapable: boolean;
    examplesContainer: HTMLDivElement;
    batchContainer: HTMLDivElement;
    batchBox: HTMLDivElement;
    batchWrapper: HTMLDivElement;
    batchInput: HTMLTextAreaElement;
    batchButton: HTMLButtonElement;
    promptContainer: HTMLDivElement;
    inputLines: string[];
    promptUid: string[];
    promptSet: Record<string, PromptEntry>;
    promptIndex: number;

    private constructor() {
        /* eslint-disable-next-line @typescript-eslint/no-this-alias */
        that = this;
        this.baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        this.fileProtocol = this.baseUrl.startsWith('file:');
        this.isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;
    }

    public static async initialize(options: ShellOptions): Promise<Shell> {
        const shell = new Shell();
        shell.container = $.i(options.containerId) as HTMLDivElement;
        if (options.evalPrompt) {
            shell.evalPrompt = options.evalPrompt;
        } else {
            shell.evalPrompt = function (div: HTMLDivElement, box: HTMLDivElement, input: HTMLTextAreaElement, output: HTMLDivElement) {
                console.log(`evalPrompt(${input.value})`);
                output.innerHTML = `evalPrompt(${input.value})`;
            };
        }
        shell.inputLines = options.inputLines;
        if (!shell.fileProtocol) {
            const response = await fetch(`${shell.baseUrl}example/example.json`);
            if (!response.ok) {
                throw new Error('Network response error.');
            }
            shell.examples = await response.json();
            shell.examplesContainer = $.create('div', shell.container, 'examples_' + options.containerId);
            const examplesHeading = $.create('h2', shell.examplesContainer);
            examplesHeading.innerHTML = 'Examples';
        }
        shell.batchContainer = $.create('div', shell.container, 'batch_' + options.containerId);
        shell.batchBox = $.create('div', shell.batchContainer, 'batchbox_' + options.containerId, 'good');
        shell.batchWrapper = $.create('div', shell.batchBox, 'batchwrapper_' + options.containerId);
        shell.batchInput = $.create('textarea', shell.batchWrapper, 'batchtext_' + options.containerId, 'inputarea');
        $.addEventListener(shell.batchInput, 'change', shell.batchResize);
        $.addEventListener(shell.batchInput, 'cut', shell.batchDelayedResize);
        $.addEventListener(shell.batchInput, 'paste', shell.batchDelayedResize);
        $.addEventListener(shell.batchInput, 'drop', shell.batchDelayedResize);
        $.addEventListener(shell.batchInput, 'keydown', shell.batchDelayedResize);
        shell.batchInput.focus();
        shell.batchInput.select();
        shell.batchButton = $.create('button', shell.batchBox, 'batchbutton_', 'inputbutton');
        shell.batchButton.innerHTML = 'Evaluate';
        (shell.batchButton as any).style = 'width:calc(100% - 3em);height:50px';
        $.addEventListener(shell.batchButton, 'click', shell.batchExec);
        $.addEventListener(shell.batchInput, 'focus', shell.batchFocus);
        $.addEventListener(shell.batchInput, 'blur', shell.batchBlur);
        shell.promptContainer = $.create('div', shell.container, 'prompt_' + options.containerId);
        shell.promptUid = [];
        shell.promptSet = {};
        shell.promptIndex = -1;
        shell.updateBatch();
        //TLN.append_line_numbers(shell.batchInput.id);
        shell.batchResize();
        shell.promptAppend();
        shell.loadExamples();
        return shell;
    }

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public batchResize(event?: Event): void {
        that.batchInput.style.height = '1em';
        that.batchInput.style.height = that.batchInput.scrollHeight + 27 + 'px';
    }

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public batchDelayedResize(event: Event): void {
        window.setTimeout(that.batchResize, 0);
    }

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public batchFocus(event: Event): void {
        /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
        const onfocus = document.activeElement;
    }

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public batchExec(event: Event): void {
        that.promptClean();
        that.loadBatch();
        that.loadLines();
        that.batchButton.focus();
    }

    public updateBatch(): void {
        this.batchInput.value = this.inputLines.join('\n');
    }

    public loadBatch(): void {
        this.inputLines = this.batchInput.value.split('\n');
    }

    public loadLines(): void {
        if (this.inputLines && this.inputLines.length == 0) this.inputLines = [''];
        if (this.inputLines) {
            for (let i = 0; i < this.inputLines.length; i++) {
                this.promptAppend(this.inputLines[i]);
            }
            this.batchResize();
            this.promptSet[this.promptUid[0]].input.focus();
        }
    }

    public loadExamples(): void {
        if (this.fileProtocol) {
            that.batchInput.value = firstExample.content;
            that.batchExec(new Event('click'));
        } else {
            let first = true;
            for (const example in this.examples) {
                const button = $.create('button', this.examplesContainer, 'example-' + example);
                button.innerHTML = this.examples[example].caption;
                $.addEventListener(button, 'click', async (event: Event): Promise<void> => {
                    const exampleId = (event.target as any).id.substring(8);
                    const response = await fetch(`${this.baseUrl}example/${this.examples[exampleId].file}`);
                    if (!response.ok) {
                        throw new Error('Network response error.');
                    }
                    that.batchInput.value = await response.text();
                    that.batchExec(event);
                });
                if (first) {
                    button.click();
                    first = false;
                }
            }
        }
    }

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public batchBlur(event: Event): void {
        that.promptClean();
    }

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public promptFocus(event: Event): void {
        that.promptIndex = that.promptUid.indexOf(document.activeElement?.id.substring(1) as string);
    }

    /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
    public promptBlur(event: Event): void {
        const onblur = that.promptSet[that.promptUid[that.promptIndex]].input;
        if (that.isTouchCapable && onblur.value != '') {
            that.evalPrompt(
                that.promptSet[onblur.id.substring(1)].container,
                that.promptSet[onblur.id.substring(1)].box,
                that.promptSet[onblur.id.substring(1)].input,
                that.promptSet[onblur.id.substring(1)].output,
            );
        }
    }

    public promptClean(): void {
        for (const i in this.promptSet) {
            this.promptSet[i].container.remove();
        }
    }

    public promptAppend(text?: string | null): void {
        const uid = $.uid();
        const div = $.create('div', this.promptContainer, 'd' + uid);
        this.promptCreate(uid, div);
        this.promptIndex++;
        this.promptUid.push(uid);
        if (text) this.promptSet[uid].input.value = text;
        this.promptSet[uid].input.focus();
        if (this.isTouchCapable) {
            this.promptSet[uid].input.blur();
        } else {
            this.evalPrompt(this.promptSet[uid].container, this.promptSet[uid].box, this.promptSet[uid].input, this.promptSet[uid].output);
        }
    }

    public promptCreate(uid: string, promptFrame: HTMLDivElement): void {
        const box = $.create('div', promptFrame, 'p' + uid, 'good');
        const table = $.create('table', box);
        table.style.width = '100%';
        const tr = $.create('tr', table);
        let td: HTMLTableCellElement;
        td = $.create('td', tr);
        td.innerHTML = '&#x300B;';
        td.style.width = '1em';
        td.style.position = 'relative';
        td.style.top = '-0.175em';
        td = $.create('td', tr);
        const input = $.create('textarea', td, 'i' + uid, 'inputprompt');
        $.addEventListener(input, 'focus', this.promptFocus);
        $.addEventListener(input, 'blur', this.promptBlur);
        $.addEventListener(input, 'keydown', this.promptKeydown);

        const promptResize = () => {
            input.style.width = '97%';
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
        $.addEventListener(input, 'change', promptResize);
        $.addEventListener(input, 'cut', promptDelayedResize);
        $.addEventListener(input, 'paste', promptDelayedResize);
        $.addEventListener(input, 'drop', promptDelayedResize);
        $.addEventListener(input, 'keydown', promptDelayedResize);
        $.addEventListener(box, 'click', inputFocus);
        promptResize();

        const output = $.create('div', box, 'o' + uid);

        this.promptSet[uid] = {
            container: promptFrame,
            box,
            input,
            output,
        };
    }

    public promptKeydown(event: KeyboardEvent) {
        let onfocus = document.activeElement as HTMLTextAreaElement;
        if (!event.ctrlKey && !event.altKey && !event.metaKey) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (onfocus.selectionStart == 0) {
                    // cria prompt anterior se pressionado enter com o cursor em 0
                    const pdiv = document.getElementById('d' + onfocus?.id.substring(1));
                    const uid = $.uid();
                    const div = $.create('div', null, 'd' + uid);
                    that.promptCreate(uid, div);
                    that.promptUid.splice(that.promptIndex, 0, uid);
                    that.promptIndex++;
                    that.promptContainer.insertBefore(div, pdiv);
                    onfocus.style.width = '90%';
                    onfocus.style.height = '1em';
                    onfocus.style.height = onfocus.scrollHeight + 'px';
                    that.inputLines.splice(that.promptIndex - 1, 0, onfocus.value);
                    that.batchInput.value = that.inputLines.join('\n');
                } else {
                    if (that.promptIndex + 1 == that.promptUid.length) {
                        // adiciona ao final
                        const uid = $.uid();
                        const div = $.create('div', that.promptContainer, 'd' + uid);
                        that.promptCreate(uid, div);
                        that.promptUid.push(uid);
                        that.inputLines.push(that.promptSet[onfocus?.id.substring(1)].input.value);
                        that.batchInput.value = that.inputLines.join('\n');
                        that.promptIndex++;
                    }
                    that.evalPrompt(
                        that.promptSet[onfocus.id.substring(1)].container,
                        that.promptSet[onfocus.id.substring(1)].box,
                        that.promptSet[onfocus.id.substring(1)].input,
                        that.promptSet[onfocus.id.substring(1)].output,
                    );
                    // passa ao próximo prompt
                    onfocus = that.promptSet[that.promptUid[that.promptUid.indexOf(onfocus.id.substring(1)) + 1]].input;
                    onfocus.focus();
                    onfocus.selectionStart = onfocus.value.length;
                }
                if (!event.shiftKey) return false;
            } else if (
                // apaga prompt anterior se for nulo e pressionar backspace na coluna 0
                event.key === 'Backspace' &&
                onfocus.selectionStart == 0 &&
                that.promptIndex != 0 &&
                that.promptSet[that.promptUid[that.promptIndex - 1]].input.value == ''
            ) {
                // apaga prompt anterior
                that.promptSet[that.promptUid[that.promptIndex - 1]].container.remove();
                delete that.promptSet[that.promptUid[that.promptIndex - 1]];
                that.promptUid.splice(that.promptIndex - 1, 1);
                that.inputLines.splice(that.promptIndex - 1, 1);
                that.batchInput.value = that.inputLines.join('\n');
                that.promptIndex--;
            } else if (event.key === 'ArrowUp') {
                if (that.promptIndex > 0) that.promptSet[that.promptUid[that.promptUid.indexOf(onfocus.id.substring(1)) - 1]].input.focus();
            } else if (event.key === 'ArrowDown') {
                if (that.promptIndex + 1 < that.promptUid.length)
                    that.promptSet[that.promptUid[that.promptUid.indexOf(onfocus.id.substring(1)) + 1]].input.focus();
            }
        }
    }
}
