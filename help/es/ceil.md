- `Y = ceil (X)`

Devuelve el número entero más pequeño no menor que `X`.

Esto equivale a redondear al infinito positivo.

Si `X` es complejo, devuelve `ceil (real (X)) + ceil (imag (X)) * I`.

> > `ceil ([-2.7, 2.7])`

> > `%ceil ([-2.7, 2.7]) = [-2, 3]%`

Véase también: `floor`, `round`, `fix`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/ceil.html
- https://octave.sourceforge.io/octave/function/ceil.html
- https://mathworld.wolfram.com/CeilingFunction.html
- https://es.wikipedia.org/wiki/Funciones_de_parte_entera
