- `[S1, S2, ..., SN] = ind2sub (DIMS, IND)

Converte índices lineares em subscritos.

O argumento `DIMS` é um vetor de dimensão onde cada elemento tem o tamanho do
array na respectiva dimensão (veja `size`). O segundo argumento `IND` contém
índices lineares a serem convertidos.

As saídas `S1`, ..., `SN` contêm os subscritos convertidos.

Observação: os elementos da matriz podem ser especificados por um método linear
índice que começa em 1 e percorre o número de elementos na matriz, ou eles
podem ser especificados com subscritos para a linha, coluna, página, etc. As
funções `ind2sub` e `sub2ind` interconvertem entre as duas formas.

O índice linear atravessa a dimensão 1 (linhas) e depois a dimensão 2
(colunas), depois dimensão 3 (páginas), etc. até numerar todos dos elementos.
Considere as seguintes matrizes 3 por 3:

> > %%[1,4,7;2,5,8;3,6,9]%%

> > %%['1,1', '1,2', '1,3'; '2,1', '2,2', '2,3'; '3,1', '3,2', '3,3']%%

A primeira matriz contém os índices lineares para cada elemento da matriz. A
segunda matriz mostra as tuplas subscritas para a mesma matriz.

O exemplo a seguir mostra como converter os índices lineares '2' e '8' para
subscritos apropriados de uma matriz 3 por 3.

> > `ind = [2, 8]`

> > `[r, c] = ind2sub ([3, 3], ind)`

> > %%r = [2, 2]%%

> > %%c = [1, 3]%%

Se o número de subscritos de saída exceder o número de dimensões, as dimensões
excedidas são definidas como '1'. Por outro lado, se menos subscritos do que
dimensões forem fornecidos, as dimensões excedentes são mescladas na dimensão
final solicitada. Para maior clareza, considere os seguintes exemplos:

> > `ind  = [2, 8]`

> > `dims = [3, 3]`

> > `# same as dims = [3, 3, 1]`

> > `[r, c, s] = ind2sub (dims, ind)`

> > %%r = [2, 2]%%

> > %%c = [1, 3]%%

> > %%s = [1, 1]%%

> > `# same as dims = [9]`

> > `r = ind2sub (dims, ind)`

> > %%r = [2, 8]%%

Veja também: `sub2ind`, `size`.

### Referências

- https://www.mathworks.com/help/matlab/ref/ind2sub.html
- https://octave.sourceforge.io/octave/function/ind2sub.html
- https://pt.wikipedia.org/wiki/Ordem_principal_de_linha_e_de_coluna
