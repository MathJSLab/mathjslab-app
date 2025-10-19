- `M = cummin (X)`
- `M = cummin (X, DIM)`
- `[M, IM] = cummin (...)`

Devuelve los valores mínimos acumulativos a lo largo de la dimensión `DIM`.

Si no se especifica `DIM`, el valor predeterminado es la operación en columnas.
Por ejemplo:

> > `cummin ([5, 4, 6, 2, 3, 1])`

> > `%[5, 4, 4, 2, 2, 1]%`

Si se llama con dos argumentos de salida, el índice del valor mínimo también se
devuelve.

> > `[M, IM] = cummin ([5, 4, 6, 2, 3, 1])`

> > `%M = [5, 4, 4, 2, 2, 1]%`

> > `%IM = [1, 2, 2, 4, 4, 6]%`

Véase también: `cummax`, `min`, `max`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/cummin.html
- https://octave.sourceforge.io/octave/function/cummin.html
- https://mathworld.wolfram.com/Minimum.html
- https://es.wikipedia.org/wiki/Extremos_de_una_funci%C3%B3n
