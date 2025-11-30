- `Z = cross (X, Y)`
- `Z = cross (X, Y, DIM)`

Calcula el producto vectorial de dos vectores tridimensionales `X` e `Y`.

Si `X` e `Y` son matrices, el producto vectorial se aplica a lo largo de la
primera dimensión con tres elementos.

El argumento opcional `DIM` fuerza el cálculo del producto vectorial a lo largo
de la dimensión especificada. Se generará un error si la dimensión especificada
no tiene tres elementos.

Ejemplo de código:

> > `cross ([1, 1, 0], [0, 1, 1])`

> > `%[1 -1 1]%`

> > `cross (magic (3), eye (3), 2)`

> > `%[0,6,-1;-7,0,3;9,-4,0]%`

Véase también: `dot`, `curl`, `divergence`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/cross.html
- https://octave.sourceforge.io/octave/function/cross.html
