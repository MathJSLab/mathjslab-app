- `V = var (X)`
- `V = var (X, W)`
- `V = var (X, W, DIM)`
- `V = var (X, W, VECDIM)`
- `V = var (X, W, "all")`
- `V = var (..., NANFLAG)`
- `[V, M] = var (...)`

Calcula la varianza de los elementos del vector `X`.

La varianza se define como:

> > `var (X) = (1 / (N-1)) * SUM_i ((X(i) - mean(X))^2)`

donde `N` es el número de elementos de `X`.

Si X es una matriz, calcula la varianza a lo largo de las primeras dimensiones
no unitarias de X.

El argumento opcional `W` determina el esquema de ponderación que se utilizará.
Los valores válidos son:

- `0` \[por omisión\]:

Normaliza con N-1 (varianza poblacional). Esto proporciona la raíz cuadrada del
mejor estimador insesgado de la varianza.

- `1`:

Normaliza con N (varianza muestral). Esto proporciona la raíz cuadrada del
segundo momento respecto a la media.

- un vector:

Calcula la varianza ponderada con ponderaciones no negativas. La longitud de
`W` debe ser igual al tamaño de `X` en la dimensión operacional. Se permiten
valores `NaN` en `W`, que se multiplicarán por los valores correspondientes en
`X`, y se pueden excluir con la opción `NANFLAG`.

- una matriz:

Similar a las ponderaciones vectoriales, pero W debe tener el mismo tamaño que
`X`. Si la dimensión operacional se especifica como `VECDIM` o `"all"` y `W` no
es un escalar, `W` debe ser una matriz del mismo tamaño.

Nota: `W` siempre debe especificarse antes de cualquiera de las siguientes
opciones de dimensión. Para usar el valor predeterminado de `W`, puede pasar un
argumento de entrada vacío `[]`.

La variable opcional `DIM` obliga a `var` a operar sobre la dimensión
especificada, que debe ser un entero positivo. Especificar cualquier dimensión
individual en `X`, incluyendo cualquier dimensión que exceda `ndims(X)`,
resultará en una varianza de `0`.

Especificar las dimensiones como `VECDIM`, un vector de dimensiones no
repetidas, devolverá la varianza calculada sobre la porción de matriz definida
por `VECDIM`. Si `VECDIM` indexa todas las dimensiones de `X`, es equivalente a
la opción `"all"`. Cualquier dimensión en `VECDIM` mayor que `ndims(X)` será
ignorada.

Especificar la dimensión como `"all"` obligará a `var` a operar sobre todos los
elementos de `X` y es equivalente a `var(X(:))`.

La variable opcional `NANFLAG` especifica si los valores NaN deben incluirse o
excluirse del cálculo, utilizando cualquiera de las combinaciones de argumentos
de entrada especificadas anteriormente. El valor predeterminado de `NANFLAG` es
`"includenan"`, que mantiene los valores NaN en el cálculo. Para excluir los
valores NaN, establezca el valor de `NANFLAG` en `"omitnan"`. La salida seguirá
conteniendo valores NaN si `X` consiste enteramente en valores NaN en la
dimensión operativa.

La segunda variable de salida opcional, `M`, contiene la media de los elementos
de `X` utilizados para calcular la varianza. Si `V` es la varianza ponderada,
entonces `M` también será la media ponderada.

Véase también: `std`, `mean`, `cov`, `skewness`, `kurtosis`, `moment`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/var.html
- https://octave.sourceforge.io/octave/function/var.html
