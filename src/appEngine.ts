import { Interpreter } from 'mathjslab';
import { Shell } from './Shell';
import { Markdown } from './Markdown';
import type { CommandOutputTarget } from './CommandOutputTarget';

/**
 * Runtime configuration values injected by the page or build output.
 */
type AppConfiguration = {
    exampleBaseUrl?: string;
    helpBaseUrl?: string;
    defaultLanguage?: string;
};

/**
 * Shared application state used by UI components and external MathJSLab
 * commands.
 */
type AppEngine = {
    config: AppConfiguration;
    lang: string;
    setLanguage: (lang?: string) => void;
    buildMessage: string;
    interpreter: Interpreter;
    shell: Shell;
    commandOutputTarget: CommandOutputTarget | null;
    openFile: () => void;
    Markdown: typeof Markdown;
};

const appConfiguration: AppConfiguration = {};

/**
 * Global application engine instance exposed for browser integrations and
 * interactive commands.
 */
const appEngine: AppEngine = {
    config: appConfiguration,
    lang: '',
    setLanguage: () => {},
    buildMessage: '',
    interpreter: null as unknown as Interpreter,
    shell: null as unknown as Shell,
    commandOutputTarget: null,
    openFile: () => {},
    Markdown,
};

/**
 * Return the output destination of the command currently being evaluated.
 */
const getCommandOutputTarget = (): CommandOutputTarget => {
    if (!appEngine.commandOutputTarget) {
        throw new Error('no command output target is active');
    }
    return appEngine.commandOutputTarget;
};

/**
 * Make an output destination available to interpreter built-ins for the
 * duration of a synchronous evaluation.
 */
const withCommandOutputTarget = <T>(target: CommandOutputTarget, evaluate: () => T): T => {
    const previousTarget = appEngine.commandOutputTarget;
    appEngine.commandOutputTarget = target;
    try {
        return evaluate();
    } finally {
        appEngine.commandOutputTarget = previousTarget;
    }
};

(globalThis as any).appEngine = appEngine;
(globalThis as any).appConfiguration = appConfiguration;

export type { AppConfiguration, AppEngine };
export { Interpreter, appConfiguration, appEngine, getCommandOutputTarget, withCommandOutputTarget };
export default { Interpreter, appConfiguration, appEngine };
