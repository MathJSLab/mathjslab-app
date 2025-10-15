- `Y = sumsq (X)`
- `Y = sumsq (X, DIM)`

Suma de los cuadrados de los elementos a lo largo de la dimensión `DIM`.

Si se omite `DIM`, el valor predeterminado es la primera dimensión no singular.

Esta función es conceptualmente equivalente a

> > `sum (x .* conj (x), dim)`

pero usa menos memoria y evita llamar a `conj` si `X` es real.

Véase también: `sum`, `prod`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/sumsq.html
- https://octave.sourceforge.io/octave/function/sumsq.html
