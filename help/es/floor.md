- `Y = floor (X)`

Devuelve el número entero más grande no mayor que `X`.

Esto equivale a redondear al infinito negativo. Si `X` es complejo, devuelve
%%floor (real (X)) + floor (imag (X)) * I%%.

> > `floor ([-2.7, 2.7])`

> > %%floor ([-2.7, 2.7]) = [-3, 2]%%

Véase también: `ceil`, `round`, `fix`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/floor.html
- https://octave.sourceforge.io/octave/function/floor.html
- https://mathworld.wolfram.com/FloorFunction.html
- https://es.wikipedia.org/wiki/Funciones_de_parte_entera
