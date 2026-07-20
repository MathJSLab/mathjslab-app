import { type NodeInput, type NodeExpr, type NodeIdentifier, type BuiltInFunctionTable, CharString, ComplexDecimal, AST, Scope, CallFrame } from 'mathjslab';
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

/**
 * Browser-facing built-ins registered in addition to the core MathJSLab
 * function table.
 */
const externalFunctionTable: BuiltInFunctionTable = {
    ...PlotEngine.externalFunctionTable,

    summation: {
        type: 'BUILTIN',
        id: 'summation',
        mapper: false,
        ev: [false, true, true, false],
        func: (variable: NodeIdentifier, start: ComplexDecimal, end: ComplexDecimal, expr: NodeExpr): ComplexDecimal => {
            if (!start.im.eq(0)) throw new Error('complex number sum index');
            if (!end.im.eq(0)) throw new Error('complex number sum index');
            let result: ComplexDecimal = ComplexDecimal.zero();
            /* Create a local scope for the summation variable. */
            const sumScope = Scope.create(appEngine.interpreter.context.currentScope);
            /* Push the summation scope while evaluating the expression. */
            appEngine.interpreter.context.callStack!.push(new CallFrame(sumScope));
            for (let i = start.re.toNumber(); i <= end.re.toNumber(); i++) {
                const value = ComplexDecimal.create(i, 0);
                sumScope.defineName(variable.id, value);
                const evalResult = appEngine.interpreter.Evaluator(expr, sumScope) as ComplexDecimal;
                result = ComplexDecimal.add(result, evalResult);
            }
            /* Restore the call stack after evaluating the summation. */
            appEngine.interpreter.context.callStack!.pop();
            return result;
        },
        UnparserMathML: (tree: NodeInput): string => {
            return (
                '<mstyle displaystyle="true"><munderover><mo>&sum;</mo><mrow>' +
                appEngine.interpreter.UnparserMathML(tree.args[0]) +
                '<mo>=</mo>' +
                appEngine.interpreter.UnparserMathML(tree.args[1]) +
                '</mrow><mrow>' +
                appEngine.interpreter.UnparserMathML(tree.args[2]) +
                '</mrow>' +
                '</munderover>' +
                appEngine.interpreter.UnparserMathML(tree.args[3]) +
                '</mstyle>'
            );
        },
    },

    productory: {
        type: 'BUILTIN',
        id: 'productory',
        mapper: false,
        ev: [false, true, true, false],
        func: (variable: NodeIdentifier, start: ComplexDecimal, end: ComplexDecimal, expr: NodeExpr): ComplexDecimal => {
            if (!start.im.eq(0)) throw new Error('complex number prod index');
            if (!end.im.eq(0)) throw new Error('complex number prod index');
            let result: ComplexDecimal = ComplexDecimal.one();
            const context = appEngine.interpreter.context;
            /* Create a local scope for the product variable. */
            const localScope = Scope.create(context.currentScope);
            /* Push the product scope while evaluating the expression. */
            context.callStack!.push(new CallFrame(localScope));
            try {
                for (let i = start.re.toNumber(); i <= end.re.toNumber(); i++) {
                    /* Assign the iteration value inside the local scope. */
                    localScope.defineName(variable.id, ComplexDecimal.create(i, 0));
                    /* Evaluate the expression with the product scope active. */
                    const value = appEngine.interpreter.Evaluator(expr) as ComplexDecimal;
                    result = ComplexDecimal.mul(result, value);
                }
            } finally {
                /* Always restore the call stack, including error paths. */
                context.callStack!.pop();
            }
            return result;
        },
        UnparserMathML: (tree: NodeInput): string => {
            return (
                '<mstyle displaystyle="true"><munderover><mo>&prod;</mo><mrow>' +
                appEngine.interpreter.UnparserMathML(tree.args[0]) +
                '<mo>=</mo>' +
                appEngine.interpreter.UnparserMathML(tree.args[1]) +
                '</mrow><mrow>' +
                appEngine.interpreter.UnparserMathML(tree.args[2]) +
                '</mrow>' +
                '</munderover>' +
                appEngine.interpreter.UnparserMathML(tree.args[3]) +
                '</mstyle>'
            );
        },
    },

    open: {
        type: 'BUILTIN',
        id: 'open',
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
        id: 'markdown',
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
        id: 'load',
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
                    const tree = appEngine.interpreter.Parse(content);
                    if (tree) {
                        appEngine.interpreter.Evaluate(tree);
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
