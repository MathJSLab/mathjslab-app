- `C = mtimes (A, B)`
- `C = mtimes (A1, A2, ...)`

Retorna o produto da multiplicação de matrizes das entradas.

Esta função e `A * B` são equivalentes. Se mais argumentos forem dados, a
multiplicação é aplicada cumulativamente da esquerda para direita:

> > `(...((A1 * A2) * A3) * ...)`

Veja também: `times`, `plus`, `minus`, `rdivide`, `mrdivide`, `mldivide`,
`mpower`.

### Referências

- https://www.mathworks.com/help/matlab/ref/mtimes.html
- https://octave.sourceforge.io/octave/function/mtimes.html
- https://mathworld.wolfram.com/MatrixMultiplication.html
- https://pt.wikipedia.org/wiki/Produto_de_matrizes
