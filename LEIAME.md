<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="images/mathjslab-logo.svg" alt="logo" width="200" height="200" /></a>
</p>

# [MathJSLab](https://mathjslab.com/) - [mathjslab.com](https://mathjslab.com/)

[![Estado Netlify](https://api.netlify.com/api/v1/badges/b5d64f05-80e8-4cc6-b428-923447f43621/deploy-status)](https://app.netlify.com/sites/mathjslab/deploys)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-calculator/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/MathJSLab/mathjslab-calculator/tree/main)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmathjslab.com%2F)](https://mathjslab.com/)
[![Criado no GitHub em](https://img.shields.io/github/created-at/MathJSLab/mathjslab-calculator)](https://github.com/MathJSLab/mathjslab-calculator)
[![Licença MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/MathJSLab/mathjslab-calculator/blob/main/LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.8396263.svg)](https://doi.org/10.5281/zenodo.8396263)
[![ISBN](https://img.shields.io/badge/ISBN-978--65--00--84828--1-green?style=flat&link=https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
[![Acessos via jsDelivr](https://img.shields.io/jsdelivr/gh/hy/MathJSLab/mathjslab-calculator)](https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-calculator/)

> Um interpretador com sintaxe de linguagem tipo [MATLAB&reg;](https://www.mathworks.com/)/[Octave](https://www.gnu.org/software/octave/) escrito em [Typescript](https://www.typescriptlang.org/).

**[ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)**

Este é um aplicativo de demonstração do [pacote npm](https://pt.wikipedia.org/wiki/Npm_(software)) [MathJSLab](https://www.npmjs.com/package/mathjslab). Veja esta demonstração na página do projeto em [mathjslab.com](https://mathjslab.com/). O repositório está na [Organização MathJSLab](https://github.com/MathJSLab) no [GitHub](https://github.com/).

Obtenha uma versão reduzida através de [CDN](https://pt.wikipedia.org/wiki/Rede_de_fornecimento_de_conte%C3%BAdo).
Para incorporar a [demonstração do MathJSLab](https://github.com/MathJSLab/mathjslab-calculator) em uma página da web usando [CDN jsDelivr](https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-calculator/)
copie o seguinte código [HTML](https://developer.mozilla.org/pt-BR/docs/Web/HTML):

```html
<head>
    ...
    <script defer src="https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-calculator/mathjslab-calculator.min.js"></script>
    ...
</head>

<body>
    ...
    <div id="mathjslab-examples"></div>
    ...
    <div id="mathjslab-prompt"></div>
    ...
</body>
```

Para que os exemplos e o comando `help` estejam disponíveis, é necessário
copiar os diretórios `example` e `help` para a raiz da página web.

Outra opção é configurar para usar diretamente do
[repositório](https://github.com/MathJSLab/mathjslab-calculator) via
[CDN jsDelivr](https://www.jsdelivr.com/) também, antes de carregar o script `mathjslab-calculator.min.js` usando:

```html
<head>
    ...
    <script>
        MathJSLabCalc = {
            exampleBaseUrl: "https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-calculator/",
            helpBaseUrl: "https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-calculator/",
        }
    </script>
    <script defer src="https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-calculator/mathjslab-calculator.min.js"></script>
    ...
</head>

<body>
    ...
    <div id="mathjslab-examples"></div>
    ...
    <div id="mathjslab-prompt"></div>
    ...
</body>
```

Esta aplicação de demontração também usa:

* [MathJax](https://www.mathjax.org/) para navegadores sem suporte [MathML](https://www.w3.org/Math/).
* [Marked](https://www.npmjs.com/package/marked) para formatar arquivos [Markdown](https://www.markdownguide.org/) como [HTML](https://developer.mozilla.org/pt-BR/docs/Web/HTML).
* [Plotly.js](https://plotly.com/javascript/) para gerar gráficos, histogramas e gráficos 3D.
* [Mermaid](https://mermaid.js.org/) para gerar grafos e diagramas.

## Contribuindo

Para contribuir com este projeto, consulte nossas
[diretrizes de contribuição](https://github.com/MathJSLab/mathjslab-calculator/blob/main/CONTRIBUTING.md).

Participe do bate-papo da comunidade:

[![Participe do bate-papo em https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Scripts de compilação

Os seguintes scripts de compilação são definidos:

1. **Antes de compilar** `mathjslab-calculator`, para **iniciar** a área de trabalho do projeto, execute:
```bash
npm run update
```
Isso atualizará as dependências e instalará todas elas, preparando todos os
recursos necessários para compilar o projeto.

2. Para **formatar** e aplicar a **ferramenta de lint** no código do `mathjslab-calculator`, execute:
```bash
npm run format:lint
```

3. **Compile** o `mathjslab-calculator` no **modo de desenvolvimento** usando:
```bash
npm run build:dev
```

4. **Compile** o `mathjslab-calculator` no **modo de depuração** usando:
```bash
npm run build:debug
```

5. **Compile** o `mathjslab-calculator` no **modo de produção** usando:
```bash
npm run build:prod
```

6. Para **apagar** todos os arquivos de compilação na área de trabalho, use:
```bash
npm run clean
```

7. Para também **excluir todas as dependências**, no arquivo
`package-lock.json` e no diretório `node_modules`, use:
```bash
npm run clean:all
```
Após executar este comando, você precisará fazer a configuração do espaço de trabalho executando
`npm run update` novamente.

## Comunidade

Participe do bate-papo da comunidade:

[![Participe do bate-papo em https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Licença

>[MIT License](https://opensource.org/license/mit)
>
>Copyright &copy; 2016-2024 [Sergio Lindau](mailto:sergiolindau@gmail.com), [mathjslab.com](https://mathjslab.com/), [ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
>
>Permission is hereby granted, free of charge, to any person obtaining a copy
>of this software and associated documentation files (the "Software"), to deal
>in the Software without restriction, including without limitation the rights
>to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>copies of the Software, and to permit persons to whom the Software is
>furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in all
>copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
>SOFTWARE.
