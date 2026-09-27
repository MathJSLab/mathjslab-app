import {
    mathJSLabWorkerProtocolVersion,
    serializeMathJSLabWorkerError,
    type MathJSLabWorkerCancel,
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
    private readonly cancelled = new Set<string>();
    private readonly resourceRequests = new Map<string, { resolve: (text: string) => void; reject: (reason: unknown) => void }>();
    private nextResourceRequest = 0;

    public constructor(
        private readonly scope: MathJSLabWorkerScope,
        private readonly handler: MathJSLabWorkerRuntimeHandler,
    ) {
        scope.addEventListener('message', this.receive);
    }

    public async dispose(): Promise<void> {
        this.scope.removeEventListener('message', this.receive);
        await Promise.all(Array.from(this.sessions.values(), (session) => session.dispose?.()));
        this.sessions.clear();
        this.cancelled.clear();
        for (const pending of this.resourceRequests.values()) pending.reject(new Error('MathJSLab Worker runtime was disposed'));
        this.resourceRequests.clear();
    }

    private readonly receive = (event: MessageEvent<MathJSLabWorkerInboundMessage>): void => {
        const message = event.data;
        if (!message || message.protocol !== mathJSLabWorkerProtocolVersion) return;
        if ('type' in message && message.type === 'resource-response') {
            this.receiveResource(message);
            return;
        }
        if (!('command' in message)) {
            this.cancelled.add(message.requestId);
            return;
        }
        void this.respond(message);
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
                    this.resourceRequests.set(requestId, { resolve, reject });
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
        this.scope.postMessage(response);
    }

    private async execute(command: MathJSLabWorkerCommand): Promise<MathJSLabWorkerSuccess> {
        switch (command.type) {
            case 'create-session': {
                if (this.sessions.has(command.sessionId)) throw new Error(`MathJSLab session already exists: ${command.sessionId}`);
                this.sessions.set(command.sessionId, await this.handler.createSession(command.context, this.resources(command.sessionId)));
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
                const session = this.sessions.get(command.sessionId);
                this.sessions.delete(command.sessionId);
                await session?.dispose?.();
                return { type: 'session-disposed' };
            }
        }
    }

    private session(sessionId: string): MathJSLabWorkerSession {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error(`Unknown MathJSLab session: ${sessionId}`);
        return session;
    }
}
