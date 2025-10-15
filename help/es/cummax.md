- `M = cummax (X)`
- `M = cummax (X, DIM)`
- `[M, IM] = cummax (...)`

Devuelve los valores acumulativos máximos a lo largo de la dimensión `DIM`.

Si no se especifica `DIM`, el valor predeterminado es la operación en columnas.
Por ejemplo:

> > `cummax ([1, 3, 2, 6, 4, 5])`

> > %%[1, 3, 3, 6, 6, 6]%%

Si se llama con dos argumentos de salida, el índice del valor máximo también se
devuelve.

> > `[w, iw] = cummax ([1, 3, 2, 6, 4, 5])`

> > %%M = [1, 3, 3, 6, 6, 6]%%

> > %%IM = [1, 2, 2, 4, 4, 4]%%

Véase también: `cummin`, `max`, `min`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/cummax.html
- https://octave.sourceforge.io/octave/function/cummax.html
- https://mathworld.wolfram.com/Maximum.html
- https://es.wikipedia.org/wiki/Extremos_de_una_funci%C3%B3n
