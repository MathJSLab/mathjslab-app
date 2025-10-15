- `H = hypot (X, Y)`
- `H = hypot (X, Y, Z, ...)`

Calcula a raiz quadrada da soma dos quadrados de `X` e `Y`.

Essa função é equivalente a `sqrt (X.^2 + Y.^2)`, mas é calculado de uma
maneira que evita estouros para grandes valores de X ou Y.

`hypot` também pode ser chamado com mais de 2 argumentos; nesse caso, os
argumentos são aplicados cumulativamente da esquerda para a direita:

> > `hypot (hypot (X, Y), Z)` `hypot (hypot (hypot (X, Y), Z), W)`

, etc.

### Referências

- https://www.mathworks.com/help/matlab/ref/hypot.html
- https://octave.sourceforge.io/octave/function/hypot.html
- https://mathworld.wolfram.com/Hypotenuse.html
- https://pt.wikipedia.org/wiki/Hipotenusa
