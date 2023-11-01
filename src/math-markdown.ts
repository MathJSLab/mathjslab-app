import $ from 'basic-dom-helper';

declare const marked: { parse: (text: string) => string };
declare const MathJax: { typeset: () => void };
declare const mermaid: { initialize: (config: any) => void };

export interface Resource {
    name: string;
    extendedName: string;
    linkURI?: string;
    scriptURI?: string;
    loaded: boolean;
}

export const ResourceTable: Record<string, Resource> = {
    mathjax: {
        name: 'mathjax',
        extendedName: 'MathJax',
        scriptURI: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js?config=TeX-MML-AM_CHTML',
        // scriptURI: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/latest.js?tex-svg.js',
        loaded: false,
    },
    marked: {
        name: 'marked',
        extendedName: 'Marked',
        scriptURI: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
        loaded: false,
    },
    chartjs: {
        /* homepage: https://www.chartjs.org/docs/latest/ */
        name: 'chartjs',
        extendedName: 'Chart.js',
        scriptURI: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
        loaded: false,
    },
    mermaid: {
        name: 'mermaid',
        extendedName: 'Mermaid',
        linkURI: 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/6.0.0/mermaid.css',
        scriptURI: 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/6.0.0/mermaid.js',
        loaded: false,
    },
};

export abstract class MathMarkdown {
    public static loadIfNeed(name: string, aditionalTest = true): void {
        if (!ResourceTable[name].loaded && aditionalTest) {
            if (!!ResourceTable[name].linkURI) {
                $.appendLinkToHeadSync(
                    ResourceTable[name].linkURI as string,
                    () => {
                        ResourceTable[name].loaded = true;
                    },
                    (error) => {
                        throw new URIError(`${ResourceTable[name].extendedName} didn't load correctly: ${error}`);
                    },
                );
            }
            if (!!ResourceTable[name].scriptURI) {
                $.appendScriptToHeadSync(
                    ResourceTable[name].scriptURI as string,
                    () => {
                        ResourceTable[name].loaded = true;
                    },
                    (error) => {
                        throw new URIError(`${ResourceTable[name].extendedName} didn't load correctly: ${error}`);
                    },
                );
            }
        }
    }

    public static initialize() {
        MathMarkdown.loadIfNeed('mathjax', !window.MathMLElement);
        MathMarkdown.loadIfNeed('marked');
        MathMarkdown.loadIfNeed('chartjs');
        MathMarkdown.loadIfNeed('mermaid');
    }

    public static replaceMath(text: string): string {
        let data = text;
        let replaced: boolean;
        const replace = (regexp: RegExp, display: 'inline' | 'block', quotelength: number) => {
            replaced = true;
            while (replaced) {
                const matched = regexp.exec(data);
                if (matched) {
                    const reference = matched[2];
                    data =
                        data.slice(0, matched.index) +
                        global.EvaluatorPointer.toMathML(reference, display) +
                        data.slice(matched.index + matched[2].length + quotelength);
                    replaced = true;
                } else {
                    replaced = false;
                }
            }
        };
        replace(/(\%\%\%)([^\%]+)(\%\%\%)/gm, 'block', 6);
        replace(/(\%\%)([^\%]+)(\%\%)/gm, 'inline', 4);
        return data;
    }

    public static processMarkdownCode(markdown: string, language: string, processor: (input: string) => string): string {
        const regexp: RegExp = new RegExp(`(\`\`\`${language}\*(\n|\r\n))([^\%]+)(\`\`\`(\n|\r\n))`, 'gm');
        let replaced: boolean;

        return processor(markdown);
    }

    public static md2html(text: string): string {
        return marked.parse(MathMarkdown.replaceMath(text));
    }

    public static typeset(): void {
        if (ResourceTable['mathjax'].loaded) {
            MathJax.typeset();
        }
    }
}
