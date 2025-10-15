- `TF = and (X, Y)`
- `TF = and (X1, X2, ...)`

Devuelve la operación lógica **AND** entre `X` e `Y`.

Esta función es equivalente a la sintaxis del operador `X & Y`. Si se dan más
de dos argumentos, se aplica la operación lógica **AND** acumulativamente de
izquierda a derecha:

> > `(...((X1 & X2) & X3) & ...)`

Véase también: `or`, `not`, `xor`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/and.html
- https://octave.sourceforge.io/octave/function/and.html
- https://mathworld.wolfram.com/AND.html
- https://es.wikipedia.org/wiki/Conjunci%C3%B3n_l%C3%B3gica
