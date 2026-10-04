import {
    mathJSLabWorkerProtocolVersion,
    serializeMathJSLabWorkerError,
    type MathJSLabWorkerCommand,
    type MathJSLabWorkerDocumentContext,
    type MathJSLabWorkerExecutionResult,
    type MathJSLabWorkerInboundMessage,
    type MathJSLabWorkerOutboundMessage,
    type MathJSLabWorkerRequest,
    type MathJSLabWorkerResourceResponse,
    type MathJSLabWorkerResponse,
    type MathJSLabWorkerStatementContext,
    type MathJSLabWorkerSuccess,
} from './workerProtocol';
import { cleanupAll } from '../../lifecycle';

export interface MathJSLabWorkerSession {
    parse(source: string, context: MathJSLabWorkerDocumentContext): readonly string[] | Promise<readonly string[]>;
    execute(statement: string, context: MathJSLabWorkerStatementContext): MathJSLabWorkerExecutionResult | Promise<MathJSLabWorkerExecutionResult>;
    dispose?(): void | Promise<void>;
}

export interface MathJSLabWorkerResources {
    readText(reference: string): Promise<string>;
}

export type MathJSLabWorkerRuntimeHandler = {
    createSession(context: MathJSLabWorkerDocumentContext, resources: MathJSLabWorkerResources): MathJSLabWorkerSession | Promise<MathJSLabWorkerSession>;
    toMathML(source: string, display: 'inline' | 'block', context: MathJSLabWorkerDocumentContext): string | Promise<string>;
};

export interface MathJSLabWorkerScope {
    postMessage(message: MathJSLabWorkerOutboundMessage): void;
    addEventListener(type: 'message', listener: (event: MessageEvent<MathJSLabWorkerInboundMessage>) => void): void;
    removeEventListener(type: 'message', listener: (event: MessageEvent<MathJSLabWorkerInboundMessage>) => void): void;
}

export class MathJSLabWorkerRuntime {
    private readonly sessions = new Map<string, MathJSLabWorkerSession>();
    private readonly creatingSessions = new Set<string>();
    private readonly pendingCreations = new Map<string, Promise<MathJSLabWorkerSession>>();
    private readonly sessionDisposals = new Map<string, Promise<void>>();
    private readonly cancelled = new Set<string>();
    private readonly activeRequests = new Set<string>();
    private readonly sessionOperations = new Map<string, Set<Promise<void>>>();
    private readonly resourceRequests = new Map<string, { sessionId: string; resolve: (text: string) => void; reject: (reason: unknown) => void }>();
    private nextResourceRequest = 0;
    private disposed = false;
    private disposal?: Promise<void>;

    public constructor(
        private readonly scope: MathJSLabWorkerScope,
        private readonly handler: MathJSLabWorkerRuntimeHandler,
    ) {
        scope.addEventListener('message', this.receive);
    }

    public dispose(): Promise<void> {
        if (this.disposal) return this.disposal;
        this.disposed = true;
        this.scope.removeEventListener('message', this.receive);
        this.disposal = Promise.resolve().then(async () => {
            this.rejectResources(undefined, new Error('MathJSLab Worker runtime was disposed'));
            await Promise.allSettled(Array.from(this.pendingCreations.values()));
            this.cancelled.clear();
            this.activeRequests.clear();
            await cleanupAll(Array.from(this.sessions.keys(), (sessionId) => () => this.disposeSession(sessionId, false)));
        });
        return this.disposal;
    }

    private readonly receive = (event: MessageEvent<MathJSLabWorkerInboundMessage>): void => {
        const message = event.data;
        if (this.disposed) return;
        if (!message || message.protocol !== mathJSLabWorkerProtocolVersion) return;
        if ('type' in message && message.type === 'resource-response') {
            this.receiveResource(message);
            return;
        }
        if (!('command' in message)) {
            if (this.activeRequests.has(message.requestId)) this.cancelled.add(message.requestId);
            return;
        }
        if (this.activeRequests.has(message.requestId)) return;
        this.activeRequests.add(message.requestId);
        const sessionId = 'sessionId' in message.command ? message.command.sessionId : undefined;
        const operation = this.respond(message).finally(() => {
            this.activeRequests.delete(message.requestId);
            this.cancelled.delete(message.requestId);
            if (sessionId) {
                const operations = this.sessionOperations.get(sessionId);
                operations?.delete(operation);
                if (operations?.size === 0) this.sessionOperations.delete(sessionId);
            }
        });
        if (sessionId && message.command.type !== 'dispose-session' && message.command.type !== 'create-session') {
            let operations = this.sessionOperations.get(sessionId);
            if (!operations) this.sessionOperations.set(sessionId, (operations = new Set()));
            operations.add(operation);
        }
    };

    private receiveResource(response: MathJSLabWorkerResourceResponse): void {
        const pending = this.resourceRequests.get(response.requestId);
        if (!pending) return;
        this.resourceRequests.delete(response.requestId);
        if (response.ok) pending.resolve(response.text);
        else pending.reject(Object.assign(new Error(response.error.message), { name: response.error.name, code: response.error.code }));
    }

    private resources(sessionId: string): MathJSLabWorkerResources {
        return {
            readText: (reference) => {
                const requestId = `resource-${++this.nextResourceRequest}`;
                return new Promise<string>((resolve, reject) => {
                    if (this.disposed || !this.sessions.has(sessionId)) {
                        reject(new Error(`Unknown MathJSLab resource session: ${sessionId}`));
                        return;
                    }
                    this.resourceRequests.set(requestId, { sessionId, resolve, reject });
                    this.scope.postMessage({
                        protocol: mathJSLabWorkerProtocolVersion,
                        type: 'resource-request',
                        requestId,
                        sessionId,
                        operation: 'read-text',
                        reference,
                    });
                });
            },
        };
    }

    private async respond(request: MathJSLabWorkerRequest): Promise<void> {
        let response: MathJSLabWorkerResponse;
        try {
            const result = await this.execute(request.command);
            if (this.cancelled.delete(request.requestId)) return;
            response = { protocol: mathJSLabWorkerProtocolVersion, requestId: request.requestId, ok: true, result };
        } catch (error) {
            if (this.cancelled.delete(request.requestId)) return;
            response = { protocol: mathJSLabWorkerProtocolVersion, requestId: request.requestId, ok: false, error: serializeMathJSLabWorkerError(error) };
        }
        if (!this.disposed && !this.cancelled.has(request.requestId)) this.scope.postMessage(response);
    }

    private rejectResources(sessionId: string | undefined, error: Error): void {
        for (const [requestId, pending] of this.resourceRequests) {
            if (sessionId !== undefined && pending.sessionId !== sessionId) continue;
            this.resourceRequests.delete(requestId);
            pending.reject(error);
        }
    }

    private async execute(command: MathJSLabWorkerCommand): Promise<MathJSLabWorkerSuccess> {
        if (this.disposed) throw new Error('MathJSLab Worker runtime is disposed');
        switch (command.type) {
            case 'create-session': {
                if (this.disposed) throw new Error('MathJSLab Worker runtime is disposed');
                if (this.sessions.has(command.sessionId) || this.creatingSessions.has(command.sessionId)) throw new Error(`MathJSLab session already exists: ${command.sessionId}`);
                this.creatingSessions.add(command.sessionId);
                const creation = Promise.resolve()
                    .then(() => this.handler.createSession(command.context, this.resources(command.sessionId)))
                    .then(async (session) => {
                        if (this.disposed) {
                            await session.dispose?.();
                            throw new Error('MathJSLab Worker runtime is disposed');
                        }
                        this.sessions.set(command.sessionId, session);
                        return session;
                    });
                this.pendingCreations.set(command.sessionId, creation);
                try {
                    await creation;
                } finally {
                    this.creatingSessions.delete(command.sessionId);
                    if (this.pendingCreations.get(command.sessionId) === creation) this.pendingCreations.delete(command.sessionId);
                }
                return { type: 'session-created' };
            }
            case 'parse': {
                const session = this.session(command.sessionId);
                try {
                    return { type: 'parsed', statements: await session.parse(command.source, command.context) };
                } catch (error) {
                    return { type: 'parsed', statements: [], error: serializeMathJSLabWorkerError(error) };
                }
            }
            case 'execute':
                return { type: 'executed', result: await this.session(command.sessionId).execute(command.statement, command.context) };
            case 'to-mathml':
                return { type: 'mathml', markup: await this.handler.toMathML(command.source, command.display, command.context) };
            case 'dispose-session': {
                await this.disposeSession(command.sessionId);
                return { type: 'session-disposed' };
            }
        }
    }

    private session(sessionId: string): MathJSLabWorkerSession {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error(`Unknown MathJSLab session: ${sessionId}`);
        return session;
    }

    private disposeSession(sessionId: string, waitForOperations = true): Promise<void> {
        const previous = this.sessionDisposals.get(sessionId);
        if (previous) return previous;
        const disposal = Promise.resolve()
            .then(async () => {
                this.rejectResources(sessionId, new Error(`MathJSLab session was disposed: ${sessionId}`));
                if (waitForOperations) await Promise.all(Array.from(this.sessionOperations.get(sessionId) ?? []));
                const session = this.sessions.get(sessionId);
                this.sessions.delete(sessionId);
                await session?.dispose?.();
            })
            .finally(() => {
                if (this.sessionDisposals.get(sessionId) === disposal) this.sessionDisposals.delete(sessionId);
            });
        this.sessionDisposals.set(sessionId, disposal);
        return disposal;
    }
}
