- `builtin (FCN, ARG1, ARG2, ...)`
- `[OUT1, OUT2, ...] = builtin (FCN, ARG1, ARG2, ...)`

Chama a função base `FCN` mesmo que ela esteja sobrecarregada para os tipos dos
argumentos atuais.

Isto é útil dentro de métodos sobrecarregados que precisam delegar parte de seu
trabalho à implementação embutida original.

Veja também: `feval`, `functions`.

### Referências

- https://www.mathworks.com/help/matlab/ref/builtin.html
- https://octave.sourceforge.io/octave/function/builtin.html
