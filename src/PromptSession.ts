import type { Interpreter, InterpreterConfig, AliasNameTable } from 'mathjslab';
import { InProcessMathJSLabRuntime, type RuntimeSession, type SessionOptions, type ExecutionResult, type HostEffect, type HostEffectContext } from 'mathjslab/runtime';
import { withPlotOutputCapture } from './PlotOutputCapture';
import { appEngine, withCommandOutputTarget } from './appEngine';
import { registerCommandResource, releaseCommandResources } from './CommandOutputResources';
import type { CommandOutputTarget } from './CommandOutputTarget';
import { PlotEngine, type PlotOutputRequest } from './PlotEngine';
import { prepareCommandPresentation, commandResultTable, type CommandPresentation } from './CommandPresentation';

/** Observable session phase; changes are announced by the statechange event. */
export type PromptState = 'initializing' | 'idle' | 'running' | 'waiting' | 'resetting' | 'disposed';

/** Owns one prompt workspace. Hooks are installed only while advancing code. */
export class PromptSession extends EventTarget {
    public state: PromptState = 'initializing';
    /** Current interpreter for workspace presentation; execute code through execute(). */
    public interpreter!: Interpreter;
    /** Creation profile restored by reset, rather than the live configure() settings. */
    public numeric: SessionOptions['numeric'];
    /** Cooperative execution deadline in milliseconds; rendering is host-owned. */
    public timeoutMs = 30000;
    private session!: RuntimeSession;
    private target: CommandOutputTarget | undefined;
    private pending: Promise<ExecutionResult> | undefined;
    private replacing = false;
    private resetting = false;
    private executionActive = false;
    private presentationSource: string | undefined;
    private presentation: CommandPresentation | undefined;
    private readonly plots = new Map<HTMLElement, { observer: ResizeObserver; ready: Promise<void> }>();
    private readonly runtime;
    private readonly removals = new MutationObserver(() => {
        for (const [node] of this.plots)
            if (!node.isConnected) {
                void releaseCommandResources(node);
            }
    });

    /**
     * Create the controller; initialize() must complete before accepting commands.
     * @param configuration Interpreter aliases, host bindings and initial language settings.
     */
    public constructor(private readonly configuration: InterpreterConfig) {
        super();
        this.removals.observe(document.body, { childList: true, subtree: true });
        this.runtime = new InProcessMathJSLabRuntime({
            host: { request: (effect, context) => this.hostEffect(effect, context) },
            evaluate: (interpreter, operation) => {
                this.interpreter = interpreter;
                interpreter.context.setAliasNameTable(this.configuration.aliasNameTable!);
                if (this.presentationSource !== undefined && !this.presentation) this.presentation = prepareCommandPresentation(interpreter, this.presentationSource);
                const run = () => withPlotOutputCapture(interpreter, operation);
                const captured = this.target ? withCommandOutputTarget(this.target, run) : run();
                return { value: captured.value, outputs: captured.requests.map((request) => ({ type: 'visualization' as const, renderer: 'plotly', request })) };
            },
        });
    }

    private setState(state: PromptState): void {
        this.state = state;
        this.dispatchEvent(new Event('statechange'));
    }

    /** Update locale aliases without clearing variables or replaying source. */
    public setAliases(aliases: AliasNameTable): void {
        this.configuration.aliasNameTable = aliases;
        this.interpreter?.context.setAliasNameTable(aliases);
    }

    /** Create the first workspace, selecting optional numeric settings before literals exist. */
    public async initialize(numeric?: SessionOptions['numeric']): Promise<void> {
        await this.replace(numeric, 'discard');
    }

    /**
     * Explicit host replacement with a fresh workspace; keep preserves the current session.
     * Initialization failures retain the previous workspace. Normal in-session numeric
     * changes use configure(), which supports workspace migration in mathjslab 2.10.
     */
    public async replace(numeric: SessionOptions['numeric'], workspace: 'discard' | 'keep'): Promise<void> {
        if (workspace === 'keep') return;
        if (this.replacing || this.pending || this.resetting || this.state === 'disposed') throw new Error('Prompt session is busy or disposed');
        this.replacing = true;
        this.setState('initializing');
        const oldInterpreter = this.interpreter;
        let replacement: RuntimeSession | undefined;
        try {
            replacement = await this.runtime.createSession({ ...(numeric ? { numeric } : {}), interpreter: this.configuration, parfor: 'fallback' });
            const initialized = await replacement.execute('clear');
            if (initialized.status !== 'success') throw new Error(initialized.diagnostics.map((d) => d.message).join('\n'));
            const previous = this.session;
            this.session = replacement;
            this.numeric = numeric === undefined ? undefined : structuredClone(numeric);
            appEngine.interpreter = this.interpreter;
            if (appEngine.shell?.commandShell) appEngine.shell.commandShell.interpreterPointer = this.interpreter;
            await previous?.dispose();
            await this.clearPlots();
            this.setState('idle');
        } catch (error) {
            this.interpreter = oldInterpreter;
            this.setState(this.session ? 'idle' : 'initializing');
            await replacement?.dispose();
            throw error;
        } finally {
            this.replacing = false;
        }
    }

    /**
     * Evaluate one command, materialize outputs and render coded diagnostics into its target.
     * Returns false for busy, cancelled, timed-out, evaluation or presentation failures.
     * The caller must await completion before scheduling another command.
     */
    public async execute(source: string, target: CommandOutputTarget): Promise<boolean> {
        if (this.pending || this.replacing || this.state !== 'idle') {
            target.setState('bad');
            target.content.dataset.executionState = 'error';
            target.setText('MATHJSLAB_SESSION_BUSY: prompt workspace unavailable');
            return false;
        }
        this.target = target;
        this.presentationSource = source;
        this.presentation = undefined;
        target.clear();
        target.content.dataset.executionState = 'running';
        target.content.setAttribute('aria-busy', 'true');
        this.setState('running');
        try {
            this.executionActive = true;
            this.pending = this.session.execute(source, { timeoutMs: this.timeoutMs });
            const result = await this.pending;
            this.executionActive = false;
            // External document commands own their presentation.
            if (!target.content.querySelector('markdown-document, .file-picker-button')) {
                target.setState(result.status === 'success' ? 'good' : 'bad');
                await this.render(result, target);
            }
            target.content.dataset.executionState = result.status;
            return result.status === 'success';
        } catch (error) {
            target.setState('bad');
            target.content.dataset.executionState = 'error';
            target.append(String(error));
            return false;
        } finally {
            this.executionActive = false;
            this.pending = undefined;
            this.target = undefined;
            this.presentationSource = undefined;
            this.presentation = undefined;
            target.content.removeAttribute('aria-busy');
            if ((this.state as PromptState) !== 'disposed' && !this.resetting) this.setState('idle');
            appEngine.shell?.commandShell?.refreshNameList();
        }
    }

    /** Cancel active language execution, preserving its completed local workspace effects. */
    public async interrupt(): Promise<void> {
        if (!this.pending || !this.executionActive) return;
        await this.session.interrupt('Cancelled by user');
        await this.pending;
    }

    /** Cancel work, clear variables/plots and restore the session's initial numeric profile. */
    public async reset(): Promise<void> {
        if (this.replacing || this.resetting || this.state === 'disposed') return;
        this.resetting = true;
        this.setState('resetting');
        try {
            await this.session.reset();
            await this.pending;
            if ((this.state as PromptState) === 'disposed') return;
            // reset creates a new Interpreter; acquire it through the scoped hook.
            await this.session.execute('clear');
            appEngine.interpreter = this.interpreter;
            if (appEngine.shell?.commandShell) appEngine.shell.commandShell.interpreterPointer = this.interpreter;
            await this.clearPlots();
        } finally {
            this.resetting = false;
            if ((this.state as PromptState) !== 'disposed') this.setState('idle');
        }
    }

    /** Idempotently release the runtime sessions, execution hooks and owned graphics. */
    public async dispose(): Promise<void> {
        this.setState('disposed');
        this.removals.disconnect();
        await this.runtime.dispose();
        await this.pending;
        await this.clearPlots();
    }

    /** Await pending plot mounts before purging their DOM and resize observers. */
    public async clearPlots(): Promise<void> {
        for (const [node] of this.plots) {
            await releaseCommandResources(node);
        }
        this.plots.clear();
    }

    private async render(result: ExecutionResult, target: CommandOutputTarget): Promise<void> {
        const valueIndex = result.outputs.findIndex((output, index) => output.type === 'mathml' && result.outputs[index - 1]?.type === 'text');
        if (result.status === 'success' && valueIndex < 0 && this.presentation) target.append(commandResultTable(this.presentation));
        for (const [index, output] of result.outputs.entries()) {
            if (output.type === 'data' || (output.type === 'text' && result.outputs[index + 1]?.type === 'mathml')) continue;
            if (output.type === 'mathml') {
                const previous = result.outputs[index - 1];
                target.append(commandResultTable(index === valueIndex ? this.presentation : undefined, previous?.type === 'text' ? previous.text : '', output.markup));
            } else if (output.type === 'text') target.append(output.text);
            else if (output.type === 'visualization' && output.renderer === 'plotly') {
                const node = document.createElement('div');
                node.className = 'plot-output';
                target.append(node);
                const observer = new ResizeObserver(() => {
                    if (node.isConnected) void PlotEngine.resize(node);
                });
                const ready = PlotEngine.render(node, output.request as PlotOutputRequest);
                this.plots.set(node, { observer, ready });
                registerCommandResource(node, async () => {
                    this.plots.delete(node);
                    observer.disconnect();
                    await ready.catch(() => {});
                    PlotEngine.dispose(node);
                });
                await ready;
                if (this.plots.has(node)) observer.observe(node);
            }
        }
        for (const diagnostic of result.diagnostics) {
            const node = document.createElement('pre');
            node.dataset.diagnosticCode = diagnostic.code;
            node.textContent = `${diagnostic.code}: ${diagnostic.message}`;
            target.append(node);
        }
    }

    private async hostEffect(effect: HostEffect, context: HostEffectContext): Promise<{ value?: unknown }> {
        this.setState('waiting');
        if (this.target) this.target.content.dataset.executionState = 'waiting';
        try {
            if (effect.type === 'read-text') {
                const response = await fetch(new URL(effect.reference, document.baseURI), { signal: context.signal ?? null });
                if (!response.ok) throw new Error(`load: ${response.status} ${effect.reference}`);
                return { value: await response.text() };
            }
            if (effect.type === 'delay') {
                await new Promise<void>((resolve, reject) => {
                    const finish = () => {
                        context.signal?.removeEventListener('abort', abort);
                        resolve();
                    };
                    const timer = setTimeout(finish, effect.milliseconds);
                    const abort = () => {
                        clearTimeout(timer);
                        context.signal?.removeEventListener('abort', abort);
                        reject(context.signal?.reason);
                    };
                    if (context.signal?.aborted) abort();
                    else context.signal?.addEventListener('abort', abort, { once: true });
                });
                return {};
            }
            if (effect.type === 'clock-now') return { value: Date.now() };
            if (effect.type === 'publish-output') return { value: effect.output };
            throw new Error(`Unsupported prompt host effect: ${effect.type}`);
        } finally {
            if (this.state !== 'disposed' && !this.resetting) this.setState('running');
        }
    }
}
