<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="https://mathjslab.com/images/mathjslab-logo.svg" alt="logo" width="200" height="200" /></a>
</p>

# [MathJSLab](https://mathjslab.com/) - [mathjslab.com](https://mathjslab.com/)

[![Estado Netlify](https://api.netlify.com/api/v1/badges/6cec5ea5-c2dd-4b90-a3c1-ff95c8d1f521/deploy-status)](https://app.netlify.com/sites/mathjslab-app/deploys)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-app/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/MathJSLab/mathjslab-app/tree/main)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmathjslab.com%2F)](https://mathjslab.com/)
[![Criado no GitHub em](https://img.shields.io/github/created-at/MathJSLab/mathjslab-app)](https://github.com/MathJSLab/mathjslab-app)
[![Licença MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/MathJSLab/mathjslab-app/blob/main/LICENSE)
[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.8396263-blue?style=flat&link=https://doi.org/10.5281/zenodo.8396263)](https://doi.org/10.5281/zenodo.8396263)
[![ISBN](https://img.shields.io/badge/ISBN-978--65--00--84828--1-green?style=flat&link=https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
[![OpenAIRE](https://img.shields.io/badge/OpenAIRE-blue?style=flat&link=https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)](https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)
[![Acessos via jsDelivr](https://img.shields.io/jsdelivr/gh/hy/MathJSLab/mathjslab-app)](https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-app/)

> Um ambiente interativo de cálculo numérico e Markdown educacional, baseado em
> `mathjslab` e `mathjslab-markdown`.

**[ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)**

[English](README.md) | [Español](LEAME.md) | Português

`mathjslab-app` é a aplicação web disponível em
[mathjslab.com](https://mathjslab.com/). Combina um prompt de comandos e um
editor de scripts com cálculo numérico, gráficos interativos e documentos
educacionais. A interface e os menus de exemplos estão disponíveis em inglês,
espanhol e português.

## Pacotes e arquitetura

A aplicação integra dois pacotes npm mantidos de forma independente:

- [`mathjslab`](https://github.com/MathJSLab/mathjslab) implementa o
  interpretador com sintaxe semelhante a MATLAB®/Octave, a avaliação numérica,
  as sessões retomáveis e as solicitações de gráficos.
- [`mathjslab-markdown`](https://github.com/MathJSLab/mathjslab-markdown)
  implementa a renderização Markdown, o Web Component `<markdown-document>`, a
  navegação de documentos, o gerenciamento de recursos e as extensões
  educacionais. As APIs Markdown reutilizáveis e o desenvolvimento do motor
  pertencem a esse pacote.

Este repositório mantém a interface, o prompt, o editor, a seleção de idioma e
tema, os menus de exemplos e os adaptadores do navegador. Configura o motor
Markdown, o Worker do MathJSLab e a renderização com Plotly pelos pontos de
entrada dos pacotes, sem manter uma cópia local do motor Markdown.

A aplicação utiliza TypeScript, Web Components e Sass. O Eleventy gera páginas
e scripts de exemplo localizados; o Webpack compila os bundles do navegador e
copia os recursos de execução HDL do pacote. A interface responsiva é
distribuída como uma aplicação web progressiva (PWA).

Consulte a [arquitetura da aplicação](doc/application/architecture.md) e o
[guia de integração Markdown](doc/application/markdown-integration.md) (em
inglês). Para utilizar componentes e APIs reutilizáveis em outros projetos,
consulte a
[documentação do pacote](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/README.md).

## Documentos e exemplos

Use `markdown(url)` para abrir um documento remoto, `markdown()` para
selecionar um arquivo local ou `help` para consultar a documentação do
interpretador. Os documentos podem combinar matemática, código MathJSLab
executável e gráficos com diagramas, mapas, música, visualizações moleculares e
3D e exemplos HDL por meio das extensões educacionais do pacote. Alguns
recursos exigem conexão com a Internet; a execução HDL tem requisitos próprios
de runtime e autorização descritos no
[guia HDL](doc/application/hdl-validation.md) (em inglês).

O catálogo contém **486 templates de exemplos**, incluindo **107 entradas
Markdown por idioma da interface**: 106 documentos localizados do
`mathjslab-markdown` e a entrada compartilhada do livro de Eletrônica Digital.
Os exemplos numéricos abrangem álgebra linear, estatística, programação,
processamento de sinais, métodos numéricos e gráficos. Nos três idiomas da
interface, Eletrônica Digital abre o **sumário em português**.

O [guia do catálogo de exemplos](example/README.md) (em inglês) descreve a
organização e a auditoria de cobertura. As URLs dos documentos educacionais
apontam para a branch `main` do repositório Markdown; atualizar o pacote
instalado não fixa esses documentos remotos à versão do pacote.

## Downloads do [pacote `mathjslab` no registro `npm`](https://www.npmjs.com/package/mathjslab) e [acessos pela CDN `jsdelivr`](https://www.jsdelivr.com/package/npm/mathjslab)

[![NPM Downloads](https://img.shields.io/npm/d18m/mathjslab)](https://www.npmjs.com/package/mathjslab)
[![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hy/mathjslab)](https://www.jsdelivr.com/package/npm/mathjslab)

## Contribuindo

Para contribuir com este projeto, consulte nossas
[diretrizes de contribuição](https://github.com/MathJSLab/mathjslab-app/blob/main/CONTRIBUTING.md).

## Desenvolvimento e validação

Utilize uma versão compatível do Node.js e o npm. `npm run update` atualiza as
faixas de dependências, instala os pacotes, sincroniza os recursos
compartilhados da organização e prepara as ferramentas de build. Para instalar
as versões já registradas no lockfile, use `npm ci`; isso não substitui a
preparação dos recursos da organização.

| Comando                    | Finalidade                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run update`           | Atualizar dependências e preparar a área de trabalho                                                                                         |
| `npm run format:lint`      | Formatar arquivos e executar ESLint com correções                                                                                            |
| `npm run build:dev`        | Iniciar o servidor de desenvolvimento                                                                                                        |
| `npm run build:debug`      | Iniciar o servidor de desenvolvimento com configuração de depuração                                                                          |
| `npm run build:prod`       | Gerar o build de produção                                                                                                                    |
| `npm test`                 | Preparar recursos; verificar documentação, cobertura do catálogo e tipos; executar testes unitários, de infraestrutura e da fachada Markdown |
| `npm run test:examples`    | Gerar e executar os exemplos nos três idiomas                                                                                                |
| `npm run install:browsers` | Instalar Chromium, Firefox e WebKit para Playwright                                                                                          |
| `npm run test:browser:all` | Compilar e executar a matriz de integração em navegadores                                                                                    |
| `npm run clean`            | Remover arquivos de build gerados                                                                                                            |
| `npm run clean:all`        | Remover também recursos sincronizados, dependências e lockfile; executar update depois                                                       |

`npm run do:all` executa o ciclo completo de limpeza, atualização de
dependências, formatação, lint, build e validação padrão; depois adiciona as
alterações, cria o commit e as envia ao GitHub por meio de `git:all`. O
processo para na primeira falha e não publica pacotes npm. Consulte a sequência
sem executá-la:

```sh
npm run do:all -- --dry-run
```

Consulte o [processo de manutenção](doc/application/maintenance.md) (em inglês)
e o [guia de testes](test/README.md) para os comandos específicos, as
verificações opcionais de HDL nativo e mapas online e os requisitos dos
navegadores.

## Comunidade

Participe do bate-papo da comunidade:

[![Participe do bate-papo em https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Notas de marcas registradas

- [MATLAB&reg;](https://www.mathworks.com/products/matlab.html) é uma marca
  registrada de [The MathWorks, Inc.](https://www.mathworks.com/)
- [MathJSLab](https://mathjslab.com/) não é afiliado, patrocinado ou endossado
  por [The MathWorks, Inc.](https://www.mathworks.com/)

## Licença

> [MIT License](https://opensource.org/license/mit)
>
> Copyright &copy; 2016-2026 [Sergio Lindau](mailto:sergiolindau@gmail.com),
> [mathjslab.com](https://mathjslab.com/),
> [ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
