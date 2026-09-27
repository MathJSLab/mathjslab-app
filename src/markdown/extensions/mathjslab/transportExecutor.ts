import type { MarkdownDocumentContext } from '../../../MarkdownEngine';
import type { MathJSLabExecutionSession, MathJSLabExecutor, MathJSLabNodeOutput, MathJSLabOutput } from './executor';
import { deserializeMathJSLabWorkerError, snapshotMathJSLabContext, type MathJSLabWorkerCommand, type MathJSLabWorkerOutput, type MathJSLabWorkerSuccess } from './workerProtocol';

export type MathJSLabTransportRequestOptions = { readonly signal?: AbortSignal; readonly timeoutMs?: number };

/**
 * Transport-independent request channel. The Worker implementation added in
 * 14.2 will own request IDs, postMessage correlation and cancellation frames.
 */
export interface MathJSLabWorkerTransport {
    readonly generation?: number;
    request(command: MathJSLabWorkerCommand, options?: MathJSLabTransportRequestOptions): Promise<MathJSLabWorkerSuccess>;
    setSessionContext?(sessionId: string, context: MarkdownDocumentContext): void;
    deleteSessionContext?(sessionId: string): void;
    dispose?(): void | Promise<void>;
}

export type MathJSLabTransportExecutorOptions = {
    readonly transport: MathJSLabWorkerTransport;
    /** Marked renderers are synchronous, so inline conversion remains local. */
    readonly toMathML: MathJSLabExecutor['toMathML'];
    readonly createSessionId?: () => string;
    readonly timeoutMs?: number;
    readonly materializeOutput?: (output: Extract<MathJSLabWorkerOutput, { type: 'visualization' }>) => MathJSLabNodeOutput | Promise<MathJSLabNodeOutput>;
};

let executorSequence = 0;

const expectResponse = <T extends MathJSLabWorkerSuccess['type']>(result: MathJSLabWorkerSuccess, type: T): Extract<MathJSLabWorkerSuccess, { type: T }> => {
    if (result.type !== type) throw new Error(`MathJSLab transport returned ${result.type}; expected ${type}`);
    return result as Extract<MathJSLabWorkerSuccess, { type: T }>;
};

const requestOptions = (context: MarkdownDocumentContext, fallbackTimeoutMs: number | undefined): MathJSLabTransportRequestOptions | undefined => {
    const timeoutMs = context.executionPolicy?.mathjslab?.timeoutMs ?? fallbackTimeoutMs;
    const validTimeout = Number.isFinite(timeoutMs) && timeoutMs! > 0 ? timeoutMs : undefined;
    if (!context.signal && validTimeout === undefined) return undefined;
    return { ...(context.signal ? { signal: context.signal } : {}), ...(validTimeout !== undefined ? { timeoutMs: validTimeout } : {}) };
};

const materializeOutputs = async (outputs: readonly MathJSLabWorkerOutput[], materialize: MathJSLabTransportExecutorOptions['materializeOutput']): Promise<readonly MathJSLabOutput[]> => {
    return Promise.all(
        outputs.map(async (output): Promise<MathJSLabOutput> => {
            if (output.type !== 'visualization') return output;
            if (!materialize) throw new Error(`No main-thread renderer is registered for MathJSLab visualization: ${output.renderer}`);
            return materialize(output);
        }),
    );
};

/** Creates a regular MathJSLabExecutor backed by an asynchronous transport. */
export const createTransportMathJSLabExecutor = (options: MathJSLabTransportExecutorOptions): MathJSLabExecutor => {
    const executorId = ++executorSequence;
    let nextSession = 0;
    const createSessionId = options.createSessionId ?? (() => `mathjslab-${executorId}-${++nextSession}`);

    return {
        toMathML: options.toMathML,
        dispose: () => options.transport.dispose?.(),
        async createSession(context: MarkdownDocumentContext): Promise<MathJSLabExecutionSession> {
            const sessionId = createSessionId();
            let disposed = false;
            let remoteGeneration = -1;
            let creating: Promise<void> | undefined;
            const ensureSession = async (activeContext: MarkdownDocumentContext): Promise<void> => {
                if (disposed) throw new Error('MathJSLab execution session is disposed');
                options.transport.setSessionContext?.(sessionId, activeContext);
                const generation = options.transport.generation ?? 0;
                if (remoteGeneration === generation) return;
                if (creating) return creating;
                creating = (async () => {
                    expectResponse(
                        await options.transport.request(
                            { type: 'create-session', sessionId, context: snapshotMathJSLabContext(activeContext) },
                            requestOptions(activeContext, options.timeoutMs),
                        ),
                        'session-created',
                    );
                    remoteGeneration = options.transport.generation ?? generation;
                })();
                try {
                    await creating;
                } finally {
                    creating = undefined;
                }
            };
            try {
                await ensureSession(context);
            } catch (error) {
                options.transport.deleteSessionContext?.(sessionId);
                throw error;
            }
            return {
                async parse(source, parseContext) {
                    await ensureSession(parseContext);
                    const response = expectResponse(
                        await options.transport.request(
                            { type: 'parse', sessionId, source, context: snapshotMathJSLabContext(parseContext) },
                            requestOptions(parseContext, options.timeoutMs),
                        ),
                        'parsed',
                    );
                    return {
                        statements: response.statements,
                        ...(response.error ? { error: deserializeMathJSLabWorkerError(response.error) } : {}),
                    };
                },
                async execute(statement, statementContext) {
                    await ensureSession(statementContext);
                    const response = expectResponse(
                        await options.transport.request(
                            {
                                type: 'execute',
                                sessionId,
                                statement,
                                context: {
                                    ...snapshotMathJSLabContext(statementContext),
                                    blockIndex: statementContext.blockIndex,
                                    statementIndex: statementContext.statementIndex,
                                },
                            },
                            requestOptions(statementContext, options.timeoutMs),
                        ),
                        'executed',
                    );
                    const { outputs, error, ...result } = response.result;
                    return {
                        ...result,
                        ...(outputs ? { outputs: await materializeOutputs(outputs, options.materializeOutput) } : {}),
                        ...(error ? { error: deserializeMathJSLabWorkerError(error) } : {}),
                    };
                },
                async dispose() {
                    if (disposed) return;
                    disposed = true;
                    try {
                        if (remoteGeneration === (options.transport.generation ?? 0)) {
                            expectResponse(await options.transport.request({ type: 'dispose-session', sessionId }), 'session-disposed');
                        }
                    } finally {
                        options.transport.deleteSessionContext?.(sessionId);
                    }
                },
            };
        },
    };
};
