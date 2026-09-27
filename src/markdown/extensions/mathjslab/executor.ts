import type { MarkdownDocumentContext } from '../../../MarkdownEngine';

export type MathJSLabOutputState = 'default' | 'good' | 'bad' | 'info' | 'doc';

export type MathJSLabTextOutput = { readonly type: 'text'; readonly text: string };
export type MathJSLabMathMLOutput = { readonly type: 'mathml'; readonly markup: string };
export type MathJSLabHTMLOutput = { readonly type: 'html'; readonly markup: string; readonly trusted: boolean };
export type MathJSLabNodeOutput = {
    readonly type: 'node';
    readonly node: Node;
    readonly role?: 'visualization' | 'debug' | 'generic';
    readonly mount?: (node: Node) => void | Promise<void>;
    readonly resize?: (node: Node) => void | Promise<void>;
    readonly dispose?: () => void | Promise<void>;
};
export type MathJSLabOutput = MathJSLabTextOutput | MathJSLabMathMLOutput | MathJSLabHTMLOutput | MathJSLabNodeOutput;

export type MathJSLabParseResult = {
    readonly statements: readonly string[];
    readonly error?: unknown;
};

export type MathJSLabExecutionStatus = 'success' | 'error' | 'cancelled';

export type MathJSLabExecutionResult = {
    readonly status: MathJSLabExecutionStatus;
    readonly state?: MathJSLabOutputState;
    readonly outputs?: readonly MathJSLabOutput[];
    readonly value?: unknown;
    readonly error?: unknown;
};

export type MathJSLabStatementContext = MarkdownDocumentContext & {
    readonly blockIndex: number;
    readonly statementIndex: number;
};

export interface MathJSLabExecutionSession {
    parse(source: string, context: MarkdownDocumentContext): MathJSLabParseResult | Promise<MathJSLabParseResult>;
    execute(statement: string, context: MathJSLabStatementContext): MathJSLabExecutionResult | Promise<MathJSLabExecutionResult>;
    dispose?(): void | Promise<void>;
}

export interface MathJSLabExecutor {
    toMathML(source: string, display: 'inline' | 'block'): string;
    createSession(context: MarkdownDocumentContext): MathJSLabExecutionSession | Promise<MathJSLabExecutionSession>;
    dispose?(): void | Promise<void>;
}
