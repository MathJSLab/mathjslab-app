import { Interpreter } from 'mathjslab';
import { Shell } from './Shell';
import { Markdown } from './Markdown';

type AppConfiguration = {
    exampleBaseUrl?: string;
    helpBaseUrl?: string;
    defaultLanguage?: string;
};

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
