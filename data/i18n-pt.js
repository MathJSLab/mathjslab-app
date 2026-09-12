export default {
    locale: 'pt',
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    languageName: 'Português',
    app: {
        title: 'MathJSLab',
        description: 'Um interpretador com sintaxe de linguagem como MATLAB®/Octave. ISBN 978-65-00-82338-7.',
        noscript: 'O JavaScript deve estar habilitado para executar o MathJSLab.',
    },
    page: {
        titleHtml: '<a href="https://github.com/MathJSLab/mathjslab-app" target="_blank" rel="noopener">MathJSLab</a>',
        subtitleHtml:
            'Um <a href="https://pt.wikipedia.org/wiki/Interpretador" target="_blank" rel="noopener">interpretador</a> com sintaxe de linguagem como o <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a>',
        abstractHtml:
            'Este é um aplicativo de demonstração do <a href="https://pt.wikipedia.org/wiki/Npm_(software)" target="_blank" rel="noopener">pacote npm</a> <a href="https://www.npmjs.com/package/mathjslab" target="_blank" rel="noopener">MathJSLab</a> (<a href="https://github.com/MathJSLab/mathjslab" target="_blank" rel="noopener">repositório</a>), um emulador de um subconjunto da linguagem <a href="https://www.mathworks.com/" target="_blank" rel="noopener">MATLAB&reg;</a>/<a href="https://www.gnu.org/software/octave/" target="_blank" rel="noopener">Octave</a> escrito completamente em <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener">TypeScript</a>. Este aplicativo é destinado a fins educacionais. Consulte as <a href="#readme">notas</a> abaixo para obter informações detalhadas.',
        trademarkNoticeHtml:
            '<strong>Aviso Importante:</strong> Este software, o <strong><a href="https://mathjslab.com/">MathJSLab</a>, não é afiliado, patrocinado ou endossado por <a href="https://www.mathworks.com/">The MathWorks, Inc.</a></strong> <a href="https://www.mathworks.com/products/matlab.html">MATLAB&reg;</a> é uma marca registrada de <a href="https://www.mathworks.com/">The MathWorks, Inc.</a> Para mais informações sobre o <a href="https://www.mathworks.com/products/matlab.html">MATLAB</a>, visite <a href="https://www.mathworks.com">www.mathworks.com</a>.',
        readmeFile: 'LEIAME.md',
        examples: 'Exemplos',
        openFile: 'Abrir...',
        readme: 'Mais Informações',
        githubRepository: 'Repositório GitHub',
        curriculum: 'Currículo Lattes',
    },
    shell: {
        variables: 'Variáveis',
        evaluate: 'Computar',
        controlsLabel: 'Controles do lote',
        modeControlsLabel: 'Controles do modo de trabalho',
        modeLabel: 'Área de trabalho',
        modes: {
            editorPrompts: 'Editor e prompts',
            prompts: 'Somente prompts',
            editorOutput: 'Editor e saída em lote',
        },
        run: 'Executar',
        clearOutput: 'Limpar saída',
        resetSample: 'Restaurar exemplo',
        showCommandOutput: 'Mostrar comandos na saída',
        status: {
            ready: 'Pronto',
            finished: 'Concluído: {count, plural, one {# comando} other {# comandos}}',
            error: 'Concluído com erros',
        },
    },
    output: {
        placeholder: 'A saída aparecerá aqui.',
    },
    prompt: {
        ariaLabel: 'Prompt do MathJSLab',
        listAriaLabel: 'Lista de prompts do MathJSLab',
    },
    language: {
        menu: 'Idioma',
        label: 'Seleção de idioma',
    },
    theme: {
        dark: 'escuro',
        light: 'claro',
    },
    help: {
        unavailableOfflineHtml: 'comando help indisponível <b>offline</b>.',
        tooManyInputs: 'help: função chamada com muitas entradas',
        notFound: 'help: {topic} não encontrado.',
    },
    error: {
        loadTextNetwork: 'loadText: Erro de rede.',
    },
};
