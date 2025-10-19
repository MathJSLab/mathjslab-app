- `IND = sub2ind (DIMS, I, J)`
- `IND = sub2ind (DIMS, S1, S2, ..., SN)`

Convierte subíndices en índices lineales.

El argumento `DIMS` es un vector de dimensión donde cada elemento tiene el
tamaño de la matriz en su dimensión respectiva (ver `size`). Los argumentos de
entrada restantes son escalares o vectores de subíndices que se van a
convertir.

El vector de salida `IND` contiene los índices lineales convertidos.

Nota: Los elementos de la matriz se pueden especificar mediante un método de
índice lineal que comienza en 1 y recorre el número de elementos de la matriz,
o se pueden especificar con subíndices para fila, columna, página, etc. Las
funciones `ind2sub` y `sub2ind` se interconvierten entre las dos formas.

El índice lineal atraviesa la dimensión 1 (filas) y luego la dimensión 2
(columnas), luego dimensión 3 (páginas), etc. hasta numerar todos los
elementos. Considere la siguiente matriz 3 por 3:

> > `%['1,1', '1,2', '1,3'; '2,1', '2,2', '2,3'; '3,1', '3,2', '3,3'] = [1, 4, 7; 2, 5, 8; 3, 6, 9]%`

La matriz de la izquierda contiene las tuplas de subíndices para cada matriz de
elementos. La matriz de la derecha muestra los índices lineales para el mismo
sede.

El siguiente ejemplo muestra cómo convertir los índices bidimensionales `(2,1)`
y `(2,3)` de una matriz de 3 por 3 en índices lineales con una sola llamada a
`sub2ind`.

> > `s1 = [2, 2]`

> > `s2 = [1, 3]`

> > `ind = sub2ind ([3, 3], s1, s2)`

> > `%ind = [2, 8]%`

Véase también: `ind2sub`, `size`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/sub2ind.html
- https://octave.sourceforge.io/octave/function/sub2ind.html
