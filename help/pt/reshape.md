- `B = reshape (A, M, N, ...)`
- `B = reshape (A, [M N ...])`
- `B = reshape (A, ..., [], ...)`
- `B = reshape (A, SIZE)`

Retorna uma matriz com as dimensões especificadas `(M, N, ...)` cujos elementos
são retirados da matriz `A`.

Os elementos da matriz são acessados na ordem principal de coluna (como
Matrizes Fortran são armazenadas).

O código a seguir demonstra a remodelagem de um vetor de linha 1x4 em uma
Matriz quadrada 2x2.

> > `reshape ([1, 2, 3, 4], 2, 2)`

> > %%[1, 3; 2, 4]%%

Observe que o número total de elementos na matriz original ('prod (size (A))')
deve corresponder ao número total de elementos na nova matriz ('prod ([M N
...])').

Uma única dimensão da matriz de retorno pode ser deixada sem especificação e
seu tamanho será determinado automaticamente. Uma matriz vazia ([]) é usada
para sinalizar a dimensão não especificada.

Veja também: `resize`, `vec`, `postpad`, `cat`, `squeeze`.

### Referências

- https://www.mathworks.com/help/matlab/ref/reshape.html
- https://octave.sourceforge.io/octave/function/reshape.html
