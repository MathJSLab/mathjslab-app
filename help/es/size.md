- `SZ = size (A)`
- `DIM_SZ = size (A, DIM)`
- `DIM_SZ = size (A, D1, D2, ...)`
- `[ROWS, COLS, ..., DIM_N_SZ] = size (...)`

Devuelve un vector de fila con el tamaño (número de elementos) de cada
dimensión para el objeto `A`.

Cuando se le da un segundo argumento, `DIM`, devuelve el tamaño de la dimensión
correspondiente. Si `DIM` es un vector, devuelve cada una de las dimensiones
correspondientes. También se pueden especificar varias dimensiones como
argumentos independientes.

Con un único argumento de salida, `size` devuelve un vector de fila. Cuando se
llama con múltiples argumentos de salida, `size` devuelve el tamaño de
dimensión `N` en el enésimo argumento. El número de filas, dimensión 1, se
devuelve en el primer argumento, el número de columnas, dimensión 2, se
devuelve en el segundo argumento, etc. Si hay más dimensiones en `A` que
argumentos de salida, `size` devuelve el número total de elementos en las
dimensiones restantes en el argumento de salida final.

Ejemplo 1: salida vectorial de una sola línea

> > `size ([1, 2; 3, 4; 5, 6])`

> > %%[ 3, 2 ]%%

Ejemplo 2: número de elementos en la segunda dimensión (columnas)

> > `size ([1, 2; 3, 4; 5, 6], 2)`

> > %%2%%

Ejemplo 3: número de argumentos de salida `==` número de dimensiones

> > `[nr, nc] = size ([1, 2; 3, 4; 5, 6])`

> > %%nr = 3%%

> > %%nc = 2%%

Ejemplo 4: número de argumentos de salida `<` número de dimensiones

> > `[nr, remainder] = size (ones (2, 3, 4, 5))`

> > %%nr = 2%%

> > %%remainder = 60%%

Véase también: `numel`, `ndims`, `length`, `rows`, `columns`, `size_equal`,
`common_size`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/size.html
- https://octave.sourceforge.io/octave/function/size.html
