import type { BatchOutput } from './components/batch-output/batch-output.component';
import type { CommandPrompt } from './components/command-prompt/command-prompt.component';

/**
 * Visual states supported by MathJSLab command output presentations.
 */
export type CommandOutputState = 'default' | 'good' | 'bad' | 'info' | 'doc';

/**
 * Presentation-neutral destination for one evaluated command.
 */
export interface CommandOutputTarget {
    /** Element that receives formatted text and rich output nodes. */
    readonly content: HTMLDivElement;
    /** Apply the semantic state of the evaluation result. */
    setState(state: CommandOutputState): void;
    /** Replace the destination with trusted MathJSLab output markup. */
    setHTML(html: string): void;
    /** Replace the destination with plain text. */
    setText(text: string): void;
    /** Append rich output nodes or text to the destination. */
    append(...nodes: (Node | string)[]): void;
    /** Remove all rendered content from the destination. */
    clear(): void;
}

/**
 * Command output destination backed by an interactive prompt.
 */
export class PromptOutputTarget implements CommandOutputTarget {
    public constructor(private readonly prompt: CommandPrompt) {}

    public get content(): HTMLDivElement {
        return this.prompt.element.output;
    }

    public setState(state: CommandOutputState): void {
        this.prompt.element.frameBox.className = state === 'default' ? 'green-panel' : `green-panel ${state}`;
    }

    public setHTML(html: string): void {
        this.content.innerHTML = html;
    }

    public setText(text: string): void {
        this.content.textContent = text;
    }

    public append(...nodes: (Node | string)[]): void {
        this.content.append(...nodes);
    }

    public clear(): void {
        this.content.replaceChildren();
    }
}

/**
 * Command output destination backed by one entry in a batch output panel.
 */
export class BatchOutputTarget implements CommandOutputTarget {
    public readonly content: HTMLDivElement;

    public constructor(output: BatchOutput, command: string) {
        this.content = output.appendItem({ command });
    }

    public setState(state: CommandOutputState): void {
        this.content.dataset.state = state;
        this.content.classList.toggle('error', state === 'bad');
    }

    public setHTML(html: string): void {
        this.content.innerHTML = html;
    }

    public setText(text: string): void {
        this.content.textContent = text;
    }

    public append(...nodes: (Node | string)[]): void {
        this.content.append(...nodes);
    }

    public clear(): void {
        this.content.replaceChildren();
    }
}
