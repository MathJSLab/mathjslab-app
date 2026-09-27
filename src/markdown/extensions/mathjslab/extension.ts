import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine';
import type { MathJSLabExecutionResult, MathJSLabExecutionSession, MathJSLabExecutor, MathJSLabNodeOutput, MathJSLabParseResult } from './executor';
import { mathJSLabManifest } from './manifest';

type MathJSLabToken = {
    type: 'mathjslab-inline' | 'mathjslab-block';
    raw: string;
    text: string;
    display: 'inline' | 'block';
};

const block = (executor: MathJSLabExecutor) => ({
    name: 'mathjslab-block',
    level: 'block' as const,
    start: (src: string): number | undefined => /^ {0,3}%%[ \t]*(?:\r?\n|$)/m.exec(src)?.index,
    tokenizer: (src: string): MathJSLabToken | undefined => {
        const match = /^ {0,3}%%[ \t]*\r?\n([\s\S]*?)\r?\n {0,3}%%[ \t]*(?:\r?\n|$)/.exec(src);
        if (!match) return;
        return { type: 'mathjslab-block', raw: match[0], text: match[1]!, display: 'block' };
    },
    renderer: (token: MathJSLabToken): string => executor.toMathML(token.text, token.display),
});

const inline = (executor: MathJSLabExecutor) => ({
    name: 'mathjslab-inline',
    level: 'inline' as const,
    start: (src: string): number | undefined => {
        const index = src.indexOf('%');
        return index >= 0 ? index : undefined;
    },
    tokenizer: (src: string): MathJSLabToken | undefined => {
        const protectedMatch = /^%`([^`\r\n]+)`%/.exec(src);
        if (protectedMatch) return { type: 'mathjslab-inline', raw: protectedMatch[0], text: protectedMatch[1]!, display: 'inline' };
        const simpleMatch = /^%(?![%`\s])([^%\r\n]*?\S)%(?![%\p{L}\p{N}_])/u.exec(src);
        if (!simpleMatch) return;
        return { type: 'mathjslab-inline', raw: simpleMatch[0], text: simpleMatch[1]!, display: 'inline' };
    },
    renderer: (token: MathJSLabToken): string => executor.toMathML(token.text, token.display),
});

type SessionEntry = {
    session?: Promise<MathJSLabExecutionSession>;
    operation: Promise<void>;
    nextBlockIndex: number;
    statementCount: number;
    disposed: boolean;
};

const defaultPolicy = {
    enabled: true,
    allowInRestrictedMode: false,
    maxSourceBytes: 256 * 1024,
    maxBlocks: 32,
    maxStatements: 512,
} as const;
const executionLimit = (value: number | undefined, fallback: number): number => (Number.isFinite(value) ? Math.max(0, Math.floor(value!)) : fallback);
const utf8ByteLength = (source: string): number => {
    let length = 0;
    for (const character of source) {
        const codePoint = character.codePointAt(0)!;
        length += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
    }
    return length;
};

export const mathJSLabExtension = (executor: MathJSLabExecutor): MarkdownExtension => {
    const rendered = new Set<Element>();
    const richOutputs = new Map<Element, Set<MathJSLabNodeOutput>>();
    const resizeObservers = new Map<MathJSLabNodeOutput, ResizeObserver>();
    const sessions = new Map<AbortSignal | MarkdownDocumentContext, SessionEntry>();

    const showResult = async (container: HTMLDivElement, result: MathJSLabExecutionResult): Promise<void> => {
        const state = result.state ?? (result.status === 'error' ? 'bad' : 'good');
        container.setAttribute('data-state', state);
        container.classList.toggle('error', state === 'bad');
        for (const output of result.outputs ?? []) {
            if (output.type === 'text') container.append(output.text);
            else if (output.type === 'mathml') container.insertAdjacentHTML('beforeend', output.markup);
            else if (output.type === 'html') {
                if (output.trusted) container.insertAdjacentHTML('beforeend', output.markup);
                else container.append(output.markup);
            } else {
                if (output.role && output.node instanceof HTMLElement) output.node.dataset.mathjslabOutputRole = output.role;
                container.append(output.node);
                if (output.mount || output.dispose) {
                    let entries = richOutputs.get(container);
                    if (!entries) richOutputs.set(container, (entries = new Set()));
                    entries.add(output);
                }
                await output.mount?.(output.node);
                if (output.resize && output.node instanceof Element && typeof ResizeObserver !== 'undefined') {
                    const observer = new ResizeObserver(() => void output.resize?.(output.node));
                    observer.observe(output.node);
                    resizeObservers.set(output, observer);
                }
            }
        }
        if (result.status === 'error' && !(result.outputs?.length ?? 0)) {
            const message = document.createElement('pre');
            message.className = 'mathjslab-error';
            message.setAttribute('role', 'alert');
            message.textContent = `MathJSLab: ${result.error instanceof Error ? result.error.message : String(result.error ?? 'execution failed')}`;
            container.append(message);
        }
    };

    const disposeOutputs = async (container: Element): Promise<void> => {
        const outputs = richOutputs.get(container);
        richOutputs.delete(container);
        if (outputs) {
            await Promise.all(
                Array.from(outputs, async (output) => {
                    resizeObservers.get(output)?.disconnect();
                    resizeObservers.delete(output);
                    await output.dispose?.();
                }),
            );
        }
    };

    const disposeSession = async (key: AbortSignal | MarkdownDocumentContext, entry: SessionEntry): Promise<void> => {
        if (entry.disposed) return;
        entry.disposed = true;
        sessions.delete(key);
        await entry.operation.catch(() => undefined);
        if (entry.session) await (await entry.session).dispose?.();
    };

    const entryFor = (context: MarkdownDocumentContext): SessionEntry => {
        const signal = context.signal;
        const key = signal ?? context;
        let entry = sessions.get(key);
        if (entry) return entry;
        entry = {
            operation: Promise.resolve(),
            nextBlockIndex: 0,
            statementCount: 0,
            disposed: false,
        };
        sessions.set(key, entry);
        signal?.addEventListener('abort', () => void disposeSession(key, entry!), { once: true });
        return entry;
    };

    const reportPolicy = (container: Element, context: MarkdownDocumentContext, code: string, message: string): void => {
        const alert = document.createElement('pre');
        alert.className = 'mathjslab-error mathjslab-policy';
        alert.setAttribute('role', 'alert');
        alert.textContent = `MathJSLab: ${message}`;
        container.prepend(alert);
        context.onDiagnostic?.({
            extension: mathJSLabManifest.name,
            language: mathJSLabManifest.fences[0].language,
            code,
            severity: 'warning',
            ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
            message,
        });
    };

    const reportExecutionFailure = (context: MarkdownDocumentContext, error: unknown): void => {
        const code = error instanceof Error && 'code' in error ? String((error as Error & { code?: unknown }).code) : undefined;
        context.onDiagnostic?.({
            extension: mathJSLabManifest.name,
            language: mathJSLabManifest.fences[0].language,
            code: code === 'MATHJSLAB_TIMEOUT' ? 'mathjslab-execution-timeout' : code === 'MATHJSLAB_WORKER_RESTARTED' ? 'mathjslab-worker-restarted' : 'mathjslab-execution-error',
            severity: 'error',
            ...(context.sourceUrl ? { sourceUrl: context.sourceUrl } : {}),
            message: error instanceof Error ? error.message : String(error),
            cause: error,
        });
    };

    const render = (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
        const entry = entryFor(context);
        const blockIndex = entry.nextBlockIndex++;
        const configured = context.executionPolicy?.[mathJSLabManifest.name] ?? {};
        const policy = {
            enabled: configured.enabled ?? defaultPolicy.enabled,
            allowInRestrictedMode: configured.allowInRestrictedMode ?? defaultPolicy.allowInRestrictedMode,
            maxSourceBytes: executionLimit(configured.maxSourceBytes, defaultPolicy.maxSourceBytes),
            maxBlocks: executionLimit(configured.maxBlocks, defaultPolicy.maxBlocks),
            maxStatements: executionLimit(configured.maxStatements, defaultPolicy.maxStatements),
        };
        const restricted = context.securityMode === 'sanitized' || context.securityMode === 'strict';
        if (!policy.enabled || (restricted && !policy.allowInRestrictedMode)) {
            reportPolicy(container, context, 'mathjslab-execution-disabled', 'command execution is disabled by the document policy');
            return Promise.resolve();
        }
        if (blockIndex >= policy.maxBlocks) {
            reportPolicy(container, context, 'mathjslab-block-limit', `document exceeds the limit of ${policy.maxBlocks} executable blocks`);
            return Promise.resolve();
        }
        const sourceBytes = utf8ByteLength(source);
        if (sourceBytes > policy.maxSourceBytes) {
            reportPolicy(container, context, 'mathjslab-source-limit', `block exceeds the limit of ${policy.maxSourceBytes} source bytes`);
            return Promise.resolve();
        }
        const operation = entry.operation.then(async () => {
            if (entry.disposed || context.signal?.aborted) return;
            entry.session ??= Promise.resolve(executor.createSession(context));
            const session = await entry.session;
            let parsed: MathJSLabParseResult;
            try {
                parsed = await session.parse(source, context);
            } catch (error) {
                if (entry.disposed || context.signal?.aborted) return;
                container.replaceChildren();
                const result = document.createElement('div');
                result.className = 'mathjslab-result';
                result.setAttribute('data-block-index', String(blockIndex));
                result.setAttribute('data-statement-index', '0');
                container.append(result);
                reportExecutionFailure(context, error);
                await showResult(result, { status: 'error', error });
                return;
            }
            const { statements, error } = parsed;
            if (entry.disposed || context.signal?.aborted) return;
            if (error) {
                container.replaceChildren();
                const message = document.createElement('pre');
                message.className = 'mathjslab-error';
                message.setAttribute('role', 'alert');
                message.textContent = `MathJSLab: ${error instanceof Error ? error.message : String(error)}`;
                container.append(message);
                return;
            }
            if (entry.statementCount + statements.length > policy.maxStatements) {
                reportPolicy(container, context, 'mathjslab-statement-limit', `document exceeds the limit of ${policy.maxStatements} executable statements`);
                return;
            }
            entry.statementCount += statements.length;
            container.replaceChildren();
            for (let statementIndex = 0; statementIndex < statements.length; statementIndex++) {
                if (entry.disposed || context.signal?.aborted) return;
                const result = document.createElement('div');
                result.className = 'mathjslab-result';
                result.setAttribute('data-block-index', String(blockIndex));
                result.setAttribute('data-statement-index', String(statementIndex));
                container.append(result);
                let execution: MathJSLabExecutionResult;
                try {
                    execution = await session.execute(statements[statementIndex]!, { ...context, blockIndex, statementIndex });
                } catch (error) {
                    if (entry.disposed || context.signal?.aborted) return;
                    reportExecutionFailure(context, error);
                    execution = { status: 'error', error };
                }
                if (entry.disposed || context.signal?.aborted) return;
                await showResult(result, execution);
            }
            rendered.add(container);
        });
        entry.operation = operation.catch(() => undefined);
        return operation;
    };

    const disposeContainer = async (container: Element): Promise<void> => {
        rendered.delete(container);
        await Promise.all(Array.from(container.querySelectorAll('.mathjslab-result'), (result) => disposeOutputs(result)));
        container.replaceChildren();
    };

    return {
        name: mathJSLabManifest.name,
        manifest: mathJSLabManifest,
        marked: { extensions: [block(executor), inline(executor)] },
        fences: [{ ...mathJSLabManifest.fences[0], render, dispose: disposeContainer }],
        async dispose() {
            await Promise.all(Array.from(rendered, async (container) => disposeContainer(container)));
            rendered.clear();
            await Promise.all(Array.from(sessions, ([key, entry]) => disposeSession(key, entry)));
            await executor.dispose?.();
        },
    };
};

export type {
    MathJSLabExecutionResult,
    MathJSLabExecutionSession,
    MathJSLabExecutionStatus,
    MathJSLabExecutor,
    MathJSLabHTMLOutput,
    MathJSLabMathMLOutput,
    MathJSLabNodeOutput,
    MathJSLabOutput,
    MathJSLabOutputState,
    MathJSLabParseResult,
    MathJSLabTextOutput,
    MathJSLabStatementContext,
} from './executor';
