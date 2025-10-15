- `B = reshape (A, M, N, ...)`
- `B = reshape (A, [M N ...])`
- `B = reshape (A, ..., [], ...)`
- `B = reshape (A, SIZE)`

Devuelve una matriz con las dimensiones especificadas `(M, N, ...)` cuyos
elementos se toman de la matriz `A`.

Se accede a los elementos de la matriz en orden de columna principal (como Se
almacenan matrices Fortran).

El siguiente código demuestra cómo transformar un vector de fila de 1x4 en un
Matriz cuadrada de 2x2.

> > `reformar([1, 2, 3, 4], 2, 2)`

> > %%[1, 3; 2, 4]%%

Tenga en cuenta que el número total de elementos en la matriz original ('prod
(tamaño (A))') debe coincidir con el número total de elementos en el nueva
matriz ('prod ([M N ...])').

Se puede dejar sin especificar una única dimensión de la matriz de retorno y su
tamaño se determinará automáticamente. Una matriz vacía ([]) se utiliza para
marcar una dimensión no especificada.

Véase tambiém: `resize`, `vec`, `postpad`, `cat`, `squeeze`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/reshape.html
- https://octave.sourceforge.io/octave/function/reshape.html
