<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="images/mathjslab-logo.svg" alt="logo" width="200" height="200" /></a>
</p>

# [MathJSLab](https://mathjslab.com/) - [mathjslab.com](https://mathjslab.com/)

[![Estado Netlify](https://api.netlify.com/api/v1/badges/6cec5ea5-c2dd-4b90-a3c1-ff95c8d1f521/deploy-status)](https://app.netlify.com/sites/mathjslab-app/deploys)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-app/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/MathJSLab/mathjslab-app/tree/main)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmathjslab.com%2F)](https://mathjslab.com/)
[![Criado no GitHub em](https://img.shields.io/github/created-at/MathJSLab/mathjslab-app)](https://github.com/MathJSLab/mathjslab-app)
[![Licença MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/MathJSLab/mathjslab-app/blob/main/LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.8396263.svg)](https://doi.org/10.5281/zenodo.8396263)
[![ISBN](https://img.shields.io/badge/ISBN-978--65--00--84828--1-green?style=flat&link=https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
[![OpenAIRE](https://img.shields.io/badge/OpenAIRE-blue?style=flat&link=https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)](https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)
[![Acessos via jsDelivr](https://img.shields.io/jsdelivr/gh/hy/MathJSLab/mathjslab-app)](https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-app/)

> Um [interpretador](https://pt.wikipedia.org/wiki/Interpretador) com sintaxe de linguagem tipo [MATLAB&reg;](https://www.mathworks.com/)/[Octave](https://www.gnu.org/software/octave/) escrito em [TypeScript](https://www.typescriptlang.org/).

**[ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)**

Este é um aplicativo de demonstração do [pacote npm](https://pt.wikipedia.org/wiki/Npm_(software)) [MathJSLab](https://www.npmjs.com/package/mathjslab). Veja esta demonstração na página do projeto em [mathjslab.com](https://mathjslab.com/). O repositório está na [Organização MathJSLab](https://github.com/MathJSLab) no [GitHub](https://github.com/).

**Aviso importante:** Este software, o **[MathJSLab](https://mathjslab.com/),
não é afiliado, patrocinado ou endossado por [The MathWorks, Inc.](https://www.mathworks.com/)**
[MATLAB&reg;](https://www.mathworks.com/products/matlab.html) é uma marca
registrada de [The MathWorks, Inc.](https://www.mathworks.com/) Para mais
informações sobre o [MATLAB](https://www.mathworks.com/products/matlab.html),
visite [www.mathworks.com](https://www.mathworks.com).

Esta [aplicação](https://pt.wikipedia.org/wiki/Aplica%C3%A7%C3%A3o_web), desenvolvida como uma [Aplicação Web Progressiva (PWA)](https://pt.wikipedia.org/wiki/Progressive_web_app), demonstra as capacidades do pacote [MathJSLab](https://www.npmjs.com/package/mathjslab) em um ambiente moderno e interativo. A interface da [aplicação](https://pt.wikipedia.org/wiki/Aplica%C3%A7%C3%A3o_web) é estruturada com [Web Components](https://developer.mozilla.org/pt-BR/docs/Web/API/Web_components), garantindo modularidade, encapsulamento e reutilização eficiente dos elementos visuais, o que facilita a manutenção e a escalabilidade do projeto. Além disso, a [aplicação](https://pt.wikipedia.org/wiki/Aplica%C3%A7%C3%A3o_web) adota um [design responsivo](https://pt.wikipedia.org/wiki/Web_design_responsivo), proporcionando uma experiência consistente, de forma independente do dispositivo que utilizar, permitindo que se adapte a diferentes tamanhos de tela sem comprometer a usabilidade.

A lógica da [aplicação](https://pt.wikipedia.org/wiki/Aplica%C3%A7%C3%A3o_web) é escrita em [TypeScript](https://www.typescriptlang.org/), tornando a tipagem uniforme e padronizada entre as partes do código. A [estilização](https://www.w3.org/TR/css/) é organizada por meio de templates [SASS](https://sass-lang.com/), com definições de maneira mais racionalizada e modular, facilitando a personalização, manutenção e reutilização do código.

Esta aplicação de demontração também usa:

* [MathJax](https://www.mathjax.org/) para navegadores sem suporte [MathML](https://www.w3.org/Math/).
* [Marked](https://www.npmjs.com/package/marked) para formatar arquivos [Markdown](https://www.markdownguide.org/) como [HTML](https://developer.mozilla.org/pt-BR/docs/Web/HTML).
* [Plotly.js](https://plotly.com/javascript/) para gerar gráficos, histogramas e gráficos 3D.
* [Mermaid](https://mermaid.js.org/) para gerar grafos e diagramas.

## Contribuindo

Para contribuir com este projeto, consulte nossas
[diretrizes de contribuição](https://github.com/MathJSLab/mathjslab-app/blob/main/CONTRIBUTING.md).

Participe do bate-papo da comunidade:

[![Participe do bate-papo em https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Scripts de compilação

Os seguintes scripts de compilação são definidos:

1. **Antes de compilar** `mathjslab-app`, para **iniciar** a área de trabalho do projeto, execute:
```bash
npm run update
```
Isso atualizará as dependências e instalará todas elas, preparando todos os
recursos necessários para compilar o projeto.

2. Para **formatar** e aplicar a **ferramenta de lint** no código do `mathjslab-app`, execute:
```bash
npm run format:lint
```

3. **Compile** o `mathjslab-app` no **modo de desenvolvimento** usando:
```bash
npm run build:dev
```

4. **Compile** o `mathjslab-app` no **modo de depuração** usando:
```bash
npm run build:debug
```

5. **Compile** o `mathjslab-app` no **modo de produção** usando:
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

## Notas de marcas registradas

- [MATLAB&reg;](https://www.mathworks.com/products/matlab.html) é uma marca registrada de [The MathWorks, Inc.](https://www.mathworks.com/)
- [MathJSLab](https://mathjslab.com/) não é afiliado, patrocinado ou endossado pela [The MathWorks, Inc.](https://www.mathworks.com/)

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
