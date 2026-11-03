import { jest } from '@jest/globals';
import type { CommandOutputTarget } from '../../src/CommandOutputTarget';

jest.unstable_mockModule('../../src/appEngine', () => ({
    appEngine: {},
    withCommandOutputTarget: (_target: unknown, operation: () => unknown) => operation(),
}));
const { PromptSession } = await import('../../src/PromptSession');

function targetFixture(): CommandOutputTarget {
    const content = document.createElement('div');
    document.body.append(content);
    return {
        content,
        clear: () => content.replaceChildren(),
        setState: (state) => {
            content.dataset.state = state;
        },
        setText: (text) => {
            content.textContent = text;
        },
        setHTML: (markup) => {
            content.innerHTML = markup;
        },
        append: (...nodes) => content.append(...nodes),
    };
}

test('presentation failure reaches a terminal error state and allows the next command', async () => {
    const owner = new PromptSession({ aliasNameTable: {} });
    await owner.initialize();
    const target = targetFixture();
    const append = jest.spyOn(target, 'append');
    append.mockImplementationOnce(() => {
        throw new Error('renderer failed');
    });
    try {
        expect(await owner.execute('1+1', target)).toBe(false);
        expect(target.content.dataset.executionState).toBe('error');
        expect(target.content.textContent).toContain('renderer failed');
        expect(owner.state).toBe('idle');
        expect(await owner.execute('2+3', target)).toBe(true);
        expect(target.content.textContent).toContain('5');
    } finally {
        await owner.dispose();
        target.content.remove();
    }
});

test('reset rejection restores the controller guard and does not strand the workspace', async () => {
    const owner = new PromptSession({ aliasNameTable: {} });
    await owner.initialize();
    const session = (owner as unknown as { session: { reset: () => Promise<void> } }).session;
    jest.spyOn(session, 'reset').mockRejectedValueOnce(new Error('reset failed'));
    const target = targetFixture();
    try {
        await expect(owner.reset()).rejects.toThrow('reset failed');
        expect(owner.state).toBe('idle');
        expect(await owner.execute('3+4', target)).toBe(true);
        expect(target.content.textContent).toContain('7');
    } finally {
        await owner.dispose();
        target.content.remove();
    }
});
