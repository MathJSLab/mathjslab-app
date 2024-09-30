<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="images/mathjslab-logo.svg" alt="logo" width="200" height="200" /></a>
</p>

# [MathJSLab](https://mathjslab.com/) - [mathjslab.com](https://mathjslab.com/)

[![Estado Netlify](https://api.netlify.com/api/v1/badges/b5d64f05-80e8-4cc6-b428-923447f43621/deploy-status)](https://app.netlify.com/sites/mathjslab/deploys)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-calculator/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/MathJSLab/mathjslab-calculator/tree/main)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmathjslab.com%2F)](https://mathjslab.com/)
[![Creado en GitHub en](https://img.shields.io/github/created-at/MathJSLab/mathjslab-calculator)](https://github.com/MathJSLab/mathjslab-calculator)
[![Licencia MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/MathJSLab/mathjslab-calculator/blob/main/LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.8396263.svg)](https://doi.org/10.5281/zenodo.8396263)
[![ISBN](https://img.shields.io/badge/ISBN-978--65--00--84828--1-green?style=flat&link=https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
[![Acceso jsDelivr](https://data.jsdelivr.com/v1/package/gh/MathJSLab/mathjslab-calculator/badge)](https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-calculator/)

> Un intérprete con sintaxis de lenguaje como [MATLAB&reg;](https://www.mathworks.com/)/[Octave](https://www.gnu.org/software/octave/) escrito en [Typescript](https://www.typescriptlang.org/).

**[ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)**

Esta es una aplicación de demostración del [paquete npm](https://es.wikipedia.org/wiki/Npm) [MathJSLab](https://www.npmjs.com/package/mathjslab). Vea esta demostración en la página del proyecto en [mathjslab.com](https://mathjslab.com/). El repositorio está en la [Organización MathJSLab](https://github.com/MathJSLab) en [GitHub](https://github.com/).

Obtenga una versión minimizada de un [CDN](https://es.wikipedia.org/wiki/Red_de_distribuci%C3%B3n_de_contenidos).
Para insertar la [demostración de MathJSLab](https://github.com/MathJSLab/mathjslab-calculator) en una página web usando [CDN jsDelivr](https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-calculator/)
copie el siguiente código [HTML](https://developer.mozilla.org/es/docs/Web/HTML):

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

Para que los ejemplos y el comando `help` estén disponibles, es necesario
copiar los directorios `example` y `help` a la raíz de la página web.

Otra opción es configurar para usar directamente desde
[repositorio](https://github.com/MathJSLab/mathjslab-calculator) vía
[CDN jsDelivr](https://www.jsdelivr.com/) también antes de cargar `mathjslab-calculator.min.js` script usando:

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
    <div id="mathjslab-calculator"></div>
    ...
</body>
```

Esta demostración también utiliza:

* [MathJax](https://www.mathjax.org/) para navegadores sin soporte [MathML](https://www.w3.org/Math/).
* [Marked](https://www.npmjs.com/package/marked) para formatear archivos [Markdown](https://www.markdownguide.org/) como [HTML](https://developer.mozilla.org/es/docs/Web/HTML).
* [Plotly.js](https://plotly.com/javascript/) para generar gráficos, histogramas e gráficos 3D.
* [Mermaid](https://mermaid.js.org/) para generar grafos y diagramas.

## Contribuyendo

Para contribuir a este proyecto, consulte nuestras
[pautas de contribución](https://github.com/MathJSLab/mathjslab-calculator/blob/main/CONTRIBUTING.md).

Únase al chat de la comunidad:

[![Únase al chat en https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Scripts de compilación

Se definen los siguientes scripts de compilación:

1. **Antes de compilar** `mathjslab-calculator`, para **iniciar** el área de trabajo del proyecto, ejecute:
```bash
npm run update
```
Esto actualizará las dependencias y las instalará todas, preparando todo
recursos necesarios para compilar el proyecto.

2. Para **formatear** y aplicar la **herramienta lint** al código `mathjslab-calculator`, ejecute:
```bash
npm run format:lint
```

3. **Compile** `mathjslab-calculator` en **modo de desarrollo** usando:
```bash
npm run build:dev
```

4. **Compile** `mathjslab-calculator` en **modo de depuración** usando:
```bash
npm run build:debug
```

5. **Compile** `mathjslab-calculator` en **modo de producción** usando:
```bash
npm run build:prod
```

6. Para **eliminar** todos los archivos de compilación en el área de trabajo, use:
```bash
npm run clean
```

7. Para **eliminar también todas las dependencias**, en el archivo
`package-lock.json` y en el directorio `node_modules`, use:
```bash
npm run clean:all
```
Después de ejecutar este comando, deberá configurar el área de trabajo ejecutando `npm run update` nuevamente.

## Comunidad

Únase al chat de la comunidad:

[![Únase al chat en https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Licencia

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

