import { Evaluator } from 'mathjslab';
import { Shell } from './Shell';

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
    evaluator: Evaluator;
    shell: Shell;
    openFile: () => void;
    waitFor: (getter: () => unknown | null | undefined, callback: (obj: unknown) => void, interval: number, maxAttempts: number) => void;
};

const appConfiguration: AppConfiguration = {};

const appEngine: AppEngine = {
    config: appConfiguration,
    lang: '',
    setLanguage: () => {},
    buildMessage: '',
    evaluator: null as unknown as Evaluator,
    shell: null as unknown as Shell,
    openFile: () => {},
    waitFor: () => {},
};

(globalThis as any).appEngine = appEngine;
(globalThis as any).appConfiguration = appConfiguration;

export type { AppConfiguration, AppEngine };
export { appConfiguration, appEngine };
export default { appConfiguration, appEngine };
