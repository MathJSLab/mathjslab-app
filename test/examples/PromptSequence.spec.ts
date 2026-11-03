import { jest } from '@jest/globals';
import type { CommandPromptList } from '../../src/components/command-prompt-list/command-prompt-list.component';
import type { CommandPrompt } from '../../src/components/command-prompt/command-prompt.component';
import { loadPromptSequence } from '../../src/PromptSequence';

function listFixture() {
    const prompts: Array<{ value: string; focusInput: ReturnType<typeof jest.fn> }> = [];
    const list = {
        promptIndex: -1,
        element: { prompt: prompts },
        clear: () => {
            prompts.length = 0;
        },
        promptAppend(source: string) {
            const newPrompt = { value: source, focusInput: jest.fn() };
            prompts.push(newPrompt);
            list.promptIndex = prompts.length - 1;
            return { newPrompt };
        },
    };
    return { list: list as unknown as CommandPromptList, prompts };
}

test('waits for the current execution before appending or starting the next prompt', async () => {
    const { list, prompts } = listFixture();
    let release!: () => void;
    const waiting = new Promise<void>((resolve) => {
        release = resolve;
    });
    const calls: string[] = [];
    const sources = ['clear', 'a=1', 'a+1'];
    const pending = loadPromptSequence(list, sources, async (prompt) => {
        calls.push(prompt.value);
        if (prompt.value === 'clear') await waiting;
    });
    expect(calls).toEqual(['clear']);
    expect(prompts.map((prompt) => prompt.value)).toEqual(['clear']);
    release();
    await pending;
    expect(calls).toEqual(sources);
    expect(prompts.map((prompt) => prompt.value)).toEqual([...sources, '']);
    expect(prompts[0]!.focusInput).toHaveBeenCalledTimes(1);
    expect(sources).toEqual(['clear', 'a=1', 'a+1']);
});

test('supports synchronous evaluators and leaves empty input unevaluated', async () => {
    const { list, prompts } = listFixture();
    const evaluate = jest.fn((_prompt: CommandPrompt) => {});
    await loadPromptSequence(list, ['a=1', ''], evaluate);
    expect(evaluate).toHaveBeenCalledTimes(1);
    await loadPromptSequence(list, [], evaluate);
    expect(prompts).toHaveLength(1);
    expect(prompts[0]!.value).toBe('');
    expect(evaluate).toHaveBeenCalledTimes(1);
});
