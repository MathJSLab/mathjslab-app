/* Web component element type definition. */
import type WebComponentElement from '../WebComponentElement';
/* Web component method factories. */
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
/* Web component styles. */
import styles from './command-shell.styles.scss';
/* BatchPanel Web component. */
import { BatchPanel } from '../batch-panel/batch-panel.component';
/* CommandPrompt Web component. */
import { CommandPrompt } from '../command-prompt/command-prompt.component';
/* CommandPromptSet Web component. */
import { CommandPromptEvalHandler, CommandPromptSet } from '../command-prompt-set/command-prompt-set.component';
/* FixedScrollPanel Web component. */
import { FixedScrollPanel } from '../fixed-scroll-panel/fixed-scroll-panel.component';
import { CharString, FunctionHandle, MultiArray } from 'mathjslab';
/* Set of Web component elements. */
export interface CommandShellElementEntry {
    /* Wrapper */
    wrapper: HTMLDivElement;
    /* Frame box */
    frameBox: HTMLDivElement;
    /* Batch */
    batch: BatchPanel;
    /* Prompt set */
    promptSet: CommandPromptSet;
    /* Variables panel */
    variables: FixedScrollPanel;
}
/* Set of Web component elements. */
export type CommandShellElement = WebComponentElement<CommandShellElementEntry>;
/* Set of Web component element entry keys. */
export const CommandShellElementEntryKey: (keyof CommandShellElementEntry)[] = ['wrapper', 'frameBox', 'batch', 'promptSet', 'variables'] as const;
/**
 * Event handler.
 */
export type EventHandler = (event: Event) => void;
/**
 * Input evaluator handler.
 */
export type EvalInputHandler = (input: string) => { statements: string[]; lines: string[] };
/**
 * # CommandShell Web Component
 */
export class CommandShell extends HTMLElement {
    /* Web Component base id slug. */
    public static readonly tagName = 'command-shell';
    /* Web component HTML elements. */
    public element = {} as CommandShellElement;
    /* Web component template HTML element field names. */
    public static readonly elementFields: (keyof CommandShellElementEntry)[] = CommandShellElementEntryKey;
    /* Web component template HTML element id postfix. */
    public static readonly elementPostfix = keyToPostfix(CommandShellElementEntryKey);
    /* Web component null value */
    public static readonly null = null as unknown as CommandShell;
    /* Web component undefined value */
    public static readonly undefined = undefined as unknown as CommandShell;
    /* Web Component constructor. */
    public constructor() {
        super();
        constructorFactory(CommandShell, styles).bind(this)();
        this.element.variables.element.root = this.element.frameBox;
        window.addEventListener('scroll', this.element.variables.resize.bind(this.element.variables));
        window.addEventListener('resize', this.resize.bind(this));
        this.nameList = document.createElement('ul');
        this.nameList.id = `${this.element.variables.id}-namelist`;
        this.nameList.className = 'namelist';
        this.nameList.slot = 'content';
        this.element.variables.append(this.nameList);
        this.element.batch.element.input.addEventListener('change', this.resize.bind(this));
        const delayedResize = (_event: Event): void => {
            window.setTimeout(this.resize.bind(this), 0);
        };
        this.element.batch.element.input.addEventListener('cut', delayedResize);
        this.element.batch.element.input.addEventListener('paste', delayedResize);
        this.element.batch.element.input.addEventListener('drop', delayedResize);
        this.element.batch.element.input.addEventListener('keydown', delayedResize);
        this.element.batch.element.input.addEventListener('blur', this.restart.bind(this));
        this.element.batch.element.input.focus();
        this.element.batch.element.input.select();
        this.element.batch.element.evaluateButton.addEventListener('click', this.evaluate.bind(this));
        this.element.promptSet.evalPrompt = function (prompt: CommandPrompt, index?: number) {
            /* eslint-disable-next-line no-console */
            console.log(`evalPrompt(${prompt.element.input.value}, ${index})`);
            prompt.element.output.innerHTML = `evalPrompt(${prompt.element.input.value}, ${index})`;
        };
        this.evalInput = function (input: string): { statements: string[]; lines: string[] } {
            /* eslint-disable-next-line no-console */
            console.log(`evalInput(${input})`);
            return {
                statements: [],
                lines: input.split(/\r?\n/),
            };
        };
        this.element.promptSet.evalPromptRefresh = this.refreshNameList.bind(this);
        if (globalThis.EvaluatorPointer.debug) {
            const promptFoot = document.createElement('p');
            promptFoot.innerHTML = globalThis.MathJSLabCalcBuildMessage;
            this.appendChild(promptFoot);
        }
        this.resize();
        this.setLanguage();
        this.element.promptSet.promptAppend();
    }
    /**
     * Sets the unique ID of the base class (HTMLElement) of Web component.
     */
    public set superId(id: string) {
        super.id = id;
    }
    /**
     * Gets the unique ID of the base class (HTMLElement) of Web component.
     */
    public get superId(): string {
        return super.id;
    }
    /**
     * Sets the unique ID of the Web component.
     */
    public set id(id: string) {
        this.setId(id);
    }
    /**
     * Gets the unique ID of the Web component.
     */
    public get id(): string {
        return super.id;
    }
    /**
     * Sets the unique ID of the Web component.
     * @param id
     */
    public setId: (this: CommandShell, id?: string) => void = setIdFirstFactory(CommandShell).bind(this);
    /**
     * Creates an element of the Web Component type.
     * @param id Optional element id.
     * @returns The created element.
     */
    public static readonly createElement = createElementFactory(CommandShell);
    /**
     * Web component element definition handler.
     */
    public static readonly define = defineFactory(CommandShell);
    /**
     * Container (parent node) setter.
     */
    public set container(element: HTMLElement) {
        setContainerFactory().bind(this)(element);
    }
    /**
     * Container (parent node) getter.
     */
    public get container(): HTMLElement {
        return this.element.container;
    }
    /**
     * Gets true if device is touch capable, false otherwise.
     */
    public get isTouchCapable(): boolean {
        return this.element.promptSet.isTouchCapable;
    }
    /**
     * Evaluate prompt callback setter.
     * @param prompt Prompt to evaluate.
     * @param index Index of prompt to evaluate.
     */
    public set evalPrompt(evalPrompt: CommandPromptEvalHandler) {
        this.element.promptSet.evalPrompt = evalPrompt;
    }
    /**
     * Evaluate prompt callback getter.
     */
    public get evalPrompt(): CommandPromptEvalHandler {
        return this.element.promptSet.evalPrompt;
    }
    /**
     * Evaluate input callback.
     * @param input Input to evaluate.
     */
    public evalInput: EvalInputHandler;
    /**
     * Defined names list (variables panel content).
     */
    public nameList: HTMLUListElement;
    /**
     * Change strings depending on the language.
     * @param lang Language.
     */
    public setLanguage(lang?: string) {
        if (lang) {
            globalThis.lang = lang;
        } else {
            globalThis.lang = navigator.language.replace(/\-.+/, '');
        }
        this.element.variables.element.title.innerHTML = {
            en: 'Variables',
            es: 'Variables',
            pt: 'Variáveis',
        }[globalThis.lang]!;
        this.element.batch.element.evaluateButton.innerHTML = {
            en: 'Evaluate',
            es: 'Computar',
            pt: 'Computar',
        }[globalThis.lang]!;
    }
    /**
     * To be called in resize events.
     * @param _event
     */
    public resize(_event?: Event): void {
        this.element.batch.resize();
        this.element.variables.resize();
    }
    /**
     * Restart
     * @param _event
     */
    public restart(_event: Event): void {
        globalThis.EvaluatorPointer.Restart();
        /* Removes all child nodes from the this.nameList. */
        this.nameList.replaceChildren();
        this.element.promptSet.clear();
        this.element.variables.resize();
    }
    /**
     * Load text if argument is passed, else load code from batch input, separing statements, running it and creating evaluated prompts.
     */
    public load(text?: string): {
        statements: string[];
        lines: string[];
    } {
        if (text) {
            this.element.batch.element.input.value = text;
        }
        this.nameList.replaceChildren();
        /* Separates statements and lines. */
        let { statements, lines } = this.evalInput(this.element.batch.element.input.value);
        statements = this.element.promptSet.promptLoadEval(statements);
        this.refreshNameList();
        this.resize();
        return {
            statements,
            lines,
        };
    }
    /**
     * Batch execution (button click) event handler.
     * @param _event
     */
    public evaluate(_event: Event): void {
        this.element.promptSet.clear();
        this.load();
    }
    /**
     * Refresh name list in variables panel.
     */
    public refreshNameList(): void {
        /* Removes all child nodes from the this.nameList. */
        this.nameList.replaceChildren();
        for (const name in globalThis.EvaluatorPointer.nameTable) {
            if (!globalThis.EvaluatorPointer.nativeNameTableList.includes(name)) {
                const nameTableEntry = globalThis.EvaluatorPointer.nameTable[name];
                const nameListEntry = document.createElement('li');
                nameListEntry.className = 'nameitem';
                this.nameList.append(nameListEntry);
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
}
/* Defines the Web component element. */
CommandShell.define();
