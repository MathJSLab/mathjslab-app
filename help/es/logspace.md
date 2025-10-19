- `Y = logspace (A, B)`
- `Y = logspace (A, B, N)`
- `Y = logspace (A, pi)`
- `Y = logspace (A, pi, N)`

Devuelve un vector de fila con elementos `N` espaciados logarítmicamente desde
`%10^A%` hasta `%10^B%`.

Si no se especifica el número de elementos `N`, el valor predeterminado es 50.

Si `B` es igual a `%pi%`, los puntos están entre `%10^A%` y `%pi%`, _not_
`%10^A%` y `%10^pi%`, lo cual es útil en procesamiento de señales digitales.

Notas de programación: Para compatibilidad con MATLAB&reg;/Octave, devuelve el
lado derecho del rango (`%10^B%`) cuando se requiere un valor único (%%N =
1%%). Si `N` no es un número entero, entonces se utilizará `floor(N)` para
redondear el número de elementos. Si `N` es cero o negativo, entonces se
devuelve una matriz vacía de 1x0.

Véase tambiém: `linspace`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/logspace.html
- https://octave.sourceforge.io/octave/function/logspace.html
