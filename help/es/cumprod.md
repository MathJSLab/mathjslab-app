- `Y = cumprod(X)`
- `Y = cumprod(X, DIM)`

Producto acumulado de elementos a lo largo de la dimensión `DIM`.

Si se omite `DIM`, el valor predeterminado es la primera dimensión no singular.
Por ejemplo:

> > `cumplir([1, 2; 3, 4; 5, 6])`

> > `%[1, 2; 3, 8; 15, 48]%`

Véase también: `prod`, `cumsum`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/cumprod.html
- https://octave.sourceforge.io/octave/function/cumprod.html
