- `[Q, R] = qr (A)`
- `[Q, R, P] = qr (A)`
- `X = qr (A)` # A no es dispersa
- `R = qr (A)` # A es dispersa
- `X = qr (A, B)` # A es dispersa
- `[C, R] = qr (A, B)`
- `[...] = qr (..., 0)`
- `[...] = qr (..., "econ")`
- `[...] = qr (..., "vector")`
- `[...] = qr (..., "matriz")`

Calcula la factorización QR de `A` utilizando subrutinas LAPACK estándar.

La factorización QR es:

> > `Q * R = A`

donde `Q` es una matriz ortogonal y `R` es triangular superior.

Por ejemplo, dada la matriz `A = [1, 2; 3, 4]`,

> > `[Q, R] = qr (A)`

devuelve

> > `%Q=[-0.31623,-0.94868;-0.94868,0.31623]%`

> > `%R=[-3.16228,-4.42719;0,-0.63246]%`

que, al multiplicarse, devuelve la matriz original:

> > `Q * R`

> > `%[1, 2; 3, 4]%`

Si solo se solicita un valor de retorno, será `R` si `A` es dispersa, o `X`, de
modo que `R = triu (X)` si `A` es completa. (Nota: A diferencia de la mayoría
de los comandos, el valor de retorno único no es el primer valor de retorno
cuando se solicitan varios valores).

Si se solicita una tercera salida `P`, `qr` calcula la factorización QR
permutada.

> > `Q * R = A * P`

Donde `Q` es una matriz ortogonal, `R` es triangular superior y `P` es una
matriz de permutación.

Si `A` es denso, la factorización QR permutada tiene la propiedad adicional de
que las entradas diagonales de R se ordenan por magnitud decreciente. En otras
palabras, `abs(diag(R))` se ordenará de mayor a menor.

Si `A` es disperso, `P` es una ordenación por reducción de relleno de las
columnas de `A`. En este caso, las entradas diagonales de `R` no se ordenan por
magnitud decreciente.

Por ejemplo, dada la matriz `A = [1, 2; 3, 4]`,

> > `[Q, R, P] = qr (A)`

devuelve

> > `%Q=[-0.44721,-0.89443;-0.89443,0.44721]%`

> > `%R=[-4.47214,-3.13050;0.00000,0.44721]%`

> > `%P=[0,1;1,0]%`

Si la matriz de entrada `A` es dispersa, la factorización QR dispersa se
calcula utilizando `SPQR` o `CXSPARSE` (por ejemplo, si `SPQR` no está
disponible). Dado que la matriz `Q` suele ser una matriz completa, se
recomienda solicitar solo un valor de retorno `R`. En este caso, el cálculo
evita construir `Q` y devuelve una matriz dispersa `R` tal que
`R = chol (A' * A)`.

Si `A` es densa, se proporciona una matriz adicional `B` y se solicitan dos
valores de retorno; entonces `qr` devuelve `C`, donde `C = Q' * B`. Esto
permite calcular la aproximación por mínimos cuadrados de `A \ B` como:

> > `[C, R] = qr (A, B)`

> > `X = R \ C`

Si `A` es una matriz dispersa `MxN` y se proporciona una matriz adicional `B`,
se pueden obtener uno o dos valores de retorno. Si se solicita un valor de
retorno `X` y `M < N`, entonces `X` es la solución mínima de norma 2 de
`A \ B`. Si `M >= N`, `X` es la aproximación por mínimos cuadrados de `A \ B`.
Si se solicitan dos valores de retorno, `C` y `R` tienen el mismo significado
que en el caso denso (`C` es denso y `R` es disperso). Se recomienda la versión
con un solo parámetro de retorno, ya que utiliza menos memoria y gestiona mejor
las matrices de bajo rango.

Si el argumento final es la cadena `"vector"`, entonces `P` será un vector de
permutación (de las columnas de `A`) en lugar de una matriz de permutación. En
este caso, la relación definitoria es:

> > `Q * R = A(:, P)`

Sin embargo, por defecto se devuelve una matriz de permutación, que puede
especificarse explícitamente mediante un argumento final de tipo `"matrix"`.

Si el argumento final es el escalar 0 o la cadena `"econ"`, se devolverá una
factorización económica. Si la matriz original `A` tiene un tamaño `MxN` y
`M > N`, la factorización económica calculará solo `N` filas en `R` y `N`
columnas en `Q`, omitiendo los ceros en `R`. Si `M <= N`, no hay diferencia
entre las factorizaciones económica y estándar. Al calcular una factorización
económica y `A` es densa, la salida `P` siempre será un vector en lugar de una
matriz. Si `A` es dispersa, la salida `P` será una matriz de permutación
dispersa.

Contexto: La factorización QR tiene aplicaciones en la resolución de problemas
de mínimos cuadrados

> > `min norm (A*x - b)`

para sistemas de ecuaciones sobredeterminados (es decir, `A` es una matriz alta
y estrecha).

La factorización QR permutada `[Q, R, P] = qr (A)` permite la construcción de
una base ortogonal de `span (A)`.

Véase también: `chol`, `hess`, `lu`, `qz`, `schur`, `svd`, `qrupdate`,
`qrinsert`, `qrdelete`, `qrshift`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/qr.html
- https://octave.sourceforge.io/octave/function/qr.html
- https://github.com/gnu-octave/octave/blob/default/liboctave/numeric/qr.h
- https://github.com/gnu-octave/octave/blob/default/libinterp/corefcn/qr.cc
- https://github.com/gnu-octave/octave/blob/default/liboctave/numeric/qrp.h
- https://mathworld.wolfram.com/QRDecomposition.html
- https://rosettacode.org/wiki/QR_decomposition
- https://es.wikipedia.org/wiki/Factorizaci%C3%B3n_QR
