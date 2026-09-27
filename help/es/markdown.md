- `markdow(URL)`
- `markdown()`

Si se llama con un parámetro, carga el archivo Markdown desde la URL (absoluta
o relativa) y se muestra.

Si se llama sin parámetros, muestra un cuadro de diálogo para elegir el archivo
a abrir en el dispositivo.

Las siguientes extensiones están disponibles:

- Gráficos y diagramas [Mermaid](https://mermaid.js.org/) especificados en
  bloques de código con 'mermaid' especificado como lenguaje.
- Estructuras moleculares planas especificadas con
  [SMILES](https://en.wikipedia.org/wiki/Simplified_Molecular_Input_Line_Entry_System)
  en bloques de código que usan `smiles` como lenguaje.
- Expresiones MathJSLab convertidas a [MathML](https://www.w3.org/Math/): use
  <code>%expresión%</code> o la forma protegida ``%`expresión`%`` en línea;
  coloque expresiones multilínea entre líneas <code>%%</code> para mostrarlas
  como bloque.
- Expresiones TeX renderizadas por MathJax: use <code>$expresión$</code> o la
  forma protegida ``$`expresión`$`` en línea; use <code>$$</code> o un bloque
  de código con `math` como lenguaje para mostrarlas como bloque.
- Comandos MathJSLab ejecutados en secuencia en bloques de código que usan
  `mathjslab` como lenguaje. Los resultados, errores y gráficos se muestran en
  el propio documento.

````markdown
```mathjslab
x = linspace(0, 2*pi, 100);
plot(x, sin(x))
```
````

Véase también: `load`, `open`.

### Referencias

- https://www.markdownguide.org/
