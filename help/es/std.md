- `S = std(X)`
- `S = std(X, W)`
- `S = std(X, W, DIM)`
- `S = std(X, W, VECDIM)`
- `S = std(X, W, "ALL")`
- `S = std(..., NANFLAG)`
- `[S, M] = std(...)`

Calcula la desviación estándar de los elementos del vector `X`.

La desviación estándar se define como:

> > `std(X) = √((1 / (N-1)) * SUM_i((X(i) - media(X))^2))`

donde `N` es el número de elementos de `X`.

Si `X` es una matriz, calcula la desviación estándar sobre las primeras
dimensiones no unitarias de `X`.

El argumento opcional `W` determina el esquema de ponderación a utilizar. Los
valores válidos son:

- `0` \[por omisión\]:

Normaliza con `N-1` (desviación estándar poblacional). Esto proporciona la raíz
cuadrada del mejor estimador insesgado de la desviación estándar.

- `1`:

Normaliza con `N` (desviación estándar muestral). Esto proporciona la raíz
cuadrada del segundo momento respecto a la media.

- un vector:

Calcula la desviación estándar ponderada con ponderaciones no negativas. La
longitud de `W` debe ser igual al tamaño de `X` en la dimensión de operación.
Se permiten valores `NaN` en `W`, que se multiplicarán por los valores
correspondientes en `X`, y se pueden excluir mediante la opción `NANFLAG`.

- una matriz:

Similar a las ponderaciones vectoriales, pero `W` debe tener el mismo tamaño
que `X`. Si la dimensión operacional se indica como `VECDIM` o `"all"` y `W` no
es un escalar, `W` debe ser una matriz del mismo tamaño. Nota: `W` siempre debe
especificarse antes que cualquiera de las siguientes opciones de dimensión.
Para usar el valor predeterminado de `W`, puede pasar un argumento de entrada
vacío `[]`.

La variable opcional `DIM` obliga a `std` a operar sobre la dimensión
especificada, que debe ser un entero positivo. Especificar cualquier dimensión
individual en `X`, incluyendo cualquier dimensión que exceda `ndims(X)`,
resultará en una desviación estándar de `0`.

Especificar las dimensiones como `VECDIM`, un vector de dimensiones no
repetidas, devolverá la desviación estándar calculada sobre la porción de
matriz definida por `VECDIM`. Si `VECDIM` indexa todas las dimensiones de `X`,
es equivalente a la opción `"all"`. Cualquier dimensión en `VECDIM` mayor que
`ndims(X)` será ignorada.

Especificar la dimensión como `"all"` obligará a `std` a operar sobre todos los
elementos de `X` y es equivalente a `std(X(:))`. La variable opcional `NANFLAG`
especifica si los valores `NaN` deben incluirse o excluirse del cálculo,
utilizando cualquiera de las combinaciones de argumentos de entrada
especificadas anteriormente. El valor predeterminado de `NANFLAG` es
`"includenan"`, que mantiene los valores `NaN` en el cálculo. Para excluir los
valores `NaN`, establezca el valor de `NANFLAG` en `"omitnan"`. La salida
seguirá conteniendo valores `NaN` si `X` consiste enteramente en valores `NaN`
en la dimensión de operación.

La segunda variable de salida opcional, `M`, contiene el promedio de los
elementos de `X` utilizados para calcular la desviación estándar. Si `V` es la
desviación estándar ponderada, entonces `M` también será el promedio ponderado.

Véase también: `var`, `bounds`, `mad`, `range`, `iqr`, `mean`, `median`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/std.html
- https://octave.sourceforge.io/octave/function/std.html
