- `Y = round (X)`

Retorna o número inteiro mais próximo de `X`.

Se `X` for complexo, retorna `round (real (X)) + round (imag (X)) * I`. Se
houver dois números inteiros mais próximos, retorna aquele que estiver mais
distante zero.

> > `round ([-2.7, 2.7])` %% [-3, 3]%%

Veja também: `ceil`, `floor`, `fix`, `roundb`.

### Referências

- https://www.mathworks.com/help/matlab/ref/round.html
- https://octave.sourceforge.io/octave/function/round.html
- https://mathworld.wolfram.com/Rounding.html
- https://pt.wikipedia.org/wiki/Arredondamento
