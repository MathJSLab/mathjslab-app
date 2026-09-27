import type { MarkdownExtension } from '../../../MarkdownEngine';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import julia from 'highlight.js/lib/languages/julia';
import latex from 'highlight.js/lib/languages/latex';
import markdown from 'highlight.js/lib/languages/markdown';
import matlab from 'highlight.js/lib/languages/matlab';
import python from 'highlight.js/lib/languages/python';
import r from 'highlight.js/lib/languages/r';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { markedHighlight } from 'marked-highlight';
import { syntaxHighlightManifest } from './manifest';

const languages = { bash, cpp, csharp, css, go, java, javascript, json, julia, latex, markdown, matlab, python, r, rust, sql, typescript, xml };

const aliases: Record<string, keyof typeof languages> = {
    c: 'cpp',
    cs: 'csharp',
    cxx: 'cpp',
    html: 'xml',
    js: 'javascript',
    jsx: 'javascript',
    md: 'markdown',
    octave: 'matlab',
    py: 'python',
    rbash: 'bash',
    rs: 'rust',
    scss: 'css',
    shell: 'bash',
    sh: 'bash',
    ts: 'typescript',
    tsx: 'typescript',
};

for (const [name, definition] of Object.entries(languages)) {
    if (!hljs.getLanguage(name)) hljs.registerLanguage(name, definition);
}
for (const [alias, language] of Object.entries(aliases)) {
    if (!hljs.getLanguage(alias)) hljs.registerAliases(alias, { languageName: language });
}

export const syntaxHighlightExtension = (): MarkdownExtension => ({
    name: syntaxHighlightManifest.name,
    manifest: syntaxHighlightManifest,
    marked: markedHighlight({
        langPrefix: 'hljs language-',
        emptyLangClass: 'hljs',
        highlight(code, language) {
            if (!language || !hljs.getLanguage(language)) return code;
            return hljs.highlight(code, { language, ignoreIllegals: true }).value;
        },
    }),
});
