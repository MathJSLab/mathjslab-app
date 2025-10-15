- `C = mtimes (A, B)`
- `C = mtimes (A1, A2, ...)`

Devuelve el producto de multiplicación matricial de las entradas.

Esta función y `A * B` son equivalentes. Si hay más argumentos datos, la
multiplicación se aplica acumulativamente de izquierda a derecha:

> > `(...((A1 * A2) * A3) * ...)`

Véase también: `times`, `plus`, `minus`, `rdivide`, `mrdivide`, `mldivide`,
`mpower`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/mtimes.html
- https://octave.sourceforge.io/octave/function/mtimes.html
- https://mathworld.wolfram.com/MatrixMultiplication.html
- https://es.wikipedia.org/wiki/Multiplicaci%C3%B3n_de_matrices
