- `A = horzcat (ARRAY1, ARRAY2, ..., ARRAYN)`

Devuelve la concatenación horizontal de matrices de 'N' dimensiones, `ARRAY1`,
`ARRAY2`, ..., `ARRAYN` a lo largo de la dimensión 2.

Las matrices también se pueden concatenar horizontalmente utilizando la
sintaxis para crear nuevas matrices. Por ejemplo:

> > `A = [MATRIZ1, MATRIZ2, ...]`

Esta sintaxis es un poco más eficiente porque el analizador de MathJSLab puede
concatenar las matrices sin la sobrecarga de una llamada a función.

Véase también: `cat`, `vertcat`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/horzcat.html
- https://octave.sourceforge.io/octave/function/horzcat.html
