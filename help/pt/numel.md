- `N = numel (A)`
- `N = numel (A, IDX1, IDX2, ...)`

Retorna o número de elementos no objeto `A`.

Opcionalmente, se os índices `IDX1`, `IDX2`, ... forem fornecidos, retorna o
número de elementos que resultariam da indexação

> > `A(IDX1, IDX2, ...)`

Observe que os índices não precisam ser números escalares. Por exemplo,

> > `A = 1;`

> > `B = ones (2, 3);`

> > `numel(A,B)`

retornará 6, pois este é o número de maneiras de indexar com `B`. Ou o índice
pode ser a string `":"` que representa o operador dois pontos. Por exemplo,

> > `A = ones (5, 3);`

> > `numel(A, 2, ":")`

retornará 3 porque a segunda linha tem três entradas de coluna.

Veja também: `size`, `length`, `ndims`.

### Referências

- https://www.mathworks.com/help/matlab/ref/numel.html
- https://octave.sourceforge.io/octave/function/numel.html
