import { jest } from '@jest/globals';
const session = Object.assign(new EventTarget(), { state: 'idle', interrupt: jest.fn(async () => {}) });
const restart = jest.fn(async () => {});
const locale = Object.assign(new EventTarget(), { locale: 'pt' });
jest.unstable_mockModule('../../src/appEngine', () => ({ appEngine: { promptSession: session, shell: { commandShell: { restart } } } }));
jest.unstable_mockModule('../../src/i18n', () => ({ default: locale }));
const { mountPromptSessionControls } = await import('../../src/PromptSessionControls');

test('session controls expose execution actions without numeric selection or corrupted labels', () => {
    mountPromptSessionControls(document.body);
    const controls = document.querySelector('.prompt-session-controls')!;
    expect(controls.querySelector('legend')!.textContent).toBe('Sessão do prompt');
    expect(controls.textContent).not.toContain('\uFFFD');
    expect(controls.querySelectorAll('select, input')).toHaveLength(0);
    expect(controls.querySelectorAll('button')).toHaveLength(2);
    const cancel = controls.querySelector<HTMLButtonElement>('[data-action="cancel-execution"]')!;
    const reset = controls.querySelector<HTMLButtonElement>('[data-action="reset-workspace"]')!;
    expect(cancel.disabled).toBe(true);
    expect(reset.disabled).toBe(false);
    session.state = 'waiting';
    session.dispatchEvent(new Event('statechange'));
    expect(cancel.disabled).toBe(false);
    expect(reset.disabled).toBe(true);
    cancel.click();
    expect(session.interrupt).toHaveBeenCalledTimes(1);
    locale.locale = 'es';
    locale.dispatchEvent(new Event('languagechange'));
    expect(controls.querySelector('legend')!.textContent).toBe('Sesión del prompt');
});
