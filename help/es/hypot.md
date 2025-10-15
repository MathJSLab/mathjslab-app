- `H = hypot (X, Y)`
- `H = hypot (X, Y, Z, ...)`

Calcula la raíz cuadrada de la suma de los cuadrados de `X` e `Y`.

Esta función es equivalente a `sqrt (X.^2 + Y.^2)`, pero se calcula en un forma
que evita desbordamientos para valores grandes de X o Y.

`hypot` también se puede llamar con más de 2 argumentos; en este caso, los
argumentos se aplican acumulativamente de izquierda a derecha:

> > `hypot (hypot (X, Y), Z)` `hypot (hypot (hypot (X, Y), Z), W)`

, etc.

### Referencias

- https://www.mathworks.com/help/matlab/ref/hypot.html
- https://octave.sourceforge.io/octave/function/hypot.html
- https://mathworld.wolfram.com/Hypotenuse.html
- https://es.wikipedia.org/wiki/Hipotenusa
