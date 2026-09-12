import { CharString, FunctionHandle, Interpreter, MultiArray } from 'mathjslab';
import i18n from './i18n';
import type { BatchCodeEditor } from './components/batch-code-editor/batch-code-editor.component';
import type { BatchOutput } from './components/batch-output/batch-output.component';
import type { CommandPrompt } from './components/command-prompt/command-prompt.component';
import { type CommandPromptEvalHandler, type CommandPromptList } from './components/command-prompt-list/command-prompt-list.component';
import type { FixedScrollPanel } from './components/fixed-scroll-panel/fixed-scroll-panel.component';
import { BatchOutputTarget, type CommandOutputTarget, PromptOutputTarget } from './CommandOutputTarget';

/**
 * Result of parsing multiline editor input.
 */
export type EvalInputResult = { statements: string[]; lines: string[]; hasError?: boolean };

/**
 * Input interpreter handler.
 */
export type EvalInputHandler = (input: string) => EvalInputResult;

/**
 * Presentation-neutral command evaluator.
 */
export type EvalCommandHandler = (input: string, target: CommandOutputTarget) => boolean;

/**
 * Available command workspace presentations.
 */
export type CommandWorkspaceMode = 'editor-prompts' | 'prompts' | 'editor-output';

/**
 * Elements used by the command workspace controller.
 */
export type CommandWorkspaceElement = {
    wrapper: HTMLElement;
    frameBox: HTMLElement;
    batch: BatchCodeEditor;
    output: BatchOutput;
    modeControls: HTMLElement;
    modeSelect: HTMLSelectElement;
    modeLabel: HTMLElement;
    modeEditorPromptsOption: HTMLOptionElement;
    modePromptsOption: HTMLOptionElement;
    modeEditorOutputOption: HTMLOptionElement;
    showCommandOption: HTMLElement;
    showCommandCheckbox: HTMLInputElement;
    showCommandLabel: HTMLElement;
    controls: HTMLElement;
    runButton: HTMLButtonElement;
    clearOutputButton: HTMLButtonElement;
    resetButton: HTMLButtonElement;
    status: HTMLElement;
    promptSet: CommandPromptList;
    variables: FixedScrollPanel;
};

type CommandWorkspaceStatus = { type: 'ready' | 'finished' | 'error'; count?: number };

/**
 * Controller for the interactive command workspace projected into application-wrapper.
 */
export class CommandWorkspace {
    public readonly element: CommandWorkspaceElement;
    public interpreterPointer!: Interpreter;
    public evalInput: EvalInputHandler;
    public evalCommand: EvalCommandHandler;
    public nameList: HTMLUListElement;
    private lastLoadedSource = '';
    private statusState: CommandWorkspaceStatus = { type: 'ready' };
    private mode: CommandWorkspaceMode = globalThis.matchMedia('(min-width: 768px)').matches ? 'editor-prompts' : 'prompts';
    private batchListenersConnected = false;

    public constructor(rootId = 'mathjslab-shell') {
        this.element = {
            wrapper: this.byId(`${rootId}-wrapper`),
            frameBox: this.byId(`${rootId}-frame-box`),
            batch: this.byId(`${rootId}-batch`),
            output: this.byId(`${rootId}-output`),
            modeControls: this.byId(`${rootId}-mode-controls`),
            modeSelect: this.byId(`${rootId}-mode`),
            modeLabel: this.byId(`${rootId}-mode-label`),
            modeEditorPromptsOption: this.byId(`${rootId}-mode-editor-prompts`),
            modePromptsOption: this.byId(`${rootId}-mode-prompts`),
            modeEditorOutputOption: this.byId(`${rootId}-mode-editor-output`),
            showCommandOption: this.byId(`${rootId}-show-command-option`),
            showCommandCheckbox: this.byId(`${rootId}-show-command`),
            showCommandLabel: this.byId(`${rootId}-show-command-label`),
            controls: this.byId(`${rootId}-controls`),
            runButton: this.byId(`${rootId}-run`),
            clearOutputButton: this.byId(`${rootId}-clear-output`),
            resetButton: this.byId(`${rootId}-reset`),
            status: this.byId(`${rootId}-status`),
            promptSet: this.byId(`${rootId}-prompt-set`),
            variables: this.byId(`${rootId}-variables`),
        };
        this.element.variables.element.root = this.element.frameBox;
        this.nameList = document.createElement('ul');
        this.nameList.id = `${this.element.variables.id}-namelist`;
        this.nameList.className = 'namelist';
        this.nameList.slot = 'content';
        this.element.variables.append(this.nameList);
        this.element.promptSet.evalPrompt = (prompt: CommandPrompt, index?: number): void => {
            index = typeof index === 'number' && index >= 0 ? index : this.element.promptSet.element.prompt.indexOf(prompt);
            new PromptOutputTarget(prompt).setText(`evalPrompt(${prompt.element.input.value}, ${index})`);
        };
        this.evalInput = (input: string): EvalInputResult => ({
            statements: [],
            lines: input.split(/\r?\n/),
        });
        this.evalCommand = (input: string, target: CommandOutputTarget): boolean => {
            target.setText(`evalCommand(${input})`);
            return true;
        };
        this.element.promptSet.evalPromptRefresh = this.refreshNameList;
    }

    public connect(): void {
        this.element.modeSelect.value = this.mode;
        this.element.modeSelect.addEventListener('change', this.changeMode);
        this.element.showCommandCheckbox.addEventListener('change', this.toggleShowCommand);
        this.element.output.showCommand = this.element.showCommandCheckbox.checked;
        this.applyMode();
        this.element.variables.onChangeDisplay = (_event?: Event, display?: boolean): void => {
            if (display) {
                this.variablesAddEventListener();
            } else {
                this.variablesRemoveEventListener();
            }
        };
        if (this.element.variables.state.display) {
            this.variablesAddEventListener();
        }
        globalThis.addEventListener('resize', this.resize);
        i18n.addEventListener('languagechange', this.setLanguage);
        this.resize();
        this.setLanguage();
    }

    public set evalPrompt(evalPrompt: CommandPromptEvalHandler) {
        this.element.promptSet.evalPrompt = evalPrompt;
    }

    public get evalPrompt(): CommandPromptEvalHandler {
        return this.element.promptSet.evalPrompt;
    }

    public readonly setLanguage = (): void => {
        this.element.variables.element.title.textContent = i18n.page.shell.variables;
        this.element.modeControls.setAttribute('aria-label', i18n.page.shell.modeControlsLabel);
        this.element.modeLabel.textContent = i18n.page.shell.modeLabel;
        this.element.modeEditorPromptsOption.textContent = i18n.page.shell.modes.editorPrompts;
        this.element.modePromptsOption.textContent = i18n.page.shell.modes.prompts;
        this.element.modeEditorOutputOption.textContent = i18n.page.shell.modes.editorOutput;
        this.element.showCommandLabel.textContent = i18n.page.shell.showCommandOutput;
        this.element.controls.setAttribute('aria-label', i18n.page.shell.controlsLabel);
        this.element.runButton.textContent = i18n.page.shell.run;
        this.element.clearOutputButton.textContent = i18n.page.shell.clearOutput;
        this.element.resetButton.textContent = i18n.page.shell.resetSample;
        this.applyStatus();
    };

    public readonly resize = (): void => {
        this.element.batch.resize();
        this.element.variables.resize();
    };

    public readonly restart = (): void => {
        this.interpreterPointer.Restart();
        this.nameList.replaceChildren();
        this.element.promptSet.clear();
        this.element.output.clear();
        this.element.variables.resize();
    };

    public readonly evaluate = (): void => {
        try {
            const { statements, hasErrors } = this.load();
            this.setStatus(hasErrors ? { type: 'error' } : { type: 'finished', count: statements.length });
        } catch (error) {
            this.setStatus({ type: 'error' });
            if (this.interpreterPointer.debug) {
                throw error;
            }
        }
    };

    /**
     * Clear evaluated prompts while keeping the source currently in the editor.
     */
    public readonly clearOutput = (): void => {
        if (this.mode === 'editor-output') {
            this.element.output.clear();
        } else {
            this.element.promptSet.clear();
        }
        this.setStatus({ type: 'ready' });
        this.resize();
        this.element.batch.focus();
    };

    /**
     * Restore the last example source loaded into the batch editor.
     */
    public readonly resetSample = (): void => {
        this.element.batch.value = this.lastLoadedSource;
        this.restart();
        this.setStatus({ type: 'ready' });
        this.resize();
        this.element.batch.focus();
    };

    public readonly refreshNameList = (): void => {
        this.nameList.replaceChildren();
        for (const name in this.interpreterPointer.context.currentScope.nameTable) {
            if (!this.interpreterPointer.context.nativeNameSet.has(name)) {
                const nameTableEntry = this.interpreterPointer.context.currentScope.nameTable[name];
                if (!nameTableEntry) {
                    continue;
                }
                const nameListEntry = document.createElement('li');
                nameListEntry.className = 'nameitem';
                this.nameList.append(nameListEntry);
                if (nameTableEntry instanceof FunctionHandle) {
                    nameListEntry.innerHTML = `&commat; ${name}(${nameTableEntry.parameter.map((arg) => this.interpreterPointer.Unparse(arg)).join(',')})`;
                } else {
                    let resultType = '';
                    if (nameTableEntry.node && nameTableEntry.node.type !== undefined) {
                        if (nameTableEntry instanceof MultiArray) {
                            resultType = `[${nameTableEntry.dimension.join('x')}]`;
                        } else if (nameTableEntry instanceof CharString) {
                            resultType = '(abc)';
                        } else {
                            resultType = '#';
                        }
                        if (nameTableEntry.node.type === 0) {
                            resultType = resultType[0] === '[' ? `${resultType}&not;` : '&not;';
                        } else if (nameTableEntry.node.type === 2) {
                            resultType += '*';
                        }
                    }
                    nameListEntry.innerHTML = `${resultType} ${name}`;
                }
            }
        }
    };

    public load(text?: string): { statements: string[]; lines: string[]; hasErrors: boolean } {
        if (text !== undefined) {
            this.element.batch.value = text;
            this.lastLoadedSource = text;
        }
        this.nameList.replaceChildren();
        const { statements, lines, hasError } = this.evalInput(this.element.batch.value);
        let hasErrors = hasError === true;
        if (this.mode === 'editor-output') {
            this.element.output.clear();
            for (const statement of statements) {
                hasErrors = !this.evalCommand(statement, new BatchOutputTarget(this.element.output, statement)) || hasErrors;
            }
        } else {
            this.element.promptSet.promptLoadEval([...statements]);
            hasErrors = this.element.promptSet.element.prompt.some((prompt) => prompt.element.frameBox.classList.contains('bad')) || hasErrors;
        }
        this.refreshNameList();
        this.resize();
        return { statements, lines, hasErrors };
    }

    public debugMessage(message: string): void {
        if (this.interpreterPointer.debug) {
            const promptFoot = document.createElement('p');
            promptFoot.innerHTML = message;
            this.element.wrapper.appendChild(promptFoot);
        }
    }

    private byId<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`missing command workspace element: ${id}`);
        }
        return element as T;
    }

    private batchAddEventListener(): void {
        if (this.batchListenersConnected) {
            return;
        }
        this.batchListenersConnected = true;
        globalThis.addEventListener('resize', this.element.batch.resize);
        this.element.batch.element.input.addEventListener('change', this.resize);
        this.element.batch.element.input.addEventListener('cut', this.delayedResize);
        this.element.batch.element.input.addEventListener('paste', this.delayedResize);
        this.element.batch.element.input.addEventListener('drop', this.delayedResize);
        this.element.batch.element.input.addEventListener('keydown', this.delayedResize);
        this.element.batch.element.input.addEventListener('blur', this.restart);
        this.element.runButton.addEventListener('click', this.evaluate);
        this.element.clearOutputButton.addEventListener('click', this.clearOutput);
        this.element.resetButton.addEventListener('click', this.resetSample);
    }

    private batchRemoveEventListener(): void {
        if (!this.batchListenersConnected) {
            return;
        }
        this.batchListenersConnected = false;
        globalThis.removeEventListener('resize', this.element.batch.resize);
        this.element.batch.element.input.removeEventListener('change', this.resize);
        this.element.batch.element.input.removeEventListener('cut', this.delayedResize);
        this.element.batch.element.input.removeEventListener('paste', this.delayedResize);
        this.element.batch.element.input.removeEventListener('drop', this.delayedResize);
        this.element.batch.element.input.removeEventListener('keydown', this.delayedResize);
        this.element.batch.element.input.removeEventListener('blur', this.restart);
        this.element.runButton.removeEventListener('click', this.evaluate);
        this.element.clearOutputButton.removeEventListener('click', this.clearOutput);
        this.element.resetButton.removeEventListener('click', this.resetSample);
    }

    private variablesAddEventListener(): void {
        globalThis.addEventListener('scroll', this.element.variables.resize);
        globalThis.addEventListener('resize', this.element.variables.resize);
    }

    private variablesRemoveEventListener(): void {
        globalThis.removeEventListener('scroll', this.element.variables.resize);
        globalThis.removeEventListener('resize', this.element.variables.resize);
    }

    private readonly changeMode = (): void => {
        const value = this.element.modeSelect.value;
        this.mode = value === 'editor-prompts' || value === 'editor-output' ? value : 'prompts';
        this.applyMode();
        if (this.mode === 'prompts') {
            this.element.promptSet.focusActive();
        } else {
            this.element.batch.focus();
        }
    };

    private readonly toggleShowCommand = (): void => {
        this.element.output.showCommand = this.element.showCommandCheckbox.checked;
    };

    private applyMode(): void {
        const showEditor = this.mode !== 'prompts';
        const showBatchOutput = this.mode === 'editor-output';
        this.element.batch.hidden = !showEditor;
        this.element.controls.hidden = !showEditor;
        this.element.promptSet.hidden = showBatchOutput;
        this.element.output.hidden = !showBatchOutput;
        this.element.showCommandOption.hidden = !showBatchOutput;
        if (showEditor) {
            this.batchAddEventListener();
        } else {
            this.batchRemoveEventListener();
        }
        this.resize();
    }

    private readonly delayedResize = (): void => {
        globalThis.setTimeout(this.resize, 0);
    };

    private setStatus(status: CommandWorkspaceStatus): void {
        this.statusState = status;
        this.applyStatus();
    }

    private applyStatus(): void {
        if (this.statusState.type === 'finished') {
            this.element.status.textContent = i18n.format('shell.status.finished', { count: this.statusState.count ?? 0 });
            return;
        }
        this.element.status.textContent = i18n.page.shell.status[this.statusState.type];
    }
}
