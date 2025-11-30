-- `TF = all (X)` -- `TF = all (X, DIM)`

Para un argumento vetorial, retorna verdadeiro (valor lógico `1`) se todos los
elementos del vetor frente a diferentes de cero.

Para un argumento matricial, retorna una línea vetor de unos y ceros lógicos,
onde cada elemento indica se todos los elementos de la columna correspondientes
a la matriz son diferentes de cero. Por ejemplo:

> > `all ([2, 3; 1, 0])`
> >
> > > `%[ 1, 0 ]%`

Se o parámetro opcional `DIM` fornecido, a função opera na dimensão `DIM`.

Veja também: `all`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/all.html
- https://octave.sourceforge.io/octave/function/all.html
