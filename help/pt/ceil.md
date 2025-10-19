- `Y = ceil (X)`

Retorna o menor número inteiro não inferior a `X`.

Isso equivale a arredondar para o infinito positivo.

Se `X` é complexo, retorna `ceil (real (X)) + ceil (imag (X)) * I`.

> > `ceil ([-2.7, 2.7])`

> > `%ceil ([-2.7, 2.7]) = [-2, 3]%`

Veja também: `floor`, `round`, `fix`.

### Referências

- https://www.mathworks.com/help/matlab/ref/ceil.html
- https://octave.sourceforge.io/octave/function/ceil.html
- https://mathworld.wolfram.com/CeilingFunction.html
- https://pt.wikipedia.org/wiki/Parte_inteira
