import { hdlExtension, hdlInteractiveExtension } from 'mathjslab-markdown/extensions';
import { createBrowserHDLExecutor } from 'mathjslab-markdown/hdl';
import type { MarkdownExtension, MarkdownExecutionPolicies } from 'mathjslab-markdown';

/** Trusted application authorization; document content cannot grant execution.
 * Verilog and the packaged VHDL-2008 profile execute in local Workers.
 * NVC provides VHDL simulation/replay; GHDL and YoWASP provide synthesis.
 */
export const markdownHDLConfiguration = (assetsURL: string | URL): { extensions: MarkdownExtension[]; executionPolicy: MarkdownExecutionPolicies } => {
    const executor = createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL, timeoutMs: 30_000, maxSessions: 4 });
    return {
        extensions: [hdlExtension(executor), hdlInteractiveExtension(executor)],
        executionPolicy: { hdl: { enabled: true }, 'hdl-interactive': { enabled: true } },
    };
};
