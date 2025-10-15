- `TF = and (X, Y)`
- `TF = and (X1, X2, ...)`

Retorna a operação lógica **AND** entre `X` e `Y`.

Esta função é equivalente à sintaxe do operador `X & Y`. Se mais de dois
argumentos são fornecidos, a operação lógica **AND** é aplicada cumulativamente
da esquerda para a direita:

> > `(...((X1 & X2) & X3) & ...)`

Veja também: `or`, `not`, `xor`.

### Referências

- https://www.mathworks.com/help/matlab/ref/and.html
- https://octave.sourceforge.io/octave/function/and.html
- https://mathworld.wolfram.com/AND.html
- https://pt.wikipedia.org/wiki/Conjun%C3%A7%C3%A3o_l%C3%B3gica
