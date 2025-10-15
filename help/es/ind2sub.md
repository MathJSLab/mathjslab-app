- `[S1, S2, ..., SN] = ind2sub (DIMS, IND)

Convierte índices lineales en subíndices.

El argumento `DIMS` es un vector de dimensión donde cada elemento tiene el
tamaño de la matriz en la dimensión respectiva (ver `size`). El segundo El
argumento `IND` contiene índices lineales que se van a convertir.

Las salidas `S1`, ..., `SN` contienen los subíndices convertidos.

Nota: Los elementos de la matriz se pueden especificar mediante un método
lineal. índice que comienza en 1 y recorre el número de elementos del matriz, o
se pueden especificar con subíndices para la fila, columna, página, etc. Las
funciones `ind2sub` y `sub2ind` interconvertir entre las dos formas.

El índice lineal atraviesa la dimensión 1 (filas) y luego la dimensión 2.
(columnas), luego dimensión 3 (páginas), etc. hasta que los numeres a todos de
los elementos. Considere las siguientes matrices de 3 por 3:

> > %%[1,4,7;2,5,8;3,6,9]%%

> > %%['1,1', '1,2', '1,3'; '2,1', '2,2', '2,3'; '3,1', '3,2', '3,3']%%

La primera matriz contiene los índices lineales para cada elemento de la
matriz. La segunda matriz muestra las tuplas suscritas para el mismo sede.

El siguiente ejemplo muestra cómo convertir índices lineales '2' y '8' para
subíndices apropiados de una matriz de 3 por 3.

> > `ind = [2, 8]`

> > `[r, c] = ind2sub ([3, 3], ind)`

> > %%r = [2, 2]%%

> > %%c = [1, 3]%%

Si el número de suscriptores salientes excede el número de dimensiones, las
dimensiones excedidas se establecen en '1'. Por otro lado, si se dan menos
subíndices que dimensiones, las dimensiones sobrantes se fusionan en la
dimensión final solicitada. Para mayor claridad, considere los siguientes
ejemplos:

> > `ind  = [2, 8]`

> > `dims = [3, 3]`

> > `# same as dims = [3, 3, 1]`

> > `[r, c, s] = ind2sub (dims, ind)`

> > %%r = [2, 2]%%

> > %%c = [1, 3]%%

> > %%s = [1, 1]%%

> > `# same as dims = [9]`

> > `r = ind2sub (dims, ind)`

> > %%r = [2, 8]%%

Véase también: `sub2ind`, `size`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/ind2sub.html
- https://octave.sourceforge.io/octave/function/ind2sub.html
