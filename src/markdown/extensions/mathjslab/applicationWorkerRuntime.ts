import { Interpreter, type InterpreterConfig, type NodeInput } from 'mathjslab';
import { commonExternalFunctionTable } from '../../../commonExternalFunctionTable';
import { withActiveInterpreter } from '../../../InterpreterRuntime';
import { PlotEngine } from '../../../PlotEngine';
import { withPlotOutputCapture } from '../../../PlotOutputCapture';
import { serializeMathJSLabWorkerError, type MathJSLabWorkerExecutionResult, type MathJSLabWorkerOutput } from './workerProtocol';
import type { MathJSLabWorkerResources, MathJSLabWorkerRuntimeHandler, MathJSLabWorkerSession } from './workerRuntime';

const MAX_LOAD_DEPTH = 16;

const loadReferences = (source: string): string[] | undefined => {
    const match = /^\s*load\s*\(([\s\S]*)\)\s*;?\s*$/i.exec(source);
    if (!match) return undefined;
    const body = match[1]!.trim();
    if (!body) throw new Error('load requires at least one URL in a Markdown document');
    const references: string[] = [];
    let index = 0;
    while (index < body.length) {
        while (/\s/.test(body[index] ?? '')) index++;
        const quote = body[index];
        if (quote !== "'" && quote !== '"') throw new Error('load URLs must be string literals');
        index++;
        let value = '';
        let closed = false;
        while (index < body.length) {
            const character = body[index++]!;
            if (character !== quote) {
                if (quote === '"' && character === '\\' && index < body.length) value += body[index++]!;
                else value += character;
                continue;
            }
            if (body[index] === quote) {
                value += quote;
                index++;
                continue;
            }
            closed = true;
            break;
        }
        if (!closed) throw new Error('Unterminated URL in load');
        references.push(value);
        while (/\s/.test(body[index] ?? '')) index++;
        if (index === body.length) break;
        if (body[index] !== ',') throw new Error('load URLs must be separated by commas');
        index++;
    }
    return references;
};

const statementSources = (interpreter: Interpreter, source: string): string[] => {
    const lines = source.split(/\r?\n/);
    const tree = interpreter.Parse(source);
    if (!tree) return [];
    return tree.list.map((statement: NodeInput, index: number) => {
        const previous = tree.list[index - 1];
        const next = tree.list[index + 1];
        const startLine = lines[statement.start.line - 1] ?? '';
        const stopLine = lines[statement.stop.line - 1] ?? '';
        if (statement.stop.line === statement.start.line) {
            if ((!previous || previous.stop.line < statement.start.line) && (!next || next.start.line > statement.start.line)) return startLine;
            return startLine.substring(statement.start.column, statement.stop.column + 1);
        }
        const middle = statement.stop.line > statement.start.line + 1 ? `${lines.slice(statement.start.line, statement.stop.line - 1).join('\n')}\n` : '';
        const start = !previous || previous.stop.line < statement.start.line ? `${startLine}\n` : `${startLine.substring(statement.start.column)}\n`;
        const stop = !next || next.start.line > statement.start.line ? stopLine : stopLine.substring(0, statement.stop.column);
        return `${start}${middle}${stop}`.trim();
    });
};

const evaluationMarkup = (interpreter: Interpreter, input: NodeInput, evaluated: NodeInput): string => {
    const inputSource = interpreter.Unparse(input);
    const evaluatedSource = interpreter.Unparse(evaluated);
    if (inputSource === evaluatedSource) return `<table><tr><td>${interpreter.UnparseMathML(input)}</td></tr></table>`;
    const first = input.list[0];
    const evaluationSign = typeof first?.type === 'string' && first.type.endsWith('=') ? '&rArr;' : '=';
    return `<table><tr><td>${interpreter.UnparseMathML(input)}</td><td><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mo>${evaluationSign}</mo></math></td><td>${interpreter.UnparseMathML(evaluated)}</td></tr></table>`;
};

const createInterpreter = (): Interpreter => {
    const configuration: InterpreterConfig = { externalFunctionTable: { ...PlotEngine.externalFunctionTable, ...commonExternalFunctionTable } };
    return Interpreter.Create(configuration);
};

const createSession = (_context: unknown, resources: MathJSLabWorkerResources): MathJSLabWorkerSession => {
    const interpreter = createInterpreter();
    const evaluate = (statement: string): MathJSLabWorkerOutput[] =>
        withPlotOutputCapture(
            interpreter,
            (plots) => {
                const tree = interpreter.Parse(statement);
                if (!tree) return [];
                const evaluated = interpreter.Evaluate(tree);
                if (interpreter.exitStatus !== Interpreter.response.OK) throw new Error('MathJSLab evaluation failed');
                const outputs: MathJSLabWorkerOutput[] = [
                    { type: 'mathml' as const, markup: evaluationMarkup(interpreter, tree, evaluated) },
                    ...plots.map((request): MathJSLabWorkerOutput => ({ type: 'visualization', renderer: 'plotly', request, role: 'visualization' })),
                ];
                return outputs;
            },
            PlotEngine,
        ).value;
    const executeStatement = async (statement: string, depth = 0): Promise<MathJSLabWorkerOutput[]> => {
        const references = loadReferences(statement);
        if (!references) return evaluate(statement);
        if (depth >= MAX_LOAD_DEPTH) throw new Error(`load exceeded the maximum nesting depth (${MAX_LOAD_DEPTH})`);
        const outputs: MathJSLabWorkerOutput[] = [];
        for (const reference of references) {
            const source = await resources.readText(reference);
            for (const loadedStatement of statementSources(interpreter, source)) {
                const loadedOutputs = await executeStatement(loadedStatement, depth + 1);
                outputs.push(...loadedOutputs.filter((output) => output.type === 'visualization'));
            }
            outputs.push({ type: 'text', text: `Loaded script from ${reference}` });
        }
        return outputs;
    };
    return {
        parse: (source) => withActiveInterpreter(interpreter, () => statementSources(interpreter, source)),
        execute: async (statement): Promise<MathJSLabWorkerExecutionResult> => {
            try {
                return { status: 'success', state: 'good', outputs: await executeStatement(statement) };
            } catch (error) {
                return { status: 'error', state: 'bad', error: serializeMathJSLabWorkerError(error) };
            }
        },
        dispose: () => interpreter.Clear('all'),
    };
};

const mathMLInterpreter = createInterpreter();

export const applicationMathJSLabWorkerHandler: MathJSLabWorkerRuntimeHandler = {
    createSession,
    toMathML: (source, display) => withActiveInterpreter(mathMLInterpreter, () => mathMLInterpreter.ToMathML(source, display)),
};
