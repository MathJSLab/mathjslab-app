import { type NodeInput, type NodeExpr, type NodeIdentifier, type BuiltInFunctionTable, CharString, ComplexDecimal, AST } from 'mathjslab';
import { insertOutput } from './outputFunction';
import { PlotEngine } from './PlotEngine';
import { openFileDialog } from './openFileDialog';
import { Markdown } from './Markdown';
import { appEngine } from './appEngine';

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

const externalFunctionTable: BuiltInFunctionTable = {
    ...PlotEngine.externalFunctionTable,

    summation: {
        type: 'BUILTIN',
        mapper: false,
        ev: [false, true, true, false],
        func: (variable: NodeIdentifier, start: ComplexDecimal, end: ComplexDecimal, expr: NodeExpr): ComplexDecimal => {
            if (!start.im.eq(0)) throw new Error('complex number sum index');
            if (!end.im.eq(0)) throw new Error('complex number sum index');
            let result: ComplexDecimal = ComplexDecimal.zero();
            const sum_function_name = `summation_${globalThis.crypto.randomUUID()}`;
            appEngine.evaluator.localTable[sum_function_name] = {};
            for (let i = start.re.toNumber(); i <= end.re.toNumber(); i++) {
                appEngine.evaluator.localTable[sum_function_name][variable.id] = ComplexDecimal.create(i, 0);
                result = ComplexDecimal.add(result, appEngine.evaluator.Evaluator(expr, true, sum_function_name));
            }
            delete appEngine.evaluator.localTable[sum_function_name];
            return result;
        },
        unparserMathML: (tree: NodeInput): string => {
            return (
                '<mstyle displaystyle="true"><munderover><mo>&sum;</mo><mrow>' +
                appEngine.evaluator.unparserMathML(tree.args[0]) +
                '<mo>=</mo>' +
                appEngine.evaluator.unparserMathML(tree.args[1]) +
                '</mrow><mrow>' +
                appEngine.evaluator.unparserMathML(tree.args[2]) +
                '</mrow>' +
                '</munderover>' +
                appEngine.evaluator.unparserMathML(tree.args[3]) +
                '</mstyle>'
            );
        },
    },

    productory: {
        type: 'BUILTIN',
        mapper: false,
        ev: [false, true, true, false],
        func: (variable: NodeIdentifier, start: ComplexDecimal, end: ComplexDecimal, expr: NodeExpr): ComplexDecimal => {
            if (!start.im.eq(0)) throw new Error('complex number prod index');
            if (!end.im.eq(0)) throw new Error('complex number prod index');
            let result: ComplexDecimal = ComplexDecimal.one();
            const prod_function_name = `productory_${globalThis.crypto.randomUUID()}`;
            appEngine.evaluator.localTable[prod_function_name] = {};
            for (let i = start.re.toNumber(); i <= end.re.toNumber(); i++) {
                appEngine.evaluator.localTable[prod_function_name][variable.id] = ComplexDecimal.create(i, 0);
                result = ComplexDecimal.mul(result, appEngine.evaluator.Evaluator(expr, true, prod_function_name));
            }
            delete appEngine.evaluator.localTable[prod_function_name];
            return result;
        },
        unparserMathML: (tree: NodeInput): string => {
            return (
                '<mstyle displaystyle="true"><munderover><mo>&prod;</mo><mrow>' +
                appEngine.evaluator.unparserMathML(tree.args[0]) +
                '<mo>=</mo>' +
                appEngine.evaluator.unparserMathML(tree.args[1]) +
                '</mrow><mrow>' +
                appEngine.evaluator.unparserMathML(tree.args[2]) +
                '</mrow>' +
                '</munderover>' +
                appEngine.evaluator.unparserMathML(tree.args[3]) +
                '</mstyle>'
            );
        },
    },

    open: {
        type: 'BUILTIN',
        mapper: false,
        ev: [true],
        func: (url?: CharString): NodeExpr => {
            const promptEntry = appEngine.shell.commandShell.element.promptSet.currentPrompt;
            if (url) {
                if (appEngine.shell.isFileProtocol) {
                    promptEntry.element.frameBox.className = 'bad';
                    promptEntry.element.output.innerHTML = 'open function unavailable <b>offline</b>.';
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
                            promptEntry.element.frameBox.className = 'bad';
                            promptEntry.element.output.innerHTML = `open: error loading ${url.str}`;
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
        mapper: false,
        ev: [true],
        func: (url?: CharString): NodeExpr => {
            const promptEntry = appEngine.shell.commandShell.element.promptSet.currentPrompt;
            if (url) {
                if (appEngine.shell.isFileProtocol) {
                    promptEntry.element.frameBox.className = 'bad';
                    promptEntry.element.output.innerHTML = 'markdown function unavailable <b>offline</b>.';
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
                            promptEntry.element.frameBox.className = 'doc';
                            promptEntry.element.output.innerHTML = Markdown.parse(responseFile);
                            Markdown.typeset(promptEntry.element.output);
                        })
                        /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
                        .catch((error) => {
                            promptEntry.element.frameBox.className = 'bad';
                            promptEntry.element.output.innerHTML = `markdown: error loading ${url.str}`;
                        });
                }
                return AST.nodeIndexExpr(AST.nodeIdentifier('markdown'), AST.nodeList([url.str]));
            } else {
                openFileDialog((content: string) => {
                    promptEntry.element.frameBox.className = 'doc';
                    promptEntry.element.output.innerHTML = Markdown.parse(content);
                    Markdown.typeset(promptEntry.element.output);
                }, openFileOptionMarkdown);
                return AST.nodeIndexExpr(AST.nodeIdentifier('markdown'), AST.nodeListFirst());
            }
        },
    },

    load: {
        type: 'BUILTIN',
        mapper: false,
        ev: [true],
        func: (...url: CharString[]): NodeExpr => {
            const promptEntry = appEngine.shell.commandShell.element.promptSet.currentPrompt;
            const loadContent = (content: string, name: string) => {
                let error: boolean = false;
                let errorMessage: string = '';
                insertOutput.type = '';
                promptEntry.element.output.innerHTML = '';
                try {
                    const tree = appEngine.evaluator.Parse(content);
                    if (tree) {
                        appEngine.evaluator.Evaluate(tree);
                    }
                } catch (e) {
                    error = true;
                    errorMessage = `load: error loading ${name}: ${e}`;
                }
                if (error) {
                    promptEntry.element.frameBox.className = 'bad';
                    promptEntry.element.output.innerHTML = errorMessage;
                } else {
                    promptEntry.element.frameBox.className = 'good';
                    promptEntry.element.output.innerHTML = `Loaded script from ${name}</ br>`;
                }
                appEngine.shell.commandShell.refreshNameList();
            };
            if (url.length > 0) {
                if (appEngine.shell.isFileProtocol) {
                    promptEntry.element.frameBox.className = 'bad';
                    promptEntry.element.output.innerHTML = 'load function unavailable <b>offline</b>.';
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
                                promptEntry.element.frameBox.className = 'bad';
                                promptEntry.element.output.innerHTML = `load: error loading ${file.str}`;
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
