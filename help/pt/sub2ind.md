- `IND = sub2ind (DIMS, I, J)`
- `IND = sub2ind (DIMS, S1, S2, ..., SN)`

Converte subscritos em índices lineares.

O argumento `DIMS` é um vetor de dimensão onde cada elemento tem o tamanho do
array na respectiva dimensão (veja `size`). Os argumentos de entradas restantes
são escalares ou vetores de subscritos a serem convertidos.

O vetor de saída `IND` contém os índices lineares convertidos.

Observação: os elementos da matriz podem ser especificados por um método linear
índice que começa em 1 e percorre o número de elementos em a matriz, ou eles
podem ser especificados com subscritos para a linha, coluna, página, etc. As
funções `ind2sub` e `sub2ind` interconvertem entre as duas formas.

O índice linear atravessa a dimensão 1 (linhas) e depois a dimensão 2
(colunas), depois dimensão 3 (páginas), etc. até numerar todos os elementos.
Considere a seguinte matriz 3 por 3:

> > %%['1,1', '1,2', '1,3'; '2,1', '2,2', '2,3'; '3,1', '3,2', '3,3'] = [1, 4,
> >
> > > > 7; 2, 5, 8; 3, 6, 9]%%

A matriz esquerda contém as tuplas subscritas para cada matriz elemento. A
matriz direita mostra os índices lineares para o mesmo matriz.

O exemplo a seguir mostra como converter os índices bidimensionais `(2,1)` e
`(2,3)` de uma matriz 3 por 3 para índices lineares com uma única chamada para
`sub2ind`.

> > `s1 = [2, 2]`

> > `s2 = [1, 3]`

> > `ind = sub2ind ([3, 3], s1, s2)`

> > %%ind = [2, 8]%%

Veja também: `ind2sub`, `size`.

### Referências

- https://www.mathworks.com/help/matlab/ref/sub2ind.html
- https://octave.sourceforge.io/octave/function/sub2ind.html
