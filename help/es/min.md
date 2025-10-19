- `M = min (X)`
- `M = min (X, [], DIM)`
- `[M, IM] = min (X)`
- `M = min (X, Y)`

Encuentra valores mínimos en la matriz `X`.

Para un vector como argumento, devuelve el valor mínimo. Para una matriz como
argumento, devuelve un vector de fila con el valor mínimo de cada columna. Para
una matriz multidimensional, `min` opera a lo largo de la primera dimensión no
singular.

Si el tercer argumento opcional `DIM` está presente, opera a lo largo de esta
dimensión. En este caso, el segundo argumento se ignora y debe definirse como
una matriz vacía.

Para dos entradas (`X` e `Y`), devuelve el mínimo del par según las reglas de
broadcasting.

Por eso,

> > `min (min (X))`

devuelve el elemento más pequeño de la matriz 2-D `X` y

> > `min (2:5, pi)`

> > `%[2, 3, 3.1416, 3.1416]%`

compara cada elemento en el rango `2:5` con `pi` y devuelve un vector de fila
de los valores mínimos.

Para argumentos complejos, la magnitud de los elementos se utiliza para
comparar. Si las magnitudes son idénticas, entonces los resultados se ordenan
por el ángulo de fase en el intervalo (-pi, pi]. Por lo tanto,

> > `min ([-1 i 1 -i])`

> > `%-i%`

porque todas las entradas tienen magnitud 1, pero -i tiene el ángulo de fase
más pequeño con valor -pi/2.

Si se llama con un argumento de entrada y dos argumentos de salida, `min`
también devuelve el primer índice de los valores mínimos. Por eso,

> > `[x, ix] = min ([1, 3, 0, 2, 0])`

> > `%x = 0%`

> > `%ix = 3%`

Véase también: `max`, `cummin`, `cummax`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/min.html
- https://octave.sourceforge.io/octave/function/min.html
- https://mathworld.wolfram.com/Minimum.html
- https://es.wikipedia.org/wiki/Extremos_de_una_funci%C3%B3n
