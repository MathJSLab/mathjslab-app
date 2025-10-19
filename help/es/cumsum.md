- `Y = cumsum(X)`
- `Y = cumsum(X, DIM)`

Suma acumulada de elementos a lo largo de la dimensión `DIM`.

Si se omite `DIM`, el valor predeterminado es la primera dimensión no singular.
Por ejemplo:

> > `cumsum ([1, 2; 3, 4; 5, 6])`

> > `%[1, 2; 4, 6; 9, 12]%`

Véase también: `sum`, `cumprod`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/cumsum.html
- https://octave.sourceforge.io/octave/function/cumsum.html
