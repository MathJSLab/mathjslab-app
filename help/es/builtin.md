- `builtin (FCN, ARG1, ARG2, ...)`
- `[OUT1, OUT2, ...] = builtin (FCN, ARG1, ARG2, ...)`

Llama a la función base `FCN` aunque esté sobrecargada para los tipos de los
argumentos actuales.

Esto es útil dentro de métodos sobrecargados que necesitan delegar parte de su
trabajo a la implementación incorporada original.

Véase también: `feval`, `functions`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/builtin.html
- https://octave.sourceforge.io/octave/function/builtin.html
