- `N = numel (A)`
- `N = numel (A, IDX1, IDX2, ...)`

Devuelve el número de elementos del objeto `A`.

Opcionalmente, si se dan los índices `IDX1`, `IDX2`, ..., devuelve el Número de
elementos que resultarían de la indexación.

> > `A(IDX1, IDX2, ...)`

Tenga en cuenta que los índices no tienen por qué ser números escalares. Por
ejemplo,

> > `A = 1;`

> > `B = ones (2, 3);`

> > `numel(A,B)`

devolverá 6 ya que esta es la cantidad de formas de indexar con `B`. O el
índice puede ser la string `":"` que representa el operador de dos puntos. Por
ejemplo,

> > `A = ones (5, 3);`

> > `numel(A, 2, ":")`

devolverá 3 porque la segunda fila tiene tres entradas de columna.

Véase tambiém: `size`, `length`, `ndims`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/numel.html
- https://octave.sourceforge.io/octave/function/numel.html
