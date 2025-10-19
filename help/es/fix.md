- `Y = fix (X)`

Trunca la parte fraccionaria de `X` y devuelve la parte entera.

Esto equivale a redondear a cero. Si `X` es complejo, devuelve
`%fix (real(X)) + fix (imag (X)) * I%`.

> > `fix ([-2.7, 2.7])`

> > `%fix ([-2.7, 2.7]) = [-2, 2]%`

Véase también: `ceil`, `floor`, `round`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/fix.html
- https://octave.sourceforge.io/octave/function/fix.html
- https://es.wikipedia.org/wiki/Funciones_de_parte_entera
