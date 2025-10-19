- `M = max (X)`
- `M = max (X, [], DIM)`
- `[M, IM] = max (X)`
- `M = max (X, Y)`

Encontra os valores máximos na matriz `X`.

Para um vetor como argumento, retorna o valor máximo. Para uma matriz como
argumento, retorna um vetor linha com o valor máximo de cada coluna. Para uma
matriz multidimensional, `max` opera ao longo do primeira dimensão não
singular.

Se o terceiro argumento opcional `DIM` estiver presente, opera junto a esta
dimensão. Neste caso o segundo argumento é ignorado e deve ser definido como
uma matriz vazia.

Para duas entradas (`X` e `Y`), retorna o máximo do par de acordo com as regras
de broadcasting.

Por isso,

> > `max (max (X))`

retorna o maior elemento da matriz 2-D `X` e

> > `max (2:5, pi)`

> > `%[3.1416, 3.1416, 4, 5]%`

compara cada elemento do intervalo `2:5` com `pi` e retorna um vetor linha dos
valores máximos.

Para argumentos complexos, a magnitude dos elementos é usada para comparação.
Se as magnitudes forem idênticas, então os resultados são ordenados pelo ângulo
de fase no intervalo (-pi, pi). Portanto,

> > `max ([-1 i 1 -i])`

> > `%-1%`

porque todas as entradas têm magnitude 1, mas -1 tem o maior ângulo de fase com
valor pi.

Se chamado com um argumento de entrada e dois argumentos de saída, `max` também
retorna o primeiro índice do(s) valor(es) máximo(s). Por isso,

> > `[x, ix] = max ([1, 3, 5, 2, 5])`

> > `%x = 5%`

> > `%ix = 3%`

Veja também: `min`, `cummax`, `cummin`.

### Referências

- https://www.mathworks.com/help/matlab/ref/max.html
- https://octave.sourceforge.io/octave/function/max.html
- https://mathworld.wolfram.com/Maximum.html
- https://pt.wikipedia.org/wiki/Pontos_extremos_de_uma_fun%C3%A7%C3%A3o
