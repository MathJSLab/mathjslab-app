- `I = eye (N)`
- `I = eye (M, N)`
- `I = eye ([M N])`

Devuelve la matriz de identidad.

Con un único argumento escalar `N`, devuelve una matriz identidad cuadrada
`N x N`.

Si se dan dos argumentos escalares `(M, N)`, `eye` los considera como el número
de filas y columnas. Si se da un vector con dos elementos, `eye` usa los
valores del elemento como el número de líneas y columnas, respectivamente. Por
ejemplo:

> > `eye (3)`

> > %%eye (3) = [1,0,0;0,1,0;0,0,1]%%

Todas las siguientes expresiones producen el mismo resultado:

> > `eye (2)`

> > `eye (2, 2)`

> > `eye (size ([1, 2; 3, 4]))`

Llamar a la función `eye` sin argumentos es equivalente a llamarla con el
argumento `1`. Cualquier dimensión negativa se trata como cero. Estos Las
definiciones impares son para compatibilidad con
[MATLAB&reg;](https://www.mathworks.com/)/[Octave](https://www.gnu.org/software/octave/).

Véase también: `ones`, `zeros`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/eye.html
- https://octave.sourceforge.io/octave/function/eye.html
- https://mathworld.wolfram.com/IdentityMatrix.html
- https://es.wikipedia.org/wiki/Matriz_identidad
