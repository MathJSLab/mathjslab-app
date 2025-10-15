- `VAL = ones (N)`
- `VAL = ones (M, N)`
- `VAL = ones (M, N, K, ...)`
- `VAL = ones ([M, N, ...])`

Devuelve una matriz N-dimensional cuyos elementos son todos 1.

Si se invoca con un único argumento entero escalar `N`, devuelve una matriz
cuadrada `N x N`.

Si se invoca con dos o más argumentos enteros escalares o un vector de valores
enteros, devuelve una matriz con las dimensiones dadas.

Para crear una matriz constante cuyos valores sean todos iguales, use una
expresión como

> > `val_matrix = val * ones (m, n)`

Véase también: `zeros`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/ones.html
- https://octave.sourceforge.io/octave/function/ones.html
