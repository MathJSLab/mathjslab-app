import { existsSync, readFileSync, statSync } from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';

const sourceRoot = path.resolve(process.cwd(), 'src');
const publicEntries = [
    'markdown-core.ts',
    'markdown-component.ts',
    'markdown-component-register.ts',
    'markdown-extensions.ts',
    'markdown-mathjslab.ts',
    'markdown-mathjslab-worker.ts',
    'markdown-document.ts',
];
const applicationModules = /(?:^|\/)(?:appEngine|evalInput|evalPrompt|InterpreterRuntime|PlotEngine|PlotOutputCapture|Markdown)\.ts$/;

const resolveLocalImport = (from: string, specifier: string): string | undefined => {
    if (!specifier.startsWith('.')) return undefined;
    const unresolved = path.resolve(path.dirname(from), specifier);
    const withoutJsExtension = unresolved.replace(/\.js$/, '');
    const candidates = [unresolved, `${unresolved}.ts`, `${unresolved}.tsx`, `${unresolved}.mts`, `${withoutJsExtension}.ts`, path.join(unresolved, 'index.ts')];
    const resolved = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile() && candidate.startsWith(`${sourceRoot}${path.sep}`));
    return resolved;
};

const moduleSpecifiers = (source: ts.SourceFile): string[] => {
    const specifiers: string[] = [];
    const addString = (node: ts.Expression | ts.TypeNode | undefined): void => {
        if (node && ts.isStringLiteral(node)) specifiers.push(node.text);
    };
    const visit = (node: ts.Node): void => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) addString(node.moduleSpecifier);
        else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) addString(node.arguments[0]);
        else if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'URL') addString(node.arguments?.[0]);
        else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) addString(node.argument.literal as ts.Expression);
        ts.forEachChild(node, visit);
    };
    visit(source);
    return specifiers;
};

const reachableSourceFiles = (entry: string): Set<string> => {
    const visited = new Set<string>();
    const visit = (file: string): void => {
        if (visited.has(file)) return;
        visited.add(file);
        const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        for (const specifier of moduleSpecifiers(source)) {
            const dependency = resolveLocalImport(file, specifier);
            if (dependency) visit(dependency);
        }
    };
    visit(path.join(sourceRoot, entry));
    return visited;
};

describe('App-independent Markdown entry points', () => {
    test.each(publicEntries)('%s has no transitive dependency on application runtime modules', (entry) => {
        const reachable = Array.from(reachableSourceFiles(entry), (file) => path.relative(sourceRoot, file).replace(/\\/g, '/'));
        expect(reachable.filter((file) => applicationModules.test(file))).toEqual([]);
    });
});
