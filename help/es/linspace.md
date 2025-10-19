- `Y = linspace (START, END)`
- `Y = linspace (START, END, N)`

Devuelve un vector de fila con `N` elementos espaciados linealmente entre
`START` y `END`.

Si el número de elementos `N` es mayor que uno, entonces los puntos finales
`START` y `END` siempre están incluidos en el rango. Si `START` es mayor que
`END`, los elementos se almacenan en orden descendente. Si no se especifica el
número de puntos `N`, se utiliza un valor de 100.

La función `linspace` devuelve un vector de fila cuando `START` y `END` son
escalares. Si una o ambas entradas son vectores, entonces `linspace` los
convierte en vectores de columna y devuelve una matriz donde cada línea es una
secuencia independiente entre `START(ROW_N),END(ROW_N)`.

Notas de programación: Para compatibilidad con MATLAB&reg;/Octave, devuelve el
segundo argumento (`END`) cuando se solicita un valor único (`%N = 1%`). Si `N`
es un número no entero, entonces se usa `floor(N)` para redondear el número de
elementos. Si `N` es cero o negativo, entonces se devuelve una matriz vacía de
1x0.

Véase tambiém: `colon`, `logspace`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/linspace.html
- https://octave.sourceforge.io/octave/function/linspace.html
