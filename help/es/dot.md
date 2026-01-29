- `Z = dot(X, Y)`
- `Z = dot(X, Y, DIM)`

Calcula el producto escalar de dos vectores.

Si `X` e `Y` son matrices, calcula los productos escalares a lo largo de la
primera dimensión no singular (distinto de 1).

Si se proporciona el argumento opcional `DIM`, calcula los productos escalares
a lo largo de esta dimensión.

Nota de implementación: Esto es equivalente a `sum(conj(X) .* Y, DIM)`, pero
evita la formación de una matriz temporal y es más rápido. Cuando `X` e `Y` son
vectores columna, el resultado es equivalente a `X' * Y`. Aunque `dot` está
definido para matrices de enteros, la salida puede diferir del resultado
esperado debido al rango limitado de objetos enteros.

Véase también: `cross`, `divergence`, `tensorprod`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/dot.html
- https://octave.sourceforge.io/octave/function/dot.html
