- `VAL = ones (N)`
- `VAL = ones (M, N)`
- `VAL = ones (M, N, K, ...)`
- `VAL = ones ([M, N, ...])`

Retorna uma matriz N-dimensional cujos elementos são todos 1.

Se invocado com um único argumento inteiro escalar `N`, retorna uma matriz
quadrada `N x N`.

Se invocado com dois ou mais argumentos inteiros escalares ou um vetor de
valores inteiros, retorna uma matriz com as dimensões dadas.

Para criar uma matriz constante cujos valores são todos iguais, use uma
expressão como

> > `val_matrix = val * ones (m, n)`

Veja também: `zeros`.

### Referências

- https://www.mathworks.com/help/matlab/ref/ones.html
- https://octave.sourceforge.io/octave/function/ones.html
