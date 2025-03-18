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
import styles from './command-prompt-set.styles.scss';
/* CommandPrompt Web component. */
import { CommandPrompt } from '../command-prompt/command-prompt.component';
/* Set of Web component elements. */
export interface CommandPromptSetElementEntry {
    /* Wrapper */
    wrapper: HTMLDivElement;
    /* Command Prompt array */
    prompt: CommandPrompt[];
}
/* Set of Web component elements. */
export type CommandPromptSetElement = WebComponentElement<CommandPromptSetElementEntry>;
/* Set of Web component element entry keys. */
export const CommandPromptSetElementEntryKey: (keyof CommandPromptSetElementEntry)[] = ['wrapper'] as const;
/**
 * Command prompt evaluator handler.
 */
export type CommandPromptEvalHandler<T = void> = (prompt: CommandPrompt, index?: number) => T;
/**
 * # CommandPromptSet Web Component
 */
export class CommandPromptSet extends HTMLElement {
    /* Web Component base id slug. */
    public static readonly tagName = 'command-prompt-set';
    /* Web component HTML elements. */
    public readonly element = { prompt: [] as CommandPrompt[] } as CommandPromptSetElement;
    /* Web component template HTML element field names. */
    public static readonly elementFields: (keyof CommandPromptSetElementEntry)[] = CommandPromptSetElementEntryKey;
    /* Web component template HTML element id postfix. */
    public static readonly elementPostfix = keyToPostfix(CommandPromptSetElementEntryKey);
    /* Web component null value */
    public static readonly null = null as unknown as CommandPromptSet;
    /* Web component undefined value */
    public static readonly undefined = undefined as unknown as CommandPromptSet;
    /* Web Component constructor. */
    public constructor() {
        super();
        constructorFactory(CommandPromptSet, styles).bind(this)();
        this.promptIndex = -1;
        this.promptAppend();
    }
    /**
     * Sets the unique ID of the base class of Web component.
     */
    public set superId(id: string) {
        super.id = id;
    }
    /**
     * Gets the unique ID of the base class of Web component.
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
    public setId: (this: CommandPromptSet, id?: string) => void = setIdFirstFactory(CommandPromptSet).bind(this);
    /**
     * Creates an element of the Web Component type.
     * @param id Optional element id.
     * @returns The created element.
     */
    public static readonly createElement = createElementFactory(CommandPromptSet);
    /**
     * Web component element definition handler.
     */
    public static readonly define = defineFactory(CommandPromptSet);
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
     * Current prompt index.
     */
    public promptIndex: number;
    /**
     * Previous prompt getter.
     */
    public get previousPrompt(): CommandPrompt {
        return this.element.prompt[this.promptIndex - 1];
    }
    /**
     * Current prompt getter.
     */
    public get currentPrompt(): CommandPrompt {
        return this.element.prompt[this.promptIndex];
    }
    /**
     * Next prompt getter.
     */
    public get nextPrompt(): CommandPrompt {
        return this.element.prompt[this.promptIndex + 1];
    }
    /**
     * Get all prompt input value as a string[].
     */
    public get statements(): string[] {
        return this.element.prompt.map((prompt) => prompt.element.input.value);
    }
    /**
     * Evaluate prompt callback.
     * @param prompt Prompt to evaluate.
     * @param index Index of prompt to evaluate.
     */
    public evalPrompt: CommandPromptEvalHandler = (prompt: CommandPrompt, index?: number) => {
        index = typeof index === 'number' && index >= 0 ? index : this.element.prompt.map((p) => p.id).indexOf(prompt.id);
        /* eslint-disable-next-line no-console */
        console.log(
            `evalPrompt:\nprompt index = ${index};\nprompt id = '${prompt.id}'\nprompt value = '${this.element.prompt[index].element.input.value}'`,
        );
    };
    /**
     * Evaluate refresh prompt callback.
     * @param prompt Prompt to refresh.
     * @param index Index of prompt to refresh.
     */
    public evalPromptRefresh = (prompt?: CommandPrompt, index?: number) => {
        if (prompt && index) {
            index = typeof index === 'number' && index >= 0 ? index : this.element.prompt.map((p) => p.id).indexOf(prompt.id);
            /* eslint-disable-next-line no-console */
            console.log(
                `evalPromptRefresh:\nprompt index = ${index};\nprompt id = '${prompt.id}'\nprompt value = '${this.element.prompt[index].element.input.value}'`,
            );
        } else {
            /* eslint-disable-next-line no-console */
            console.log(
                `evalPromptRefresh: invalid arguments: ${typeof prompt === 'undefined' ? 'prompt' : ''}${typeof index === 'undefined' ? 'index' : ''} undefined.`,
            );
        }
    };
    /**
     * Clears all prompts.
     */
    public clear(): void {
        this.promptIndex = -1;
        this.element.prompt = [];
        this.element.wrapper.replaceChildren();
    }
    /**
     * Command prompt 'focus' event handler. Makes this.promptIndex hold the
     * index value of the focused prompt.
     * @param event
     */
    public promptFocus(event: Event): void {
        this.promptIndex = this.element.prompt.map((p) => p.id).indexOf((event.target as HTMLElement).id.substring(0, 36));
    }
    /**
     * Creates a CommandPrompt instance.
     * @param text Text on prompt input.
     * @returns An object containing the new prompt and his resize handler.
     */
    public promptCreate(text?: string | null): {
        newPrompt: CommandPrompt;
        resize: (_event?: Event) => void;
    } {
        const uid = globalThis.crypto.randomUUID();
        const newPrompt = CommandPrompt.createElement(uid);
        newPrompt.container = this.element.wrapper;
        newPrompt.element.input.value = text ?? '';
        newPrompt.element.input.addEventListener('focus', this.promptFocus.bind(this));
        newPrompt.element.input.addEventListener('keydown', this.promptKeydown.bind(this));
        newPrompt.element.input.addEventListener('change', newPrompt.resize);
        newPrompt.onClickFrameBox = (_event?: Event): void => {
            newPrompt.element.input.focus();
        };
        return {
            newPrompt,
            resize: newPrompt.resize,
        };
    }
    /**
     * Append prompt with optional text (without evaluation).
     * @param text Text on prompt appended.
     * @returns An object containing the new prompt and his resize handler.
     */
    public promptAppend(text?: string | null): {
        newPrompt: CommandPrompt;
        resize: (_event?: Event) => void;
    } {
        const { newPrompt, resize } = this.promptCreate(text);
        resize();
        this.element.prompt.push(newPrompt);
        return {
            newPrompt,
            resize,
        };
    }
    /**
     * Append prompt with optional text, then evaluate the prompt.
     * @param text
     */
    public promptAdd(text?: string | null): void {
        this.promptIndex++;
        const { newPrompt } = this.promptAppend(text);
        this.evalPrompt(newPrompt, this.promptIndex - 1);
    }
    /**
     *
     * @param statements
     * @returns
     */
    public promptLoadEval(statements: string[]): string[] {
        this.clear();
        /* Append empty statement if last statement is not an empty string (to create an empty prompt at the end). */
        if (statements.length === 0) {
            statements = [''];
        } else if (statements[statements.length - 1].trim() !== '') {
            statements.push('');
        }
        for (let i = 0; i < statements.length; i++) {
            this.promptAdd(statements[i]);
        }
        this.element.prompt[0].element.input.focus();
        return statements;
    }
    /**
     * Command prompt 'keydown' event handler.
     * @param event
     */
    public promptKeydown(event: KeyboardEvent): void {
        if (!event.ctrlKey && !event.altKey && !event.metaKey) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (this.currentPrompt.element.input.selectionStart === 0) {
                    /* Creates previous prompt if enter is pressed with cursor at 0. */
                    const { newPrompt, resize } = this.promptCreate();
                    this.evalPromptRefresh(newPrompt, this.promptIndex);
                    this.element.prompt.splice(this.promptIndex, 0, newPrompt);
                    this.promptIndex++;
                    this.element.wrapper.insertBefore(newPrompt, this.currentPrompt);
                    resize();
                } else {
                    let currentPromptIndex = this.promptIndex;
                    let newPrompt: CommandPrompt = CommandPrompt.undefined;
                    if (this.promptIndex + 1 === this.element.prompt.length) {
                        /* Append to end. */
                        ({ newPrompt } = this.promptAppend());
                        this.promptIndex++;
                    }
                    const prompt = this.element.prompt[currentPromptIndex];
                    this.evalPrompt(prompt, currentPromptIndex);
                    /* Go to the next prompt. */
                    if (!newPrompt) {
                        newPrompt = this.element.prompt[currentPromptIndex + 1];
                    }
                    newPrompt.element.input.focus();
                    newPrompt.element.input.selectionStart = prompt.element.input.value.length;
                    this.evalPromptRefresh(prompt, currentPromptIndex);
                }
            } else if (event.key === 'Backspace' && this.currentPrompt.element.input.selectionStart === 0) {
                /* Deletes the prompt if the input value is empty and the backspace key is pressed with the cursor in column 0. */
                const deletePrompt = (index: number): void => {
                    this.element.prompt[index].element.wrapper.remove();
                    this.element.prompt.splice(index, 1);
                    this.promptIndex--;
                    event.preventDefault();
                };
                if (this.promptIndex !== 0 && this.previousPrompt.element.input.value.trim() === '') {
                    /* Deletes previous prompt. */
                    deletePrompt(this.promptIndex - 1);
                } else if (this.element.prompt.length > 1 && this.currentPrompt.element.input.value.trim() === '') {
                    /* Deletes current prompt. */
                    deletePrompt(this.promptIndex);
                    this.currentPrompt.element.input.focus();
                }
            } else if (event.key === 'ArrowUp') {
                const input = this.currentPrompt.element.input;
                /* Tests if it is not the first prompt and if it is on the first line of the current prompt. */
                if (this.promptIndex > 0 && input.selectionStart <= input.value.split(/\r?\n/)[0].length) {
                    this.previousPrompt.element.input.focus();
                    event.preventDefault();
                }
            } else if (event.key === 'ArrowDown') {
                const input = this.currentPrompt.element.input;
                /* Tests if it is not the last prompt and if it is on the last line of the current prompt. */
                if (
                    this.promptIndex + 1 < this.element.prompt.length &&
                    input.selectionStart >= input.value.split(/\r?\n/).slice(0, -1).join('\n').length
                ) {
                    this.nextPrompt.element.input.focus();
                    event.preventDefault();
                }
            }
        }
    }
}
/* Defines the Web component element. */
CommandPromptSet.define();
