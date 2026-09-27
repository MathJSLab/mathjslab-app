import type { CommandOutputState, CommandOutputTarget } from '../../../CommandOutputTarget';
import type { MathJSLabExecutionResult, MathJSLabExecutionSession, MathJSLabOutput } from './executor';

class StructuredOutputTarget implements CommandOutputTarget {
    public readonly content = document.createElement('div');
    private state: CommandOutputState = 'default';
    private outputs: MathJSLabOutput[] = [];

    public setState(state: CommandOutputState): void {
        this.state = state;
    }

    public setHTML(markup: string): void {
        this.outputs = [this.state === 'bad' ? { type: 'html', markup, trusted: true } : { type: 'mathml', markup }];
    }

    public setText(text: string): void {
        this.outputs = [{ type: 'text', text }];
    }

    public append(...nodes: (Node | string)[]): void {
        this.outputs.push(
            ...nodes.map((node): MathJSLabOutput => {
                if (typeof node === 'string') return { type: 'text', text: node };
                const role = node instanceof HTMLElement && node.classList.contains('plot-output') ? 'visualization' : 'generic';
                return { type: 'node', node, role };
            }),
        );
    }

    public clear(): void {
        this.outputs = [];
    }

    public renderRichOutput(
        type: string,
        render: (container: HTMLDivElement) => void | Promise<void>,
        dispose?: (container: HTMLDivElement) => void | Promise<void>,
        resize?: (container: HTMLDivElement) => void | Promise<void>,
    ): void {
        const node = document.createElement('div');
        node.className = 'plot-output';
        node.dataset.outputType = type;
        this.outputs.push({
            type: 'node',
            node,
            role: 'visualization',
            mount: () => render(node),
            ...(resize ? { resize: () => resize(node) } : {}),
            ...(dispose ? { dispose: () => dispose(node) } : {}),
        });
    }

    public result(success: boolean): MathJSLabExecutionResult {
        return { status: success ? 'success' : 'error', state: this.state, outputs: this.outputs };
    }
}

/** Creates the application-backed execution session without loading MathJSLab eagerly. */
export const createApplicationMathJSLabSession = async (): Promise<MathJSLabExecutionSession> => {
    const [{ InterpreterConfiguration }, { evalInputWithInterpreter }, { evalCommandWithInterpreter }, { Interpreter }] = await Promise.all([
        import('../../../InterpreterConfiguration'),
        import('../../../evalInput'),
        import('../../../evalPrompt'),
        import('mathjslab'),
    ]);
    const interpreter = Interpreter.Create(InterpreterConfiguration);
    return {
        parse: (source) => evalInputWithInterpreter(interpreter, source, false),
        execute: (statement) => {
            const target = new StructuredOutputTarget();
            return target.result(evalCommandWithInterpreter(interpreter, statement, target));
        },
        dispose: () => interpreter.Clear('all'),
    };
};
