- `M = diag (V)`
- `M = diag (V, K)`
- `M = diag (V, M, N)`
- `V = diag (M)`
- `V = diag (M, K)`

Retorna uma matriz diagonal com o vetor `V` na diagonal `K`.

O segundo argumento é opcional. Se for positivo, o vetor é colocado na
`K`-ésima superdiagonal. Se for negativo, é colocado na `-K`-ésima subdiagonal.
O valor padrão de `K` é `0`, e o vetor é colocado na diagonal principal. Por
exemplo:

> > `diag ([1, 2, 3], 1)`

> > `%[0,1,0,0;0,0,2,0;0,0,0,3;0,0,0,0]%`

A forma com 3 argumentos retorna uma matriz diagonal com o vetor `V` na
diagonal principal e a matriz resultante tem tamanho `M` linhas x `N` colunas.

Dado um argumento do tipo matriz, em vez de um vetor, `diag` extrai a `K`-ésima
diagonal da matriz.

### Referências

- https://www.mathworks.com/help/matlab/ref/diag.html
- https://octave.sourceforge.io/octave/function/diag.html
