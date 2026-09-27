import type { MarkdownDocumentContext, MarkdownExecutionPolicies, MarkdownResourcePolicy, MarkdownSecurityMode } from '../../../MarkdownEngine';
import type { MathJSLabExecutionStatus, MathJSLabOutputState } from './executor';
import type { PlotOutputRequest } from '../../../PlotOutputCapture';

export const mathJSLabWorkerProtocolVersion = 1 as const;

export type MathJSLabWorkerRequestId = string;
export type MathJSLabWorkerSessionId = string;

/** Cloneable subset of MarkdownDocumentContext sent across the Worker boundary. */
export type MathJSLabWorkerDocumentContext = {
    readonly sourceUrl?: string;
    readonly theme?: 'light' | 'dark';
    readonly locale?: string;
    readonly width?: number;
    readonly height?: number;
    readonly enableAudio?: boolean;
    readonly renderMode?: 'eager' | 'visible';
    readonly securityMode?: MarkdownSecurityMode;
    readonly executionPolicy?: MarkdownExecutionPolicies;
    readonly resourcePolicy?: MarkdownResourcePolicy;
    readonly maxSourceBytes?: number;
    readonly maxResourceBytes?: number;
};

export type MathJSLabWorkerStatementContext = MathJSLabWorkerDocumentContext & {
    readonly blockIndex: number;
    readonly statementIndex: number;
};

export type MathJSLabWorkerError = {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
    readonly code?: string;
};

export type MathJSLabWorkerOutput =
    | { readonly type: 'text'; readonly text: string }
    | { readonly type: 'mathml'; readonly markup: string }
    | { readonly type: 'html'; readonly markup: string; readonly trusted: boolean }
    | { readonly type: 'visualization'; readonly renderer: 'plotly'; readonly request: PlotOutputRequest; readonly role: 'visualization' };

export type MathJSLabWorkerExecutionResult = {
    readonly status: MathJSLabExecutionStatus;
    readonly state?: MathJSLabOutputState;
    readonly outputs?: readonly MathJSLabWorkerOutput[];
    readonly value?: unknown;
    readonly error?: MathJSLabWorkerError;
};

export type MathJSLabWorkerCommand =
    | { readonly type: 'create-session'; readonly sessionId: MathJSLabWorkerSessionId; readonly context: MathJSLabWorkerDocumentContext }
    | { readonly type: 'parse'; readonly sessionId: MathJSLabWorkerSessionId; readonly source: string; readonly context: MathJSLabWorkerDocumentContext }
    | {
          readonly type: 'execute';
          readonly sessionId: MathJSLabWorkerSessionId;
          readonly statement: string;
          readonly context: MathJSLabWorkerStatementContext;
      }
    | { readonly type: 'to-mathml'; readonly source: string; readonly display: 'inline' | 'block'; readonly context: MathJSLabWorkerDocumentContext }
    | { readonly type: 'dispose-session'; readonly sessionId: MathJSLabWorkerSessionId };

export type MathJSLabWorkerRequest = {
    readonly protocol: typeof mathJSLabWorkerProtocolVersion;
    readonly requestId: MathJSLabWorkerRequestId;
    readonly command: MathJSLabWorkerCommand;
};

export type MathJSLabWorkerSuccess =
    | { readonly type: 'session-created' }
    | { readonly type: 'parsed'; readonly statements: readonly string[]; readonly error?: MathJSLabWorkerError }
    | { readonly type: 'executed'; readonly result: MathJSLabWorkerExecutionResult }
    | { readonly type: 'mathml'; readonly markup: string }
    | { readonly type: 'session-disposed' };

export type MathJSLabWorkerResponse =
    | {
          readonly protocol: typeof mathJSLabWorkerProtocolVersion;
          readonly requestId: MathJSLabWorkerRequestId;
          readonly ok: true;
          readonly result: MathJSLabWorkerSuccess;
      }
    | {
          readonly protocol: typeof mathJSLabWorkerProtocolVersion;
          readonly requestId: MathJSLabWorkerRequestId;
          readonly ok: false;
          readonly error: MathJSLabWorkerError;
      };

/** One-way cancellation; a real Worker transport may terminate the session if the command cannot cooperate. */
export type MathJSLabWorkerCancel = {
    readonly protocol: typeof mathJSLabWorkerProtocolVersion;
    readonly type: 'cancel';
    readonly requestId: MathJSLabWorkerRequestId;
    readonly reason?: string;
};

export type MathJSLabWorkerMessage = MathJSLabWorkerRequest | MathJSLabWorkerResponse | MathJSLabWorkerCancel | MathJSLabWorkerResourceRequest | MathJSLabWorkerResourceResponse;

export type MathJSLabWorkerResourceRequest = {
    readonly protocol: typeof mathJSLabWorkerProtocolVersion;
    readonly type: 'resource-request';
    readonly requestId: MathJSLabWorkerRequestId;
    readonly sessionId: MathJSLabWorkerSessionId;
    readonly operation: 'read-text';
    readonly reference: string;
};

export type MathJSLabWorkerResourceResponse =
    | {
          readonly protocol: typeof mathJSLabWorkerProtocolVersion;
          readonly type: 'resource-response';
          readonly requestId: MathJSLabWorkerRequestId;
          readonly ok: true;
          readonly text: string;
      }
    | {
          readonly protocol: typeof mathJSLabWorkerProtocolVersion;
          readonly type: 'resource-response';
          readonly requestId: MathJSLabWorkerRequestId;
          readonly ok: false;
          readonly error: MathJSLabWorkerError;
      };

export type MathJSLabWorkerInboundMessage = MathJSLabWorkerRequest | MathJSLabWorkerCancel | MathJSLabWorkerResourceResponse;
export type MathJSLabWorkerOutboundMessage = MathJSLabWorkerResponse | MathJSLabWorkerResourceRequest;

export const snapshotMathJSLabContext = (context: MarkdownDocumentContext): MathJSLabWorkerDocumentContext => ({
    ...(context.sourceUrl ? { sourceUrl: context.sourceUrl.href } : {}),
    ...(context.theme ? { theme: context.theme } : {}),
    ...(context.locale ? { locale: context.locale } : {}),
    ...(context.width !== undefined ? { width: context.width } : {}),
    ...(context.height !== undefined ? { height: context.height } : {}),
    ...(context.enableAudio !== undefined ? { enableAudio: context.enableAudio } : {}),
    ...(context.renderMode ? { renderMode: context.renderMode } : {}),
    ...(context.securityMode ? { securityMode: context.securityMode } : {}),
    ...(context.executionPolicy ? { executionPolicy: context.executionPolicy } : {}),
    ...(context.resourcePolicy ? { resourcePolicy: context.resourcePolicy } : {}),
    ...(context.maxSourceBytes !== undefined ? { maxSourceBytes: context.maxSourceBytes } : {}),
    ...(context.maxResourceBytes !== undefined ? { maxResourceBytes: context.maxResourceBytes } : {}),
});

export const serializeMathJSLabWorkerError = (reason: unknown): MathJSLabWorkerError => {
    if (reason instanceof Error) {
        const withCode = reason as Error & { code?: unknown };
        return {
            name: reason.name,
            message: reason.message,
            ...(reason.stack ? { stack: reason.stack } : {}),
            ...(typeof withCode.code === 'string' ? { code: withCode.code } : {}),
        };
    }
    return { name: 'Error', message: String(reason) };
};

export const deserializeMathJSLabWorkerError = (serialized: MathJSLabWorkerError): Error => {
    const error = new Error(serialized.message);
    error.name = serialized.name;
    if (serialized.stack) error.stack = serialized.stack;
    if (serialized.code) (error as Error & { code?: string }).code = serialized.code;
    return error;
};
