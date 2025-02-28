import importUMD from './importUMD';
import type * as PlotlyType from 'plotly.js';

type DynamicModuleConfiguration = {
    [key: string]: {
        module: unknown;
        import: Function;
        timeout: number;
    };
};

abstract class DynamicModule {
    protected static readonly configuration: DynamicModuleConfiguration = {
        marked: {
            module: null,
            import: () => importUMD('https://cdn.jsdelivr.net/npm/marked@latest/marked.min.js'),
            timeout: 0,
        },
        mathjax: {
            module: null,
            import: () => {
                return new Promise((resolve, reject) => {
                    try {
                        const script: HTMLScriptElement = document.createElement('script');
                        script.type = 'text/javascript';
                        script.async = false;
                        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
                        script.addEventListener('load', (ev) => {
                            resolve(globalThis.MathJax);
                        });
                        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
                        script.addEventListener('error', (ev) => {
                            reject(new URIError(`cannot load ${script.src}`));
                        });
                        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@latest/es5/tex-mml-chtml.js?config=TeX-MML-AM_CHTML';
                        document.head.appendChild(script);
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            timeout: 0,
        },
        plotly: {
            module: null,
            import: () => importUMD('https://unpkg.com/plotly.js-dist-min@latest/plotly.min.js') as Promise<typeof PlotlyType>,
            timeout: 10000,
        },
        mermaid: {
            module: null,
            /* @ts-expect-error load mermaid as a module */
            import: () => import('https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.esm.min.mjs').then((module) => module.default),
            timeout: 10000,
        },
    };

    private static setModuleTimeout(name: string): void {
        if (DynamicModule.configuration[name].timeout > 0) {
            setTimeout(() => {
                DynamicModule.configuration[name].module = null;
            }, DynamicModule.configuration[name].timeout);
        }
    }

    public static use(name: string, handler: (module: any) => void): void {
        if (DynamicModule.configuration[name].module) {
            handler(DynamicModule.configuration[name].module);
        } else {
            DynamicModule.configuration[name].import().then((module: any) => {
                DynamicModule.configuration[name].module = module;
                handler(module);
                DynamicModule.setModuleTimeout(name);
            });
        }
    }

    public static async load(name: string): Promise<any> {
        if (DynamicModule.configuration[name].module) {
            return new Promise((resolve) => {
                resolve(DynamicModule.configuration[name].module);
            });
        } else {
            return DynamicModule.configuration[name].import().then((module: any) => {
                DynamicModule.configuration[name].module = module;
                DynamicModule.setModuleTimeout(name);
                return new Promise((resolve) => {
                    resolve(module);
                });
            });
        }
    }

    public static unload(name: string): void {
        DynamicModule.configuration[name].module = null;
    }
}
export { type DynamicModuleConfiguration, DynamicModule };
export default DynamicModule;
