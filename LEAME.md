<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="https://mathjslab.com/images/mathjslab-logo.svg" alt="logo" width="200" height="200" /></a>
</p>

# [MathJSLab](https://mathjslab.com/) - [mathjslab.com](https://mathjslab.com/)

[![Estado Netlify](https://api.netlify.com/api/v1/badges/6cec5ea5-c2dd-4b90-a3c1-ff95c8d1f521/deploy-status)](https://app.netlify.com/sites/mathjslab-app/deploys)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/MathJSLab/mathjslab-app/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/MathJSLab/mathjslab-app/tree/main)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmathjslab.com%2F)](https://mathjslab.com/)
[![Creado en GitHub en](https://img.shields.io/github/created-at/MathJSLab/mathjslab-app)](https://github.com/MathJSLab/mathjslab-app)
[![Licencia MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/MathJSLab/mathjslab-app/blob/main/LICENSE)
[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.8396263-blue?style=flat&link=https://doi.org/10.5281/zenodo.8396263)](https://doi.org/10.5281/zenodo.8396263)
[![ISBN](https://img.shields.io/badge/ISBN-978--65--00--84828--1-green?style=flat&link=https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
[![OpenAIRE](https://img.shields.io/badge/OpenAIRE-blue?style=flat&link=https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)](https://explore.openaire.eu/search/advanced/research-outcomes?f0=q&fv0=MathJSLab)
[![Acceso a través de jsDelivr](https://img.shields.io/jsdelivr/gh/hy/MathJSLab/mathjslab-app)](https://cdn.jsdelivr.net/gh/MathJSLab/mathjslab-app/)

> Un entorno interactivo de cálculo numérico y Markdown educativo, basado en
> `mathjslab` y `mathjslab-markdown`.

**[ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)**

[English](README.md) | Español | [Português](LEIAME.md)

`mathjslab-app` es la aplicación web disponible en
[mathjslab.com](https://mathjslab.com/). Combina una consola de comandos y un
editor de programas con cálculo numérico, gráficos interactivos y documentos
educativos. La interfaz y los menús de ejemplos están disponibles en inglés,
español y portugués.

## Paquetes y arquitectura

La aplicación integra dos paquetes npm mantenidos de forma independiente:

- [`mathjslab`](https://github.com/MathJSLab/mathjslab) implementa el
  intérprete con sintaxis similar a MATLAB®/Octave, la evaluación numérica, las
  sesiones reanudables y las solicitudes de gráficos.
- [`mathjslab-markdown`](https://github.com/MathJSLab/mathjslab-markdown)
  implementa la renderización Markdown, el Web Component `<markdown-document>`,
  la navegación de documentos, la gestión de recursos y las extensiones
  educativas. Las API Markdown reutilizables y el desarrollo del motor
  corresponden a ese paquete.

Este repositorio mantiene la interfaz, la consola, el editor, la selección de
idioma y tema, los menús de ejemplos y los adaptadores del navegador. Configura
el motor Markdown, el Worker de MathJSLab y la renderización con Plotly
mediante los puntos de entrada de los paquetes, sin mantener una copia local
del motor Markdown.

La aplicación utiliza TypeScript, Web Components y Sass. Eleventy genera las
páginas y los programas de ejemplo localizados; Webpack compila los bundles del
navegador y copia los recursos de ejecución HDL del paquete. La interfaz
adaptable se distribuye como una aplicación web progresiva (PWA).

Consulte la [arquitectura de la aplicación](doc/application/architecture.md) y
la [guía de integración Markdown](doc/application/markdown-integration.md) (en
inglés). Para utilizar componentes y API reutilizables en otros proyectos,
consulte la
[documentación del paquete](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/README.md).

## Documentos y ejemplos

Use `markdown(url)` para abrir un documento remoto, `markdown()` para
seleccionar un archivo local o `help` para consultar la documentación del
intérprete. Los documentos pueden combinar matemáticas, código MathJSLab
ejecutable y gráficos con diagramas, mapas, música, visualizaciones moleculares
y 3D y ejemplos HDL mediante las extensiones educativas del paquete. Algunos
recursos requieren conexión a Internet; la ejecución HDL tiene requisitos
propios de runtime y autorización descritos en la
[guía HDL](doc/application/hdl-validation.md) (en inglés).

El catálogo contiene **486 plantillas de ejemplos**, incluidas **107 entradas
Markdown por idioma de la interfaz**: 106 documentos localizados de
`mathjslab-markdown` y la entrada compartida del libro de Electrónica Digital.
Los ejemplos numéricos abarcan álgebra lineal, estadística, programación,
procesamiento de señales, métodos numéricos y gráficos. En los tres idiomas de
la interfaz, Electrónica Digital abre el **índice en portugués**.

La [guía del catálogo de ejemplos](example/README.md) (en inglés) describe la
organización y la auditoría de cobertura. Las URL de los documentos educativos
apuntan a la rama `main` del repositorio Markdown; actualizar el paquete
instalado no fija esos documentos remotos a la versión del paquete.

## Descargas del [paquete `mathjslab` desde el registro `npm`](https://www.npmjs.com/package/mathjslab) y [accesos a través del CDN `jsdelivr`](https://www.jsdelivr.com/package/npm/mathjslab)

[![NPM Downloads](https://img.shields.io/npm/d18m/mathjslab)](https://www.npmjs.com/package/mathjslab)
[![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hy/mathjslab)](https://www.jsdelivr.com/package/npm/mathjslab)

## Contribuyendo

Para contribuir a este proyecto, consulte nuestras
[pautas de contribución](https://github.com/MathJSLab/mathjslab-app/blob/main/CONTRIBUTING.md).

## Desarrollo y validación

Utilice una versión compatible de Node.js y npm. `npm run update` actualiza los
rangos de dependencias, instala los paquetes, sincroniza los recursos
compartidos de la organización y prepara las herramientas de compilación. Para
instalar las versiones registradas en el lockfile, use `npm ci`; esto no
sustituye la preparación de los recursos de la organización.

| Comando                    | Propósito                                                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run update`           | Actualizar dependencias y preparar el entorno de trabajo                                                                                            |
| `npm run format:lint`      | Formatear archivos y ejecutar ESLint con correcciones                                                                                               |
| `npm run build:dev`        | Iniciar el servidor de desarrollo                                                                                                                   |
| `npm run build:debug`      | Iniciar el servidor de desarrollo con configuración de depuración                                                                                   |
| `npm run build:prod`       | Generar la compilación de producción                                                                                                                |
| `npm test`                 | Preparar recursos; verificar documentación, cobertura del catálogo y tipos; ejecutar pruebas unitarias, de infraestructura y de la fachada Markdown |
| `npm run test:examples`    | Generar y ejecutar los ejemplos en los tres idiomas                                                                                                 |
| `npm run install:browsers` | Instalar Chromium, Firefox y WebKit para Playwright                                                                                                 |
| `npm run test:browser:all` | Compilar y ejecutar la matriz de integración en navegadores                                                                                         |
| `npm run clean`            | Eliminar archivos de compilación generados                                                                                                          |
| `npm run clean:all`        | Eliminar también recursos sincronizados, dependencias y lockfile; ejecutar update después                                                           |

`npm run do:all` ejecuta el ciclo completo de limpieza, actualización de
dependencias, formato, lint, compilación y validación estándar; después prepara
los cambios, crea el commit y los envía a GitHub mediante `git:all`. Se detiene
ante el primer fallo y no publica paquetes npm. Consulte la secuencia sin
ejecutarla:

```sh
npm run do:all -- --dry-run
```

Consulte el [proceso de mantenimiento](doc/application/maintenance.md) (en
inglés) y la [guía de pruebas](test/README.md) (en portugués) para conocer los
comandos específicos, las verificaciones opcionales de HDL nativo y mapas en
línea, y los requisitos de los navegadores.

## Comunidad

Únase al chat de la comunidad:

[![Únase al chat en https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Notas sobre Marcas Registradas

- [MATLAB&reg;](https://www.mathworks.com/products/matlab.html) es una marca
  registrada de [The MathWorks, Inc.](https://www.mathworks.com/)
- [MathJSLab](https://mathjslab.com/) no está afiliado, patrocinado ni
  respaldado por [The MathWorks, Inc.](https://www.mathworks.com/)

## Licencia

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
