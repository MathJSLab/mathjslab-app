- `M = cummin (X)`
- `M = cummin (X, DIM)`
- `[M, IM] = cummin (...)`

Retorna os valores mínimos cumulativos ao longo da dimensão `DIM`.

Se `DIM` não for especificado, o padrão é a operação em colunas. Por exemplo:

> > `cummin ([5, 4, 6, 2, 3, 1])`

> > `%[5, 4, 4, 2, 2, 1]%`

Se chamado com dois argumentos de saída, o índice do valor mínimo também é
retornado.

> > `[M, IM] = cummin ([5, 4, 6, 2, 3, 1])`

> > `%M = [5, 4, 4, 2, 2, 1]%`

> > `%IM = [1, 2, 2, 4, 4, 6]%`

Veja também: `cummax`, `min`, `max`.

### Referências

- https://www.mathworks.com/help/matlab/ref/cummin.html
- https://octave.sourceforge.io/octave/function/cummin.html
- https://mathworld.wolfram.com/Minimum.html
- https://pt.wikipedia.org/wiki/Pontos_extremos_de_uma_fun%C3%A7%C3%A3o
