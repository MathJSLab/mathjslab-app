- `C = times (A, B)`
- `C = times (A1, A2, ...)`

Devuelve el producto de la multiplicación elemento por elemento de las
entradas.

Esta función y `A .* B` son equivalentes. Si se dan más argumentos, la
multiplicación se aplica acumulativamente de izquierda a derecha:

> > `(...((A1 .* A2) .* A3) .* ...)`

Véase también: `mtimes`, `rdivide`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/times.htm
- https://octave.sourceforge.io/octave/function/times.html
- https://mathworld.wolfram.com/Multiplication.html
- https://mathworld.wolfram.com/Times.html
- https://es.wikipedia.org/wiki/Multiplicaci%C3%B3n
