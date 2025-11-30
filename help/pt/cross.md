- `Z = cross (X, Y)`
- `Z = cross (X, Y, DIM)`

Calcula o produto vetorial de dois vetores tridimensionais `X` e `Y`.

Se `X` e `Y` forem arrays, o produto vetorial é aplicado ao longo da primeira
dimensão com três elementos.

O argumento opcional `DIM` força o cálculo do produto vetorial ao longo da
dimensão especificada. Um erro será gerado se a dimensão especificada não tiver
três elementos.

Exemplo de código:

> > `cross ([1, 1, 0], [0, 1, 1])`

> > `%[1 -1 1]%`

> > `cross (magic (3), eye (3), 2)`

> > `%[0,6,-1;-7,0,3;9,-4,0]%`

Veja também: `dot`, `curl`, `divergence`.

### Referências

- https://www.mathworks.com/help/matlab/ref/cross.html
- https://octave.sourceforge.io/octave/function/cross.html
