import { type NodeExpr, type BuiltInFunctionTable, CharString, AST } from 'mathjslab';
import { insertOutput } from './outputFunction';
import { PlotEngine } from './PlotEngine';
import { commonExternalFunctionTable } from './commonExternalFunctionTable';
import { openFileDialog } from './openFileDialog';
import { Markdown } from './Markdown';
import { appEngine, getCommandOutputTarget, withCommandOutputTarget } from './appEngine';

const openFileOptionMathJSLab: OpenFilePickerOptions & { multiple?: false | undefined } = {
    multiple: false,
    types: [
        {
            description: 'MathJSLab files',
            accept: { 'text/plain': ['.txt', '.m'] },
        },
    ],
    excludeAcceptAllOption: true,
};

const openFileOptionMarkdown: OpenFilePickerOptions & { multiple?: false | undefined } = {
    multiple: false,
    types: [
        {
            description: 'Markdown files',
            accept: { 'text/plain': ['.txt', '.md'] },
        },
    ],
    excludeAcceptAllOption: true,
};

/**
 * Browser-facing built-ins registered in addition to the core MathJSLab
 * function table.
 */
const externalFunctionTable: BuiltInFunctionTable = {
    ...PlotEngine.externalFunctionTable,

    ...commonExternalFunctionTable,

    open: {
        type: 'BUILTIN',
        id: 'open',
        mapper: false,
        ev: [true],
        func: (url?: CharString): NodeExpr => {
            const outputTarget = getCommandOutputTarget();
            if (url) {
                if (appEngine.shell.isFileProtocol) {
                    outputTarget.setState('bad');
                    outputTarget.setHTML('open function unavailable <b>offline</b>.');
                } else {
                    globalThis
                        .fetch(url.str)
                        .then((response) => {
                            if (response.ok) {
                                return response.text();
                            } else {
                                throw new URIError('Load error.');
                            }
                        })
                        .then((responseFile: string) => {
                            appEngine.shell.commandShell.load(responseFile);
                        })
                        /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
                        .catch((error) => {
                            outputTarget.setState('bad');
                            outputTarget.setHTML(`open: error loading ${url.str}`);
                        });
                }
                return AST.nodeIndexExpr(AST.nodeIdentifier('open'), AST.nodeList([url.str]));
            } else {
                openFileDialog((content: string) => {
                    appEngine.shell.commandShell.load(content);
                }, openFileOptionMathJSLab);
                return AST.nodeIndexExpr(AST.nodeIdentifier('open'), AST.nodeListFirst());
            }
        },
    },

    markdown: {
        type: 'BUILTIN',
        id: 'markdown',
        mapper: false,
        ev: [true],
        func: (url?: CharString): NodeExpr => {
            const outputTarget = getCommandOutputTarget();
            if (url) {
                if (appEngine.shell.isFileProtocol) {
                    outputTarget.setState('bad');
                    outputTarget.setHTML('markdown function unavailable <b>offline</b>.');
                } else {
                    globalThis
                        .fetch(url.str)
                        .then((response) => {
                            if (response.ok) {
                                return response.text();
                            } else {
                                throw new URIError('Load error.');
                            }
                        })
                        .then((responseFile: string) => {
                            outputTarget.setState('doc');
                            outputTarget.setHTML(Markdown.parse(responseFile));
                            Markdown.typeset(outputTarget.content);
                        })
                        /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
                        .catch((error) => {
                            outputTarget.setState('bad');
                            outputTarget.setHTML(`markdown: error loading ${url.str}`);
                        });
                }
                return AST.nodeIndexExpr(AST.nodeIdentifier('markdown'), AST.nodeList([url.str]));
            } else {
                openFileDialog((content: string) => {
                    outputTarget.setState('doc');
                    outputTarget.setHTML(Markdown.parse(content));
                    Markdown.typeset(outputTarget.content);
                }, openFileOptionMarkdown);
                return AST.nodeIndexExpr(AST.nodeIdentifier('markdown'), AST.nodeListFirst());
            }
        },
    },

    load: {
        type: 'BUILTIN',
        id: 'load',
        mapper: false,
        ev: [true],
        func: (...url: CharString[]): NodeExpr => {
            const outputTarget = getCommandOutputTarget();
            const loadContent = (content: string, name: string) => {
                let error: boolean = false;
                let errorMessage: string = '';
                insertOutput.type = '';
                outputTarget.clear();
                try {
                    withCommandOutputTarget(outputTarget, () => {
                        const tree = appEngine.interpreter.Parse(content);
                        if (tree) {
                            appEngine.interpreter.Evaluate(tree);
                        }
                    });
                } catch (e) {
                    error = true;
                    errorMessage = `load: error loading ${name}: ${e}`;
                }
                if (error) {
                    outputTarget.setState('bad');
                    outputTarget.setHTML(errorMessage);
                } else {
                    outputTarget.setState('good');
                    outputTarget.setHTML(`Loaded script from ${name}</ br>`);
                }
                appEngine.shell.commandShell.refreshNameList();
            };
            if (url.length > 0) {
                if (appEngine.shell.isFileProtocol) {
                    outputTarget.setState('bad');
                    outputTarget.setHTML('load function unavailable <b>offline</b>.');
                } else {
                    url.forEach((file: CharString) => {
                        globalThis
                            .fetch(file.str)
                            .then((response) => {
                                if (response.ok) {
                                    return response.text();
                                } else {
                                    throw new URIError('Load error.');
                                }
                            })
                            .then((responseFile: string) => {
                                loadContent(responseFile, file.str);
                            })
                            /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
                            .catch((error) => {
                                outputTarget.setState('bad');
                                outputTarget.setHTML(`load: error loading ${file.str}`);
                            });
                    });
                }
                return AST.nodeIndexExpr(AST.nodeIdentifier('load'), AST.nodeList([...url.map((url) => AST.nodeString(url.str))]));
            } else {
                openFileDialog((content: string) => {
                    loadContent(content, 'file');
                }, openFileOptionMathJSLab);
                return AST.nodeIndexExpr(AST.nodeIdentifier('load'), AST.nodeListFirst());
            }
        },
    },
};
export { externalFunctionTable };
export default { externalFunctionTable };
