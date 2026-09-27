/** @jest-environment-options {"url":"http://localhost/en/"} */
import { withCommandOutputTarget } from '../../src/appEngine';
import type { CommandOutputState, CommandOutputTarget } from '../../src/CommandOutputTarget';
import { externalFunctionTable } from '../../src/externalFunctionTable';

describe('markdown local file picker', () => {
    it('installs its button after the interpreter writes the expression result', async () => {
        const content = document.createElement('div');
        let state: CommandOutputState = 'default';
        const target: CommandOutputTarget = {
            content,
            setState: (next) => {
                state = next;
            },
            setHTML: (html) => {
                content.innerHTML = html;
            },
            setText: (text) => {
                content.textContent = text;
            },
            append: (...nodes) => content.append(...nodes),
            clear: () => content.replaceChildren(),
        };

        withCommandOutputTarget(target, () => {
            externalFunctionTable.markdown!.func();
            target.setText('interpreter result');
        });
        expect(content.querySelector('button')).toBeNull();

        await Promise.resolve();

        const button = content.querySelector('button');
        expect(button?.textContent).toMatch(/Markdown/);
        expect(state).toBe('info');
    });
});
