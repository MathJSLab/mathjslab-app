- `M = max (X)`
- `M = max (X, [], DIM)`
- `[M, IM] = max (X)`
- `M = max (X, Y)`

Encuentra los valores máximos en la matriz `X`.

Para un vector como argumento, devuelve el valor máximo. Para una matriz como
argumento, devuelve un vector de fila con el valor máximo de cada columna. Para
una matriz multidimensional, `max` opera a lo largo de la primera dimensión no
singular.

Si el tercer argumento opcional `DIM` está presente, opera a lo largo de esta
dimensión. En este caso, el segundo argumento se ignora y debe definirse como
una matriz vacía.

Para dos entradas (`X` e `Y`), devuelve el máximo del par según las reglas de
broadcasting.

Por eso,

> > `max (max (X))`

devuelve el elemento más grande de la matriz 2-D `X` y

> > `max (2:5, pi)`

> > %%[3.1416, 3.1416, 4, 5]%%

compara cada elemento en el rango `2:5` con `pi` y devuelve un vector de fila
de los valores máximos.

Para argumentos complejos, la magnitud de los elementos se utiliza para
comparar. Si las magnitudes son idénticas, los resultados se ordenan por ángulo
de fase en el rango (-pi, pi). Por lo tanto,

> > `max ([-1 i 1 -i])`

> > %%-1%%

porque todas las entradas tienen magnitud 1, pero -1 tiene el ángulo de fase
más grande con valor pi.

Si se llama con un argumento de entrada y dos argumentos de salida, `max`
también devuelve el primer índice de los valores máximos. Por eso,

> > `[x, ix] = max ([1, 3, 5, 2, 5])`

> > %%x = 5%%

> > %%ix = 3%%

Véase también: `min`, `cummax`, `cummin`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/max.html
- https://octave.sourceforge.io/octave/function/max.html
- https://mathworld.wolfram.com/Maximum.html
- https://es.wikipedia.org/wiki/Extremos_de_una_funci%C3%B3n
