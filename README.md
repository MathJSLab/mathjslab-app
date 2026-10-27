<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="https://mathjslab.com/images/mathjslab-logo.svg" alt="logo" width="200" height="200" /></a>
</p>

# [MathJSLab](https://mathjslab.com/) - [mathjslab.com](https://mathjslab.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/6cec5ea5-c2dd-4b90-a3c1-ff95c8d1f521/deploy-status)](https://app.netlify.com/sites/mathjslab-app/deploys)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmathjslab.com%2F)](https://mathjslab.com/)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-app/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/MathJSLab/mathjslab-app/tree/main)
[![GitHub Created At](https://img.shields.io/github/created-at/MathJSLab/mathjslab-app)](https://github.com/MathJSLab/mathjslab-app)
[![MIT License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/MathJSLab/mathjslab-app/blob/main/LICENSE)
[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.8396263-blue?style=flat&link=https://doi.org/10.5281/zenodo.8396263)](https://doi.org/10.5281/zenodo.8396263)
[![ISBN](https://img.shields.io/badge/ISBN-978--65--00--84828--1-green?style=flat&link=https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
[![OpenAIRE](https://img.shields.io/badge/OpenAIRE-blue?style=flat&link=https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)](https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)
[![jsDelivr hits](https://img.shields.io/jsdelivr/gh/hy/MathJSLab/mathjslab-app)](https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-app/)

> An interactive environment for numerical computing and educational Markdown,
> powered by `mathjslab` and `mathjslab-markdown`.

**[ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)**

English | [Español](LEAME.md) | [Português](LEIAME.md)

`mathjslab-app` is the browser application at
[mathjslab.com](https://mathjslab.com/). It combines a command prompt and
script editor with numerical computation, interactive plots and educational
documents. The interface and example menus are available in English, Spanish
and Portuguese.

## Packages and architecture

The application integrates two independently maintained npm packages:

- [`mathjslab`](https://github.com/MathJSLab/mathjslab) implements the
  interpreter with MATLAB®/Octave-like syntax, numerical evaluation, resumable
  sessions and plot requests.
- [`mathjslab-markdown`](https://github.com/MathJSLab/mathjslab-markdown)
  implements Markdown rendering, the `<markdown-document>` Web Component,
  document navigation, resource handling and educational extensions. Reusable
  Markdown APIs and engine development belong in that package.

This repository owns the application interface, prompt, editor, language and
theme selection, example menus and browser adapters. It configures the Markdown
engine, the MathJSLab Worker and Plotly rendering through package entry points,
without maintaining a local copy of the Markdown engine.

The application uses TypeScript, Web Components and Sass. Eleventy generates
localized pages and example scripts; Webpack builds the browser bundles and
copies the package's HDL runtime assets. The responsive interface is delivered
as a Progressive Web App (PWA).

See the [application architecture](doc/application/architecture.md) and
[Markdown integration guide](doc/application/markdown-integration.md). For
reusable components and APIs in other projects, consult the
[package documentation](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/README.md).

## Documents and examples

Use `markdown(url)` to open a remote document, `markdown()` to select a local
file, or `help` to browse interpreter documentation. Documents can combine
mathematics, executable MathJSLab code and plots with diagrams, maps, music,
molecular and 3D visualizations, and HDL examples through the package's
educational extensions. Some resources require a network connection; HDL
execution has its own runtime and authorization requirements described in the
[HDL guide](doc/application/hdl-validation.md).

The catalogue contains **486 example templates**, including **107 Markdown
entries per interface language**: 106 localized documents from
`mathjslab-markdown` and the shared Digital Electronics book entry. Numerical
examples cover linear algebra, statistics, programming, signal processing,
numerical methods and graphics. In all three interface languages, Digital
Electronics opens the **Portuguese contents**.

The [example catalogue guide](example/README.md) describes the organization and
coverage audit. Educational document URLs point to the Markdown repository's
`main` branch; updating the installed package does not pin those remote
documents to the package version.

## Downloads of the [`mathjslab` package from the `npm` registry](https://www.npmjs.com/package/mathjslab) and [hits via the `jsdelivr` CDN](https://www.jsdelivr.com/package/npm/mathjslab)

[![NPM Downloads](https://img.shields.io/npm/d18m/mathjslab)](https://www.npmjs.com/package/mathjslab)
[![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hy/mathjslab)](https://www.jsdelivr.com/package/npm/mathjslab)

## Contributing

To contribute to this project see our
[contributing guidelines](https://github.com/MathJSLab/mathjslab-app/blob/main/CONTRIBUTING.md).

## Development and validation

Use a supported Node.js version and npm. `npm run update` updates dependency
ranges, installs packages, synchronizes shared organization resources and
prepares build helpers. To install the versions already recorded in the
lockfile, use `npm ci`; this does not replace organization resource setup.

| Command                    | Purpose                                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `npm run update`           | Update dependencies and prepare the workspace                                                                         |
| `npm run format:lint`      | Format files and run ESLint with fixes                                                                                |
| `npm run build:dev`        | Start the development server                                                                                          |
| `npm run build:debug`      | Start the development server with debug configuration                                                                 |
| `npm run build:prod`       | Generate the production build                                                                                         |
| `npm test`                 | Prepare assets; check documentation, catalogue coverage and types; run unit, infrastructure and Markdown facade tests |
| `npm run test:examples`    | Generate and execute examples in all three languages                                                                  |
| `npm run install:browsers` | Install Chromium, Firefox and WebKit for Playwright                                                                   |
| `npm run test:browser:all` | Build and run the browser integration matrix                                                                          |
| `npm run clean`            | Remove generated build files                                                                                          |
| `npm run clean:all`        | Also remove synchronized resources, dependencies and the lockfile; run update afterwards                              |

`npm run do:all` runs the complete cleanup, dependency update, formatting,
lint, build and standard validation cycle, then stages, commits and pushes
repository changes to GitHub through `git:all`. It stops at the first failure
and does not publish npm packages. Preview the sequence without executing it:

```sh
npm run do:all -- --dry-run
```

See the [maintenance workflow](doc/application/maintenance.md) and
[test guide](test/README.md) (in Portuguese) for focused commands, optional
native HDL and live map checks, and browser prerequisites.

## Community

Join the community chat:

[![Join the chat at https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Trademark Notes

- [MATLAB&reg;](https://www.mathworks.com/products/matlab.html) is a registered
  trademark of [The MathWorks, Inc.](https://www.mathworks.com/)
- [MathJSLab](https://mathjslab.com/) is not affiliated, sponsored, or endorsed
  by [The MathWorks, Inc.](https://www.mathworks.com/)

## License

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
