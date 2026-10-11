import { type NodeInput, type NodeExpr, type NodeIdentifier, type BuiltInFunctionTable, ComplexDecimal, Scope, CallFrame } from 'mathjslab';
import { getActiveInterpreter } from './InterpreterRuntime';

/**
 * External numerical functions shared by MathJSLab web applications.
 */
const commonExternalFunctionTable: BuiltInFunctionTable = {
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
            const sumScope = Scope.create(getActiveInterpreter().context.currentScope);
            /* Push the summation scope while evaluating the expression. */
            getActiveInterpreter().context.callStack!.push(new CallFrame(sumScope));
            try {
                for (let i = start.re.toNumber(); i <= end.re.toNumber(); i++) {
                    const value = ComplexDecimal.create(i, 0);
                    sumScope.defineName(variable.id, value);
                    const evalResult = getActiveInterpreter().Evaluator(expr, sumScope) as ComplexDecimal;
                    result = ComplexDecimal.add(result, evalResult);
                }
                /* Restore the call stack after evaluating the summation. */
            } finally {
                getActiveInterpreter().context.callStack!.pop();
            }
            return result;
        },
        UnparserMathML: (tree: NodeInput): string => {
            return (
                '<mstyle displaystyle="true"><munderover><mo>&sum;</mo><mrow>' +
                getActiveInterpreter().UnparserMathML(tree.args[0]) +
                '<mo>=</mo>' +
                getActiveInterpreter().UnparserMathML(tree.args[1]) +
                '</mrow><mrow>' +
                getActiveInterpreter().UnparserMathML(tree.args[2]) +
                '</mrow>' +
                '</munderover>' +
                getActiveInterpreter().UnparserMathML(tree.args[3]) +
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
            const context = getActiveInterpreter().context;
            /* Create a local scope for the product variable. */
            const localScope = Scope.create(context.currentScope);
            /* Push the product scope while evaluating the expression. */
            context.callStack!.push(new CallFrame(localScope));
            try {
                for (let i = start.re.toNumber(); i <= end.re.toNumber(); i++) {
                    /* Assign the iteration value inside the local scope. */
                    localScope.defineName(variable.id, ComplexDecimal.create(i, 0));
                    /* Evaluate the expression with the product scope active. */
                    const value = getActiveInterpreter().Evaluator(expr) as ComplexDecimal;
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
                getActiveInterpreter().UnparserMathML(tree.args[0]) +
                '<mo>=</mo>' +
                getActiveInterpreter().UnparserMathML(tree.args[1]) +
                '</mrow><mrow>' +
                getActiveInterpreter().UnparserMathML(tree.args[2]) +
                '</mrow>' +
                '</munderover>' +
                getActiveInterpreter().UnparserMathML(tree.args[3]) +
                '</mstyle>'
            );
        },
    },
};
export { commonExternalFunctionTable };
export default { commonExternalFunctionTable };
