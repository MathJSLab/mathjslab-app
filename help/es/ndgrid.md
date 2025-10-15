- `[Y1, Y2, ..., Yn] = ndgrid (X1, X2, ..., Xn)`
- `[Y1, Y2, ..., Yn] = ndgrid (X)`

Dados n vectores `X1`, ..., `Xn`, `ndgrid` devuelve `n` matrices de dimensión
`n`.

Los elementos del i-ésimo argumento de salida contienen los elementos del
vector `Xi` repetidos en todas las dimensiones excepto en la i-ésima dimensión.
Llamar a `ndgrid` con solo un argumento de entrada `X` es equivalente a llamar
a `ndgrid` con todos los argumentos de entrada `n` iguales a `X`:

> > `[Y1, Y2, ..., Yn] = ndgrid (X, ..., X)`

Nota de programación: `ndgrid` es muy similar a la función `meshgrid` excepto
que las dos primeras dimensiones se transponen en comparación con `meshgrid`.
Algunas funciones principales esperan entrada `meshgrid` y otras esperan
entrada `ndgrid`. Consulte la documentación de la función en cuestión para
determinar el formato de entrada apropiado.

Véase también: `meshgrid`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/ndgrid.html
- https://octave.sourceforge.io/octave/function/ndgrid.html
