- `Y = sind (X)`

Calcula el seno de cada elemento de `X` en grados.

El seno en grados está definido por

> > %%sind(z) = rad2deg(sin(z))%%

La función es más precisa que `sin` para valores grandes de `X` y para
múltiplos de 180 grados (`X/180` es un número entero) donde `sind` devuelve `0`
en lugar de un valor pequeño en el orden de eps.

Véase también: `asind`, `sin`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/sin.html
- https://octave.sourceforge.io/octave/function/sind.html
- https://mathworld.wolfram.com/Sine.html
- https://mathworld.wolfram.com/TrigonometricFunctions.html
- https://es.wikipedia.org/wiki/Funci%C3%B3n_trigonom%C3%A9trica
