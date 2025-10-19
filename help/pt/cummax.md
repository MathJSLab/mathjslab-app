- `M = cummax (X)`
- `M = cummax (X, DIM)`
- `[M, IM] = cummax (...)`

Retorna os valores máximos cumulativos ao longo da dimensão `DIM`.

Se `DIM` não for especificado, o padrão é a operação em colunas. Por exemplo:

> > `cummax ([1, 3, 2, 6, 4, 5])`

> > `%[1, 3, 3, 6, 6, 6]%`

Se chamado com dois argumentos de saída, o índice do valor máximo também é
retornado.

> > `[w, iw] = cummax ([1, 3, 2, 6, 4, 5])`

> > `%M = [1, 3, 3, 6, 6, 6]%`

> > `%IM = [1, 2, 2, 4, 4, 4]%`

Veja também: `cummin`, `max`, `min`.

### Referências

- https://www.mathworks.com/help/matlab/ref/cummax.html
- https://octave.sourceforge.io/octave/function/cummax.html
- https://mathworld.wolfram.com/Maximum.html
- https://pt.wikipedia.org/wiki/Pontos_extremos_de_uma_fun%C3%A7%C3%A3o
