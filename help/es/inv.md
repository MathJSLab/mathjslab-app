- `X = inv (A)`

Calcula la matriz inversa de la matriz cuadrada `A`.

En general, es mejor evitar calcular la inversa de una matriz. directamente.
Por ejemplo, es más rápido y preciso resolver sistemas de ecuaciones %%A*x =
b%% con `Y = A\b`, en lugar de `Y = inv (A) * b`.

Véase también: `ldivide`, `rdivide`, `pinv`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/inv.html
- https://octave.sourceforge.io/octave/function/inv.html
- https://mathworld.wolfram.com/MatrixInverse.html
- https://es.wikipedia.org/wiki/Matriz_invertible
