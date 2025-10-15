- `N = ndims (A)`

Devuelve el número de dimensiones de `A`.

Para cualquier array, el resultado siempre será mayor o igual a 2. Las
dimensiones singulares finales no se cuentan, es decir, las dimensiones finales
D mayor que 2 para lo cual 'size (A, D) = 1'.

> > `ndims (ones (4, 1, 2, 1))`

> > %%3%%

Véase también: `size`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/ndims.html
- https://octave.sourceforge.io/octave/function/ndims.html
