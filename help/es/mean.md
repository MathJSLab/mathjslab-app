- `Y = mean (X)`
- `Y = mean (X, 'all')`
- `Y = mean (X, DIM)`
- `Y = mean (..., 'NANFLAG')`

Calcula la media de los elementos de `X`.

- Si X es un vector, entonces `mean(X)` devuelve la media de los elementos en
  `X` definidos como

> > `mean (X) = SUM_i X(i) / N`

donde `N` es el número de elementos en el vector `X`.

- Si `X` es una matriz, entonces `mean` devuelve un vector de fila con la media
  de cada columna en `X`.

- Si `X` es una matriz multidimensional, entonces `mean` opera en la primera
  dimensión no singular de `X`.

La entrada opcional `DIM` obliga a `mean` a operar en las dimensiones
especificadas. `DIM` puede ser una dimensión escalar o un vector de dimensiones
no repetidas. Las dimensiones deben ser números enteros positivos y el promedio
se calcula sobre el segmento de la matriz definido por `DIM`.

Especificar la dimensión `'all'` forzará `mean` a operar en todos los elementos
de `X` y es equivalente a `mean (X(:))`.

La entrada opcional `NANFLAG` especifica si se incluyen/excluyen los valores
`NaN` del cálculo. Por defecto, se incluyen valores `NaN` en el cálculo
(`NANFLAG` tiene el valor `'includenan'`). Para excluir los valores `NaN`,
establezca el valor de `NANFLAG` en `omitnan`.

Véase también: `median`, `mode`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/mean.html
- https://octave.sourceforge.io/octave/function/mean.html
- https://mathworld.wolfram.com/ArithmeticMean.html
- https://es.wikipedia.org/wiki/Media_aritm%C3%A9tica
