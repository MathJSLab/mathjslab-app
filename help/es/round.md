- `Y = round (X)`

Devuelve el número entero más cercano a "X".

Si `X` es complejo, devuelve `round (real (X)) + round (imag (X)) * I`. Si hay
dos números enteros más cercanos, devuelve el que está más alejado de cero.

> > `round ([-2.7, 2.7])` %% [-3, 3]%%

Véase también: `ceil`, `floor`, `fix`, `roundb`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/round.html
- https://octave.sourceforge.io/octave/function/round.html
- https://mathworld.wolfram.com/Rounding.html
- https://es.wikipedia.org/wiki/Redondeo
