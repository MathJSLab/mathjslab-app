- `F = factorial (N)`

Devuelve el factorial de `N` donde `N` es un entero real no negativo.

Si `N` es un escalar, esto es equivalente a `prod (1:N)`. Para argumentos
vectoriales o matriz, devuelve el factorial de cada elemento de la matriz.

Para argumentos que no son enteros, consulte la función factorial generalizada
`gamma`. Tenga en cuenta que la función factorial crece muy rápidamente y se
producirá un desbordamiento si `N > 171`. Para tales casos, considere
`gammaln`.

Véase también: `prod`, `gamma`, `gammainc`, `gammaln`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/factorial.html
- https://octave.sourceforge.io/octave/function/factorial.html
- https://mathworld.wolfram.com/Factorial.html
- https://es.wikipedia.org/wiki/Factorial
