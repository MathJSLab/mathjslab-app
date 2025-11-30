-- `TF = any (X)` -- `TF = any (X, DIM)`

Para un vector como argumento, devuelve verdadero (valor lógico `1`) si algún
elemento del vector es distinto de cero.

Para una matriz como argumento, devuelve un vector fila de unos y ceros
lógicos, donde cada elemento indica si alguno de los elementos de la columna
correspondiente de la matriz es distinto de cero. Por ejemplo:

> > `any (eye (2, 4))`

> > > `%[ 1, 1, 0, 0 ]%`

Si se proporciona el argumento opcional `DIM`, opera sobre la dimensión `DIM`.
Por ejemplo:

> > `any (eye (2, 4), 2)`

> > > `%[ 1; 1 ]`

Véase también: `all`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/any.html
- https://octave.sourceforge.io/octave/function/any.html
