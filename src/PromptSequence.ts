import type { CommandPromptList, CommandPromptEvalHandler } from './components/command-prompt-list/command-prompt-list.component';

/**
 * Replace the prompt list and evaluate nonempty source statements in order.
 * Accepts synchronous calculators and asynchronous runtime handlers without mutating
 * the caller's source list. Rejects on handler failure before scheduling later commands.
 */
export async function loadPromptSequence(list: CommandPromptList, statements: readonly string[], evaluate: CommandPromptEvalHandler<void | Promise<void>>): Promise<void> {
    list.clear();
    const sources = statements.length ? [...statements] : [''];
    if (sources.at(-1)?.trim()) sources.push('');
    for (const source of sources) {
        const { newPrompt } = list.promptAppend(source);
        if (source.trim()) await evaluate(newPrompt, list.promptIndex);
    }
    list.element.prompt[0]?.focusInput();
}
