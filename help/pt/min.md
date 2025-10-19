- `M = min (X)`
- `M = min (X, [], DIM)`
- `[M, IM] = min (X)`
- `M = min (X, Y)`

Encontra valores mínimos na matriz `X`.

Para um vetor como argumento, retorna o valor mínimo. Para uma matriz como
argumento, retorna um vetor linha com o valor mínimo de cada coluna. Para uma
matriz multidimensional, `min` opera ao longo do primeira dimensão não
singular.

Se o terceiro argumento opcional `DIM` estiver presente, opera junto a esta
dimensão. Neste caso o segundo argumento é ignorado e deve ser definido como
uma matriz vazia.

Para duas entradas (`X` e `Y`), retorna o mínimo do par de acordo com as regras
de broadcasting.

Por isso,

> > `min (min (X))`

retorna o menor elemento da matriz 2-D `X` e

> > `min (2:5, pi)`

> > `%[2, 3, 3.1416, 3.1416]%`

compara cada elemento do intervalo `2:5` com `pi` e retorna um vetor linha dos
valores mínimos.

Para argumentos complexos, a magnitude dos elementos é usada para comparação.
Se as magnitudes forem idênticas, então os resultados são ordenados pelo ângulo
de fase no intervalo (-pi, pi]. Portanto,

> > `min ([-1 i 1 -i])`

> > `%-i%`

porque todas as entradas têm magnitude 1, mas -i tem a menor fase ângulo com
valor -pi/2.

Se chamado com um argumento de entrada e dois argumentos de saída, `min` também
retorna o primeiro índice do(s) valor(es) mínimo(s). Por isso,

> > `[x, ix] = min ([1, 3, 0, 2, 0])`

> > `%x = 0%`

> > `%ix = 3%`

Veja também: `max`, `cummin`, `cummax`.

### Referências

- https://www.mathworks.com/help/matlab/ref/min.html
- https://octave.sourceforge.io/octave/function/min.html
- https://mathworld.wolfram.com/Minimum.html
- https://pt.wikipedia.org/wiki/Pontos_extremos_de_uma_fun%C3%A7%C3%A3o
