<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="images/mathjslab-logo.svg" alt="logo" width="200" height="200" /></a>
</p>

# [MathJSLab](https://mathjslab.com/) - [mathjslab.com](https://mathjslab.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/6cec5ea5-c2dd-4b90-a3c1-ff95c8d1f521/deploy-status)](https://app.netlify.com/sites/mathjslab-app/deploys)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-app/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/MathJSLab/mathjslab-app/tree/main)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmathjslab.com%2F)](https://mathjslab.com/)
[![GitHub Created At](https://img.shields.io/github/created-at/MathJSLab/mathjslab-app)](https://github.com/MathJSLab/mathjslab-app)
[![MIT License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/MathJSLab/mathjslab-app/blob/main/LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.8396263.svg)](https://doi.org/10.5281/zenodo.8396263)
[![ISBN](https://img.shields.io/badge/ISBN-978--65--00--84828--1-green?style=flat&link=https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
[![OpenAIRE](https://img.shields.io/badge/OpenAIRE-blue?style=flat&link=https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)](https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)
[![jsDelivr hits](https://img.shields.io/jsdelivr/gh/hy/MathJSLab/mathjslab-app)](https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-app/)

> An [interpreter](https://en.wikipedia.org/wiki/Interpreter_(computing)) with language syntax like [MATLAB&reg;](https://www.mathworks.com/)/[Octave](https://www.gnu.org/software/octave/) written in [TypeScript](https://www.typescriptlang.org/).

**[ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)**

This is a demo application of [MathJSLab](https://www.npmjs.com/package/mathjslab) [npm package](https://en.wikipedia.org/wiki/Npm). See this demo on the project page at [mathjslab.com](https://mathjslab.com/). The repository is in the
[MathJSLab Organization](https://github.com/MathJSLab) on
[GitHub](https://github.com/).

**Important Notice:** This software, the **[MathJSLab](https://mathjslab.com/),
is not affiliated, sponsored, or endorsed by [The MathWorks, Inc.](https://www.mathworks.com/)**
[MATLAB&reg;](https://www.mathworks.com/products/matlab.html) is a registered
trademark of [The MathWorks, Inc.](https://www.mathworks.com/) For more
information about [MATLAB](https://www.mathworks.com/products/matlab.html), visit
[www.mathworks.com](https://www.mathworks.com/).

This [application](https://en.wikipedia.org/wiki/Web_application), developed
as a [Progressive Web App (PWA)](https://pt.wikipedia.org/wiki/Progressive_web_app),
demonstrates the capabilities of the
[MathJSLab](https://www.npmjs.com/package/mathjslab) package in a modern and
interactive environment. The
[application](https://en.wikipedia.org/wiki/Web_application)'s interface is
structured with [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components),
ensuring modularity, encapsulation, and efficient reuse of visual elements,
which simplifies maintenance and enhances project scalability. In addition,
the [application](https://en.wikipedia.org/wiki/Web_application) adopts a
[responsive design](https://en.wikipedia.org/wiki/Responsive_web_design),
providing a consistent experience, regardless of the device used, allowing
it to adapt to different screen sizes without compromising usability.

The [application](https://en.wikipedia.org/wiki/Web_application)'s logic is
written in [TypeScript](https://www.typescriptlang.org/), ensuring uniform and
standardized typing across all parts of the code.
[Styling](https://www.w3.org/TR/css/) is managed through
[SASS](https://sass-lang.com/) templates, with definitions in a more
rationalized and modular way, facilitating the customization, maintenance and
code reuse easier.

This demo application also uses:

* [MathJax](https://www.mathjax.org/) for navigators without [MathML](https://www.w3.org/Math/) support.
* [Marked](https://www.npmjs.com/package/marked) to format [Markdown](https://www.markdownguide.org/) files as [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML).
* [Plotly.js](https://plotly.com/javascript/) to generate plots, histograms and 3D graphics.
* [Mermaid](https://mermaid.js.org/) to generate charts and diagrams.

## Contributing

To contribute to this project see our
[contributing guidelines](https://github.com/MathJSLab/mathjslab-app/blob/main/CONTRIBUTING.md).

Join the community chat:

[![Join the chat at https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Build scripts

The following build scripts are defined:

1. **Before building** `mathjslab-app`, to **initialize** the project workspace, run:
```bash
npm run update
```
This will update the dependencies and install all of them, preparing any
resources needed to build the project.

2. **Format** and **lint** `mathjslab-app` code:
```bash
npm run format:lint
```

3. Build `mathjslab-app` in **development mode**:
```bash
npm run build:dev
```

4. Build `mathjslab-app` in **debug mode**:
```bash
npm run build:debug
```

5. Build `mathjslab-app` in **production mode**:
```bash
npm run build:prod
```

6. To **cleanup** all build files in workspace use:
```bash
npm run clean
```

7. To **delete dependencies**, the `package-lock.json` file and `node_modules`
directory too, use:
```bash
npm run clean:all
```
After run this command you will need to do workspace setup running
`npm run update` again.

## Community

Join the community chat:

[![Join the chat at https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Trademark Notes

- [MATLAB&reg;](https://www.mathworks.com/products/matlab.html) is a registered trademark of [The MathWorks, Inc.](https://www.mathworks.com/)
- [MathJSLab](https://mathjslab.com/) is not affiliated, sponsored, or endorsed by [The MathWorks, Inc.](https://www.mathworks.com/)

## License

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
