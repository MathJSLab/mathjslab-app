import { jest } from '@jest/globals';
import type { MarkdownDocumentContext } from '../../src/MarkdownEngine';
import { createTransportMathJSLabExecutor, type MathJSLabWorkerTransport } from '../../src/markdown/extensions/mathjslab/transportExecutor';
import {
    deserializeMathJSLabWorkerError,
    serializeMathJSLabWorkerError,
    snapshotMathJSLabContext,
    type MathJSLabWorkerCommand,
    type MathJSLabWorkerSuccess,
} from '../../src/markdown/extensions/mathjslab/workerProtocol';

describe('MathJSLab Worker protocol', () => {
    test('snapshots only cloneable document context fields', () => {
        const context: MarkdownDocumentContext = {
            sourceUrl: new URL('https://example.test/lesson/page.md'),
            signal: new AbortController().signal,
            theme: 'dark',
            locale: 'pt-BR',
            width: 640,
            securityMode: 'sanitized',
            executionPolicy: { mathjslab: { enabled: true, maxStatements: 12 } },
            resourcePolicy: { allowNetwork: false, allowedProtocols: ['https:'] },
            resolveUrl: () => new URL('https://invalid.test/'),
            onDiagnostic: () => undefined,
        };

        expect(snapshotMathJSLabContext(context)).toEqual({
            sourceUrl: 'https://example.test/lesson/page.md',
            theme: 'dark',
            locale: 'pt-BR',
            width: 640,
            securityMode: 'sanitized',
            executionPolicy: { mathjslab: { enabled: true, maxStatements: 12 } },
            resourcePolicy: { allowNetwork: false, allowedProtocols: ['https:'] },
        });
    });

    test('serializes errors without losing their identity and code', () => {
        const source = Object.assign(new TypeError('invalid expression'), { code: 'E_EXPRESSION' });
        const serialized = serializeMathJSLabWorkerError(source);
        const restored = deserializeMathJSLabWorkerError(serialized) as Error & { code?: string };

        expect(serialized).toMatchObject({ name: 'TypeError', message: 'invalid expression', code: 'E_EXPRESSION' });
        expect(restored).toMatchObject({ name: 'TypeError', message: 'invalid expression', code: 'E_EXPRESSION' });
    });

    test('adapts an asynchronous transport to document-scoped executor sessions', async () => {
        const commands: MathJSLabWorkerCommand[] = [];
        const signals: (AbortSignal | undefined)[] = [];
        const transport: MathJSLabWorkerTransport = {
            async request(command, options): Promise<MathJSLabWorkerSuccess> {
                commands.push(command);
                signals.push(options?.signal);
                switch (command.type) {
                    case 'create-session':
                        return { type: 'session-created' };
                    case 'parse':
                        return { type: 'parsed', statements: command.source.split(';') };
                    case 'execute':
                        return {
                            type: 'executed',
                            result: { status: 'success', outputs: [{ type: 'text', text: `${command.context.blockIndex}:${command.statement}` }] },
                        };
                    case 'dispose-session':
                        return { type: 'session-disposed' };
                    case 'to-mathml':
                        return { type: 'mathml', markup: `<math>${command.source}</math>` };
                }
            },
        };
        const executor = createTransportMathJSLabExecutor({ transport, toMathML: (source) => `<local>${source}</local>`, createSessionId: () => 'lesson-1' });
        const controller = new AbortController();
        const context = { sourceUrl: new URL('https://example.test/lesson.md'), signal: controller.signal };
        const session = await executor.createSession(context);

        expect(executor.toMathML('x', 'inline')).toBe('<local>x</local>');
        await expect(session.parse('x=1;x', context)).resolves.toEqual({ statements: ['x=1', 'x'] });
        await expect(session.execute('x=1', { ...context, blockIndex: 2, statementIndex: 0 })).resolves.toEqual({
            status: 'success',
            outputs: [{ type: 'text', text: '2:x=1' }],
        });
        await session.dispose?.();
        await session.dispose?.();

        expect(commands.map(({ type }) => type)).toEqual(['create-session', 'parse', 'execute', 'dispose-session']);
        expect(commands.every((command) => command.type === 'to-mathml' || !('sessionId' in command) || command.sessionId === 'lesson-1')).toBe(true);
        expect(signals.slice(0, 3)).toEqual([controller.signal, controller.signal, controller.signal]);
    });

    test('rejects mismatched responses and use after disposal', async () => {
        const transport: MathJSLabWorkerTransport = {
            request: async (command) => (command.type === 'create-session' ? { type: 'session-created' } : { type: 'session-disposed' }),
        };
        const executor = createTransportMathJSLabExecutor({ transport, toMathML: (source) => source });
        const session = await executor.createSession({});

        await expect(session.parse('x', {})).rejects.toThrow('expected parsed');
        await session.dispose?.();
        await expect(session.execute('x', { blockIndex: 0, statementIndex: 0 })).rejects.toThrow('session is disposed');
    });

    test('materializes serialized Plotly requests on the main thread', async () => {
        const request = {
            type: 'plot' as const,
            data: [{ x: [1, 2], y: [3, 4], type: 'scatter' as const }],
            layout: { title: { text: 'Worker plot' } },
            config: { responsive: true },
        };
        const transport: MathJSLabWorkerTransport = {
            async request(command): Promise<MathJSLabWorkerSuccess> {
                if (command.type === 'create-session') return { type: 'session-created' };
                if (command.type === 'execute') {
                    return {
                        type: 'executed',
                        result: { status: 'success', outputs: [{ type: 'visualization', renderer: 'plotly', request, role: 'visualization' }] },
                    };
                }
                if (command.type === 'dispose-session') return { type: 'session-disposed' };
                throw new Error(`Unexpected command: ${command.type}`);
            },
        };
        const node = document.createElement('div');
        const materializeOutput = jest.fn(() => ({ type: 'node' as const, node, role: 'visualization' as const }));
        const executor = createTransportMathJSLabExecutor({ transport, toMathML: (source) => source, materializeOutput });
        const session = await executor.createSession({});

        const result = await session.execute('plot([3, 4])', { blockIndex: 0, statementIndex: 0 });

        expect(materializeOutput).toHaveBeenCalledWith({ type: 'visualization', renderer: 'plotly', request, role: 'visualization' });
        expect(result.outputs).toEqual([{ type: 'node', node, role: 'visualization' }]);
    });
});
