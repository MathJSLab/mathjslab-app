- `Y = fix (X)`

Trunca a parte fracionária de `X` e retorna a parte inteira.

Isso equivale a arredondar para zero. Se `X` for complexo, retorna
`%fix (real (X)) + fix (imag (X)) * I%`.

> > `fix ([-2.7, 2.7])`

> > `%fix ([-2.7, 2.7]) = [-2, 2]%`

Veja também: `ceil`, `floor`, `round`.

### Referências

- https://www.mathworks.com/help/matlab/ref/fix.html
- https://octave.sourceforge.io/octave/function/fix.html
- https://pt.wikipedia.org/wiki/Parte_inteira
