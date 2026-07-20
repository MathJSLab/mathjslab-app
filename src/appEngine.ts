import { Interpreter } from 'mathjslab';
import { Shell } from './Shell';
import { Markdown } from './Markdown';

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
    openFile: () => {},
    Markdown,
};

(globalThis as any).appEngine = appEngine;
(globalThis as any).appConfiguration = appConfiguration;

export type { AppConfiguration, AppEngine };
export { Interpreter, appConfiguration, appEngine };
export default { Interpreter, appConfiguration, appEngine };
