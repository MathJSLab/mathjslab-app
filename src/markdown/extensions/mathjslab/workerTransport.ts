import type { MarkdownDocumentContext } from '../../../MarkdownEngine';
import type { MathJSLabWorkerTransport, MathJSLabTransportRequestOptions } from './transportExecutor';
import {
    deserializeMathJSLabWorkerError,
    mathJSLabWorkerProtocolVersion,
    serializeMathJSLabWorkerError,
    type MathJSLabWorkerCommand,
    type MathJSLabWorkerRequest,
    type MathJSLabWorkerInboundMessage,
    type MathJSLabWorkerOutboundMessage,
    type MathJSLabWorkerResourceRequest,
    type MathJSLabWorkerResourceResponse,
    type MathJSLabWorkerResponse,
    type MathJSLabWorkerSuccess,
} from './workerProtocol';

export interface MathJSLabWorkerEndpoint {
    postMessage(message: MathJSLabWorkerInboundMessage): void;
    addEventListener(type: 'message', listener: (event: MessageEvent<MathJSLabWorkerOutboundMessage>) => void): void;
    addEventListener(type: 'error' | 'messageerror', listener: (event: Event) => void): void;
    removeEventListener(type: 'message', listener: (event: MessageEvent<MathJSLabWorkerOutboundMessage>) => void): void;
    removeEventListener(type: 'error' | 'messageerror', listener: (event: Event) => void): void;
    terminate(): void;
}

export type MathJSLabWorkerFactory = () => MathJSLabWorkerEndpoint;
export type MathJSLabWorkerResourceReader = (reference: string, context: MarkdownDocumentContext) => Promise<string>;
export type MathJSLabWorkerTransportOptions = { readonly readResourceText?: MathJSLabWorkerResourceReader };

type PendingRequest = {
    resolve: (result: MathJSLabWorkerSuccess) => void;
    reject: (reason: unknown) => void;
    cleanup: () => void;
};

type PendingResource = {
    readonly controller: AbortController;
    readonly sessionId: string;
    readonly generation: number;
    readonly removeAbortListener: () => void;
};

const codedError = (name: string, message: string, code: string): Error & { code: string } => Object.assign(new Error(message), { name, code });
const abortError = (signal: AbortSignal): Error => codedError('AbortError', typeof signal.reason === 'string' ? signal.reason : 'The operation was aborted', 'MATHJSLAB_ABORTED');
const timeoutError = (timeoutMs: number): Error => codedError('TimeoutError', `MathJSLab execution exceeded ${timeoutMs} ms`, 'MATHJSLAB_TIMEOUT');
const restartedError = (): Error => codedError('WorkerRestartedError', 'MathJSLab Worker restarted while the operation was pending', 'MATHJSLAB_WORKER_RESTARTED');

export class WorkerMathJSLabTransport implements MathJSLabWorkerTransport {
    private readonly pending = new Map<string, PendingRequest>();
    private readonly sessionContexts = new Map<string, MarkdownDocumentContext>();
    private readonly resourceOperations = new Map<string, PendingResource>();
    private readonly factory: MathJSLabWorkerFactory | undefined;
    private worker: MathJSLabWorkerEndpoint;
    private nextRequest = 0;
    private disposed = false;
    public generation = 0;

    public constructor(
        workerOrFactory: MathJSLabWorkerEndpoint | MathJSLabWorkerFactory,
        private readonly options: MathJSLabWorkerTransportOptions = {},
    ) {
        if (typeof workerOrFactory === 'function') {
            this.factory = workerOrFactory;
            this.worker = workerOrFactory();
        } else {
            this.factory = undefined;
            this.worker = workerOrFactory;
        }
        this.attach();
    }

    public request(command: MathJSLabWorkerCommand, options: MathJSLabTransportRequestOptions = {}): Promise<MathJSLabWorkerSuccess> {
        if (this.disposed) return Promise.reject(new Error('MathJSLab Worker transport is disposed'));
        if (options.signal?.aborted) return Promise.reject(abortError(options.signal));
        const requestId = `request-${++this.nextRequest}`;
        return new Promise((resolve, reject) => {
            let timeout: ReturnType<typeof setTimeout> | undefined;
            const interrupt = (error: Error): void => this.restart(requestId, error);
            const abort = (): void => interrupt(abortError(options.signal!));
            const cleanup = (): void => {
                if (timeout !== undefined) clearTimeout(timeout);
                options.signal?.removeEventListener('abort', abort);
            };
            this.pending.set(requestId, { resolve, reject, cleanup });
            options.signal?.addEventListener('abort', abort, { once: true });
            if (options.timeoutMs !== undefined) timeout = setTimeout(() => interrupt(timeoutError(options.timeoutMs!)), options.timeoutMs);
            const request: MathJSLabWorkerRequest = { protocol: mathJSLabWorkerProtocolVersion, requestId, command };
            try {
                this.worker.postMessage(request);
            } catch (error) {
                this.restart(requestId, error instanceof Error ? error : new Error(String(error)));
            }
        });
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.detach();
        this.worker.terminate();
        this.rejectPending(undefined, new Error('MathJSLab Worker transport was disposed'));
        this.abortResources();
        this.sessionContexts.clear();
    }

    public setSessionContext(sessionId: string, context: MarkdownDocumentContext): void {
        this.sessionContexts.set(sessionId, context);
    }

    public deleteSessionContext(sessionId: string): void {
        this.sessionContexts.delete(sessionId);
        this.abortResources(sessionId);
    }

    private readonly receive = (event: MessageEvent<MathJSLabWorkerOutboundMessage>): void => {
        const response = event.data;
        if (!response || response.protocol !== mathJSLabWorkerProtocolVersion || typeof response.requestId !== 'string') return;
        if ('sessionId' in response) {
            void this.provideResource(response, this.worker, this.generation);
            return;
        }
        this.settle(response.requestId, (pending) => (response.ok ? pending.resolve(response.result) : pending.reject(deserializeMathJSLabWorkerError(response.error))));
    };

    private async provideResource(request: MathJSLabWorkerResourceRequest, worker: MathJSLabWorkerEndpoint, generation: number): Promise<void> {
        let response: MathJSLabWorkerResourceResponse;
        const controller = new AbortController();
        const context = this.sessionContexts.get(request.sessionId);
        const abort = (): void => controller.abort(context?.signal?.reason);
        context?.signal?.addEventListener('abort', abort, { once: true });
        this.resourceOperations.set(request.requestId, {
            controller,
            sessionId: request.sessionId,
            generation,
            removeAbortListener: () => context?.signal?.removeEventListener('abort', abort),
        });
        try {
            if (!context) throw new Error(`Unknown MathJSLab resource session: ${request.sessionId}`);
            if (!this.options.readResourceText) throw new Error('MathJSLab resource loading is not configured');
            response = {
                protocol: mathJSLabWorkerProtocolVersion,
                type: 'resource-response',
                requestId: request.requestId,
                ok: true,
                text: await this.options.readResourceText(request.reference, { ...context, signal: controller.signal }),
            };
        } catch (error) {
            response = {
                protocol: mathJSLabWorkerProtocolVersion,
                type: 'resource-response',
                requestId: request.requestId,
                ok: false,
                error: serializeMathJSLabWorkerError(error),
            };
        }
        const pending = this.resourceOperations.get(request.requestId);
        pending?.removeAbortListener();
        this.resourceOperations.delete(request.requestId);
        if (!this.disposed && !controller.signal.aborted && worker === this.worker && generation === this.generation) worker.postMessage(response);
    }

    private readonly fail = (event: Event): void => {
        const error = event instanceof ErrorEvent ? event.error || new Error(event.message) : new Error('MathJSLab Worker message failure');
        this.restart(undefined, error);
    };

    private restart(triggerRequestId: string | undefined, triggerError: Error): void {
        if (this.disposed) return;
        this.detach();
        this.worker.terminate();
        this.abortResources();
        this.generation++;
        this.rejectPending(triggerRequestId, triggerError);
        if (!this.factory) {
            this.disposed = true;
            return;
        }
        try {
            this.worker = this.factory();
            this.attach();
        } catch {
            this.disposed = true;
        }
    }

    private rejectPending(triggerRequestId: string | undefined, triggerError: Error): void {
        for (const requestId of Array.from(this.pending.keys())) {
            this.settle(requestId, (pending) => pending.reject(requestId === triggerRequestId || triggerRequestId === undefined ? triggerError : restartedError()));
        }
    }

    private abortResources(sessionId?: string): void {
        for (const [requestId, pending] of this.resourceOperations) {
            if (sessionId !== undefined && pending.sessionId !== sessionId) continue;
            pending.removeAbortListener();
            pending.controller.abort('MathJSLab resource request was cancelled');
            this.resourceOperations.delete(requestId);
        }
    }

    private settle(requestId: string, settle: (pending: PendingRequest) => void): void {
        const pending = this.pending.get(requestId);
        if (!pending) return;
        this.pending.delete(requestId);
        pending.cleanup();
        settle(pending);
    }

    private attach(): void {
        this.worker.addEventListener('message', this.receive);
        this.worker.addEventListener('error', this.fail);
        this.worker.addEventListener('messageerror', this.fail);
    }

    private detach(): void {
        this.worker.removeEventListener('message', this.receive);
        this.worker.removeEventListener('error', this.fail);
        this.worker.removeEventListener('messageerror', this.fail);
    }
}

export const createWorkerMathJSLabTransport = (workerOrFactory: MathJSLabWorkerEndpoint | MathJSLabWorkerFactory, options?: MathJSLabWorkerTransportOptions): WorkerMathJSLabTransport =>
    new WorkerMathJSLabTransport(workerOrFactory, options);
