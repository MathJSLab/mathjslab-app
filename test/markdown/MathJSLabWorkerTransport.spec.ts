import { createTransportMathJSLabExecutor } from '../../src/markdown/extensions/mathjslab/transportExecutor';
import { createWorkerMathJSLabTransport, type MathJSLabWorkerEndpoint } from '../../src/markdown/extensions/mathjslab/workerTransport';
import { MathJSLabWorkerRuntime, type MathJSLabWorkerRuntimeHandler, type MathJSLabWorkerScope } from '../../src/markdown/extensions/mathjslab/workerRuntime';
import type {
    MathJSLabWorkerInboundMessage,
    MathJSLabWorkerOutboundMessage,
    MathJSLabWorkerRequest,
    MathJSLabWorkerResponse,
    MathJSLabWorkerSuccess,
} from '../../src/markdown/extensions/mathjslab/workerProtocol';

class ImmediateWorker implements MathJSLabWorkerEndpoint {
    private readonly messages = new Set<(event: MessageEvent<MathJSLabWorkerResponse>) => void>();
    private readonly failures = new Map<string, Set<(event: Event) => void>>([
        ['error', new Set()],
        ['messageerror', new Set()],
    ]);
    private value: string | undefined;
    public terminated = false;

    public postMessage(request: MathJSLabWorkerRequest): void {
        const { command } = request;
        if (command.type === 'execute' && command.statement === 'hang') return;
        let result: MathJSLabWorkerSuccess;
        switch (command.type) {
            case 'create-session':
                result = { type: 'session-created' };
                break;
            case 'parse':
                result = { type: 'parsed', statements: [command.source] };
                break;
            case 'execute':
                if (command.statement.startsWith('set ')) this.value = command.statement.slice(4);
                result = { type: 'executed', result: { status: 'success', outputs: [{ type: 'text', text: this.value ?? 'undefined' }] } };
                break;
            case 'to-mathml':
                result = { type: 'mathml', markup: command.source };
                break;
            case 'dispose-session':
                result = { type: 'session-disposed' };
                break;
        }
        const response: MathJSLabWorkerResponse = { protocol: 1, requestId: request.requestId, ok: true, result };
        queueMicrotask(() => this.messages.forEach((listener) => listener({ data: response } as MessageEvent<MathJSLabWorkerResponse>)));
    }

    public addEventListener(type: 'message' | 'error' | 'messageerror', listener: ((event: MessageEvent<MathJSLabWorkerResponse>) => void) | ((event: Event) => void)): void {
        if (type === 'message') this.messages.add(listener as (event: MessageEvent<MathJSLabWorkerResponse>) => void);
        else this.failures.get(type)!.add(listener as (event: Event) => void);
    }

    public removeEventListener(type: 'message' | 'error' | 'messageerror', listener: ((event: MessageEvent<MathJSLabWorkerResponse>) => void) | ((event: Event) => void)): void {
        if (type === 'message') this.messages.delete(listener as (event: MessageEvent<MathJSLabWorkerResponse>) => void);
        else this.failures.get(type)!.delete(listener as (event: Event) => void);
    }

    public terminate(): void {
        this.terminated = true;
    }
}

class LoopbackChannel {
    private readonly mainMessage = new Set<(event: MessageEvent<MathJSLabWorkerOutboundMessage>) => void>();
    private readonly workerMessage = new Set<(event: MessageEvent<MathJSLabWorkerInboundMessage>) => void>();
    private readonly failures = new Map<string, Set<(event: Event) => void>>([
        ['error', new Set()],
        ['messageerror', new Set()],
    ]);
    public terminated = false;

    public readonly main: MathJSLabWorkerEndpoint = {
        postMessage: (message) => queueMicrotask(() => this.workerMessage.forEach((listener) => listener({ data: message } as MessageEvent<MathJSLabWorkerInboundMessage>))),
        addEventListener: (type, listener) =>
            type === 'message'
                ? this.mainMessage.add(listener as (event: MessageEvent<MathJSLabWorkerOutboundMessage>) => void)
                : this.failures.get(type)!.add(listener as (event: Event) => void),
        removeEventListener: (type, listener) =>
            type === 'message'
                ? this.mainMessage.delete(listener as (event: MessageEvent<MathJSLabWorkerOutboundMessage>) => void)
                : this.failures.get(type)!.delete(listener as (event: Event) => void),
        terminate: () => {
            this.terminated = true;
        },
    };

    public readonly scope: MathJSLabWorkerScope = {
        postMessage: (message) => queueMicrotask(() => this.mainMessage.forEach((listener) => listener({ data: message } as MessageEvent<MathJSLabWorkerOutboundMessage>))),
        addEventListener: (_type, listener) => void this.workerMessage.add(listener),
        removeEventListener: (_type, listener) => void this.workerMessage.delete(listener),
    };
}

describe('MathJSLab Worker transport and runtime', () => {
    test('correlates requests and keeps interpreter state in a document session', async () => {
        const channel = new LoopbackChannel();
        const handler: MathJSLabWorkerRuntimeHandler = {
            createSession: () => {
                const values = new Map<string, string>();
                return {
                    parse: (source) => source.split(';'),
                    execute: (statement) => {
                        const [operation, name, value] = statement.trim().split(/\s+/);
                        if (operation === 'set') values.set(name!, value!);
                        return { status: 'success', outputs: [{ type: 'text', text: operation === 'get' ? (values.get(name!) ?? 'undefined') : 'stored' }] };
                    },
                };
            },
            toMathML: (source, display) => `<math display="${display}">${source}</math>`,
        };
        const runtime = new MathJSLabWorkerRuntime(channel.scope, handler);
        const transport = createWorkerMathJSLabTransport(channel.main);
        const executor = createTransportMathJSLabExecutor({ transport, toMathML: (source) => source, createSessionId: () => 'document-1' });
        const session = await executor.createSession({ locale: 'pt-BR' });

        await expect(session.parse('set x 42;get x', {})).resolves.toEqual({ statements: ['set x 42', 'get x'] });
        await session.execute('set x 42', { blockIndex: 0, statementIndex: 0 });
        await expect(session.execute('get x', { blockIndex: 0, statementIndex: 1 })).resolves.toMatchObject({ outputs: [{ type: 'text', text: '42' }] });
        await session.dispose?.();
        await executor.dispose?.();

        expect(channel.terminated).toBe(true);
        await runtime.dispose();
    });

    test('rejects an aborted request and suppresses its late response', async () => {
        const channel = new LoopbackChannel();
        let finish!: (statements: readonly string[]) => void;
        const delayed = new Promise<readonly string[]>((resolve) => (finish = resolve));
        const runtime = new MathJSLabWorkerRuntime(channel.scope, {
            createSession: () => ({ parse: () => delayed, execute: () => ({ status: 'success' }) }),
            toMathML: (source) => source,
        });
        const transport = createWorkerMathJSLabTransport(channel.main);
        await transport.request({ type: 'create-session', sessionId: 'slow', context: {} });
        const controller = new AbortController();
        const parsing = transport.request({ type: 'parse', sessionId: 'slow', source: 'wait', context: {} }, { signal: controller.signal });
        controller.abort('document replaced');

        await expect(parsing).rejects.toMatchObject({ name: 'AbortError' });
        finish(['late']);
        await new Promise((resolve) => setTimeout(resolve, 0));
        transport.dispose();
        await runtime.dispose();
    });

    test('terminates on timeout and recreates a clean document session in the next Worker generation', async () => {
        const workers: ImmediateWorker[] = [];
        const transport = createWorkerMathJSLabTransport(() => {
            const worker = new ImmediateWorker();
            workers.push(worker);
            return worker;
        });
        const executor = createTransportMathJSLabExecutor({ transport, toMathML: (source) => source, createSessionId: () => 'recoverable' });
        const session = await executor.createSession({});
        await session.execute('set 42', { blockIndex: 0, statementIndex: 0 });

        await expect(
            session.execute('hang', {
                blockIndex: 0,
                statementIndex: 1,
                executionPolicy: { mathjslab: { timeoutMs: 5 } },
            }),
        ).rejects.toMatchObject({ name: 'TimeoutError', code: 'MATHJSLAB_TIMEOUT' });

        expect(workers).toHaveLength(2);
        expect(workers[0]!.terminated).toBe(true);
        await expect(session.execute('get', { blockIndex: 1, statementIndex: 0 })).resolves.toMatchObject({
            outputs: [{ type: 'text', text: 'undefined' }],
        });
        await session.dispose?.();
        await executor.dispose?.();
        expect(workers[1]!.terminated).toBe(true);
    });

    test('mediates Worker resource reads through the document context', async () => {
        const channel = new LoopbackChannel();
        const seen: Array<{ reference: string; sourceUrl?: string }> = [];
        const runtime = new MathJSLabWorkerRuntime(channel.scope, {
            createSession: (_context, resources) => ({
                parse: (source) => [source],
                execute: async (statement) => ({ status: 'success', outputs: [{ type: 'text', text: await resources.readText(statement) }] }),
            }),
            toMathML: (source) => source,
        });
        const transport = createWorkerMathJSLabTransport(channel.main, {
            readResourceText: async (reference, context) => {
                seen.push({ reference, ...(context.sourceUrl ? { sourceUrl: context.sourceUrl.href } : {}) });
                return 'x = 42';
            },
        });
        const executor = createTransportMathJSLabExecutor({ transport, toMathML: (source) => source, createSessionId: () => 'resource-document' });
        const context = { sourceUrl: new URL('https://course.test/lesson/index.md') };
        const session = await executor.createSession(context);

        await expect(session.execute('./scripts/setup.m', { ...context, blockIndex: 0, statementIndex: 0 })).resolves.toMatchObject({
            outputs: [{ type: 'text', text: 'x = 42' }],
        });
        expect(seen).toEqual([{ reference: './scripts/setup.m', sourceUrl: 'https://course.test/lesson/index.md' }]);

        await session.dispose?.();
        await executor.dispose?.();
        await runtime.dispose();
    });

    test('aborts an in-flight resource read when its document is cancelled', async () => {
        const channel = new LoopbackChannel();
        let resourceAborted = false;
        const runtime = new MathJSLabWorkerRuntime(channel.scope, {
            createSession: (_context, resources) => ({
                parse: (source) => [source],
                execute: async (statement) => ({ status: 'success', outputs: [{ type: 'text', text: await resources.readText(statement) }] }),
            }),
            toMathML: (source) => source,
        });
        const transport = createWorkerMathJSLabTransport(channel.main, {
            readResourceText: (_reference, context) =>
                new Promise((_resolve, reject) => {
                    context.signal!.addEventListener(
                        'abort',
                        () => {
                            resourceAborted = true;
                            reject(context.signal!.reason);
                        },
                        { once: true },
                    );
                }),
        });
        const controller = new AbortController();
        const executor = createTransportMathJSLabExecutor({ transport, toMathML: (source) => source });
        const session = await executor.createSession({ signal: controller.signal });
        const execution = session.execute('./slow.m', { signal: controller.signal, blockIndex: 0, statementIndex: 0 });
        await new Promise((resolve) => setTimeout(resolve, 0));

        controller.abort('document replaced');

        await expect(execution).rejects.toMatchObject({ name: 'AbortError', code: 'MATHJSLAB_ABORTED' });
        expect(resourceAborted).toBe(true);
        expect(channel.terminated).toBe(true);
        await runtime.dispose();
    });
});
