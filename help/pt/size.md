- `SZ = size (A)`
- `DIM_SZ = size (A, DIM)`
- `DIM_SZ = size (A, D1, D2, ...)`
- `[ROWS, COLS, ..., DIM_N_SZ] = size (...)`

Retorna um vetor linha com o tamanho (número de elementos) de cada dimensão
para o objeto `A`.

Quando recebe um segundo argumento, `DIM`, retorna o tamanho da dimensão
correspondente. Se `DIM` for um vetor, retorna cada uma das dimensões
correspondentes. Múltiplas dimensões também podem ser especificados como
argumentos separados.

Com um único argumento de saída, '`size`' retorna um vetor linha. Quando
chamado com vários argumentos de saída, '`size`' retorna o tamanho de dimensão
`N` no enésimo argumento. O número de linhas, dimensão 1, é retornado no
primeiro argumento, o número de colunas, dimensão 2, é retornado no segundo
argumento, etc. Se houver mais dimensões em `A` do que existem argumentos de
saída, '`size`' retorna o número total de elementos nas dimensões restantes no
argumento final de saída.

Exemplo 1: saída vetorial de linha única

> > `size ([1, 2; 3, 4; 5, 6])`

> > %%[ 3, 2 ]%%

Exemplo 2: número de elementos na 2ª dimensão (colunas)

> > `size ([1, 2; 3, 4; 5, 6], 2)`

> > %%2%%

Exemplo 3: número de argumentos de saída `==` número de dimensões

> > `[nr, nc] = size ([1, 2; 3, 4; 5, 6])`

> > %%nr = 3%%

> > %%nc = 2%%

Exemplo 4: número de argumentos de saída `<` número de dimensões

> > `[nr, remainder] = size (ones (2, 3, 4, 5))`

> > %%nr = 2%%

> > %%remainder = 60%%

Veja também: `numel`, `ndims`, `length`, `rows`, `columns`, `size_equal`,
`common_size`.

### Referências

- https://www.mathworks.com/help/matlab/ref/size.html
- https://octave.sourceforge.io/octave/function/size.html
