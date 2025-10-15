- `markdow(URL)`
- `markdown()`

Si se llama con un parámetro, carga el archivo Markdown desde la URL (absoluta
o relativa) y se muestra.

Si se llama sin parámetros, muestra un cuadro de diálogo para elegir el archivo
a abrir en el dispositivo.

Las siguientes extensiones están disponibles:

- Gráficos y diagramas [Mermaid](https://mermaid.js.org/) especificados en
  bloques de código con 'mermaid' especificado como lenguaje.
- Expresiones MathJSLab convertidas a [MathML](https://www.w3.org/Math/). Las
  expresiones deben estar encerradas entre caracteres de porcentaje doble
  (\%\%) para expresiones 'inline' y caracteres de porcentaje triple (\%\%\%)
  para expresiones 'block' (atributo display).

Véase también: `load`, `open`.

### Referencias

- https://www.markdownguide.org/
