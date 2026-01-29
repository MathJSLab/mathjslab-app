- `M = diag (V)`
- `M = diag (V, K)`
- `M = diag (V, M, N)`
- `V = diag (M)`
- `V = diag (M, K)`

Devuelve un array diagonal con el vector `V` en la diagonal `K`.

El segundo argumento es opcional. Si es positivo, el vector se coloca en la
`K`-ésima superdiagonal. Si es negativo, se coloca en la `-K`-ésima
subdiagonal. El valor predeterminado de `K` es `0` y el vector se coloca en la
diagonal principal. Por ejemplo:

> > `diag([1, 2, 3], 1)`

> > `%[0,1,0,0;0,0,2,0;0,0,0,3;0,0,0,0]%`

La forma de 3 argumentos devuelve un array diagonal con el vector `V` en la
diagonal principal. El array resultante tiene un tamaño de `M` filas x `N`
columnas.

Dado un argumento de tipo matriz, en lugar de un vector, `diag` extrae la
`K`-ésima diagonal del array.

### Referencias

- https://www.mathworks.com/help/matlab/ref/diag.html
- https://octave.sourceforge.io/octave/function/diag.html
