- `A = vertcat (ARRAY1, ARRAY2, ..., ARRAYN)`

Devuelve la concatenación vertical de matrices `N`-dimensionales,
`ARRAY1, ARRAY2, ..., ARRAYN` a lo largo de la dimensión 1.

Las matrices también se pueden concatenar verticalmente utilizando la sintaxis
para crear nuevas matrices. Por ejemplo:

> > `A = [MATRIZ1; MATRIZ2; ...]`

Esta sintaxis es un poco más eficiente porque el analizador de MathJSLab puede
concatenar las matrices sin la sobrecarga de una llamada a función.

Véase también: `cat`, `horzcat`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/vertcat.html
- https://octave.sourceforge.io/octave/function/vertcat.html
