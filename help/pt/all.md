-- `TF = all (X)` -- `TF = all (X, DIM)`

Para um argumento vetorial, retorna verdadeiro (valor lógico `1`) se todos os
elementos do vetor forem diferentes de zero.

Para um argumento matricial, retorna um vetor linha de uns e zeros lógicos,
onde cada elemento indica se todos os elementos da coluna correspondente da
matriz são diferentes de zero. Por exemplo:

> > `all ([2, 3; 1, 0])`
> >
> > > `%[ 1, 0 ]%`

Se o argumento opcional `DIM` for fornecido, a função opera na dimensão `DIM`.

Veja também: `any`.

### Referências

- https://www.mathworks.com/help/matlab/ref/all.html
- https://octave.sourceforge.io/octave/function/all.html
