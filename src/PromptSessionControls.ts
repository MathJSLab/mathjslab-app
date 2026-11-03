import { appEngine } from './appEngine';
import i18n from './i18n';

/** Mount locale-aware execution/cancellation controls; numeric settings use configure(). */
export function mountPromptSessionControls(container: HTMLElement): void {
    const root = document.createElement('fieldset');
    root.className = 'prompt-session-controls';
    const legend = document.createElement('legend');
    const state = document.createElement('output');
    state.setAttribute('aria-live', 'polite');
    state.dataset.promptSessionState = '';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.dataset.action = 'cancel-execution';
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.dataset.action = 'reset-workspace';
    const text = {
        en: {
            legend: 'Prompt session',
            cancel: 'Cancel execution',
            reset: 'Clear workspace',
            initializing: 'Initializing',
            idle: 'Ready',
            running: 'Running',
            waiting: 'Waiting',
            resetting: 'Resetting',
            disposed: 'Disposed',
        },
        pt: {
            legend: 'Sessão do prompt',
            cancel: 'Cancelar execução',
            reset: 'Limpar workspace',
            initializing: 'Inicializando',
            idle: 'Pronto',
            running: 'Executando',
            waiting: 'Aguardando',
            resetting: 'Reiniciando',
            disposed: 'Encerrada',
        },
        es: {
            legend: 'Sesión del prompt',
            cancel: 'Cancelar ejecución',
            reset: 'Vaciar workspace',
            initializing: 'Inicializando',
            idle: 'Listo',
            running: 'Ejecutando',
            waiting: 'Esperando',
            resetting: 'Reiniciando',
            disposed: 'Finalizada',
        },
    };
    const sync = () => {
        const labels = text[i18n.locale];
        const status = appEngine.promptSession.state;
        legend.textContent = labels.legend;
        cancel.textContent = labels.cancel;
        reset.textContent = labels.reset;
        state.value = labels[status];
        state.dataset.promptSessionState = status;
        cancel.disabled = status !== 'running' && status !== 'waiting';
        reset.disabled = status !== 'idle';
    };
    cancel.addEventListener('click', () => void appEngine.promptSession.interrupt());
    reset.addEventListener('click', () => void appEngine.shell.commandShell.restart());
    root.append(legend, state, cancel, reset);
    container.append(root);
    appEngine.promptSession.addEventListener('statechange', sync);
    i18n.addEventListener('languagechange', sync);
    sync();
}
