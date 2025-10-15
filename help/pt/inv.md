- `X = inv (A)`

Calcula a matriz inversa da matriz quadrada `A`.

Em geral é melhor evitar calcular o inverso de uma matriz diretamente. Por
exemplo, é mais rápido e mais preciso resolver sistemas de equações %%A*x = b%%
com `Y = A \ b`, em vez de `Y = inv (A) * b`.

Veja também: `ldivide`, `rdivide`, `pinv`.

### Referências

- https://www.mathworks.com/help/matlab/ref/inv.html
- https://octave.sourceforge.io/octave/function/inv.html
- https://mathworld.wolfram.com/MatrixInverse.html
- https://pt.wikipedia.org/wiki/Matriz_inversa
