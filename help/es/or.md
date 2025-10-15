- `TF = or (X, Y)`
- `TF = or (X1, X2, ...)`

Devuelve el **OR** lógico de `X` e `Y`.

Esta función es equivalente a `X | Y`. Si se proporcionan más de dos
argumentos, el **OR** lógico se aplica de forma acumulativa de izquierda a
derecha:

> > `(...((X1 | X2) | X3) | ...)`

Véase también: `and`, `not`, `xor`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/or.html
- https://octave.sourceforge.io/octave/function/or.html
- https://mathworld.wolfram.com/OR.html
- https://es.wikipedia.org/wiki/Disyunci%C3%B3n_l%C3%B3gica
