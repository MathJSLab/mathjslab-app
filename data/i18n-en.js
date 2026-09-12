export default {
    locale: 'en',
    htmlLang: 'en',
    ogLocale: 'en_US',
    languageName: 'English',
    app: {
        title: 'MathJSLab',
        description: 'An interpreter with language syntax like MATLAB®/Octave. ISBN 978-65-00-82338-7.',
        noscript: 'JavaScript must be enabled to run MathJSLab.',
    },
    page: {
        titleHtml: '<a href="https://github.com/MathJSLab/mathjslab-app" target="_blank" rel="noopener">MathJSLab</a>',
        subtitleHtml:
            'An <a href="https://en.wikipedia.org/wiki/Interpreter_(computing)" target="_blank" rel="noopener">interpreter</a> with language syntax like <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a>',
        abstractHtml:
            'This is a demo application of the <a href="https://www.npmjs.com/package/mathjslab" target="_blank" rel="noopener">MathJSLab</a> <a href="https://en.wikipedia.org/wiki/Npm" target="_blank" rel="noopener">npm package</a> (<a href="https://github.com/MathJSLab/mathjslab" target="_blank" rel="noopener">repository</a>), an emulator of a subset of the <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a> language written completely in <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener">TypeScript</a>. This application is intended for educational purposes. See the <a href="#readme">notes</a> below for detailed information.',
        trademarkNoticeHtml:
            '<strong>Important Notice:</strong> This software, the <strong><a href="https://mathjslab.com/">MathJSLab</a>, is not affiliated, sponsored, or endorsed by <a href="https://www.mathworks.com/">The MathWorks, Inc.</a></strong> <a href="https://www.mathworks.com/products/matlab.html">MATLAB&reg;</a> is a registered trademark of <a href="https://www.mathworks.com/">The MathWorks, Inc.</a> For more information about <a href="https://www.mathworks.com/products/matlab.html">MATLAB</a>, visit <a href="https://www.mathworks.com/">www.mathworks.com</a>.',
        readmeFile: 'README.md',
        examples: 'Examples',
        openFile: 'Open...',
        readme: 'More Info',
        githubRepository: 'GitHub Repository',
        curriculum: 'Curriculum',
    },
    shell: {
        variables: 'Variables',
        evaluate: 'Evaluate',
        controlsLabel: 'Batch controls',
        modeControlsLabel: 'Workspace mode controls',
        modeLabel: 'Workspace',
        modes: {
            editorPrompts: 'Editor and prompts',
            prompts: 'Prompts only',
            editorOutput: 'Editor and batch output',
        },
        run: 'Run',
        clearOutput: 'Clear output',
        resetSample: 'Reset example',
        showCommandOutput: 'Show commands in output',
        status: {
            ready: 'Ready',
            finished: 'Finished: {count, plural, one {# statement} other {# statements}}',
            error: 'Finished with errors',
        },
    },
    output: {
        placeholder: 'Output will appear here.',
    },
    prompt: {
        ariaLabel: 'MathJSLab prompt',
        listAriaLabel: 'MathJSLab prompt list',
    },
    language: {
        menu: 'Language',
        label: 'Language selection',
    },
    theme: {
        dark: 'dark',
        light: 'light',
    },
    help: {
        unavailableOfflineHtml: 'help command unavailable <b>offline</b>.',
        tooManyInputs: 'help: function called with too many inputs',
        notFound: 'help: {topic} not found.',
    },
    error: {
        loadTextNetwork: 'loadText: Network error.',
    },
};
