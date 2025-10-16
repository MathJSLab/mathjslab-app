- `Y = floor (X)`

Retorna o maior número inteiro não maior que `X`.

Isso equivale a arredondar para o infinito negativo. Se `X` for complexo,
retorna %%floor (real (X)) + floor (imag (X)) * I%%.

> > `floor ([-2.7, 2.7])`

> > %%floor ([-2.7, 2.7]) = [-3, 2]%%

Veja também: `ceil`, `round`, `fix`.

### Referências

- https://www.mathworks.com/help/matlab/ref/floor.html
- https://octave.sourceforge.io/octave/function/floor.html
- https://mathworld.wolfram.com/FloorFunction.html
- https://pt.wikipedia.org/wiki/Parte_inteira
