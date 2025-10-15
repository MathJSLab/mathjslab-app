- `Y = sind (X)`

Calcula o seno para cada elemento de `X` em graus.

O seno em graus é definido por

> > %%sind(z) = rad2deg(sin(z))%%

A função é mais precisa que `sin` para valores grandes de `X` e para múltiplos
de 180 graus (`X/180` é um número inteiro) onde `sind` retorna `0` em vez de um
valor pequeno na ordem de eps.

Veja também: `asind`, `sin`.

### Referências

- https://www.mathworks.com/help/matlab/ref/sin.html
- https://octave.sourceforge.io/octave/function/sind.html
- https://mathworld.wolfram.com/Sine.html
- https://mathworld.wolfram.com/TrigonometricFunctions.html
- https://pt.wikipedia.org/wiki/Fun%C3%A7%C3%A3o_trigonom%C3%A9trica
