-- `TF = any (X)` -- `TF = any (X, DIM)`

Para um argumento vetorial, retorna verdadeiro (valor lógico `1`) se algum
elemento do vetor for diferente de zero.

Para um argumento matricial, retorna um vetor linha de uns e zeros lógicos,
onde cada elemento indica se algum dos elementos da coluna correspondente da
matriz é diferente de zero. Por exemplo:

> > `any (eye (2, 4))`
> >
> > > `%[ 1, 1, 0, 0 ]%`

Se o argumento opcional `DIM` for fornecido, opera na dimensão `DIM`. Por
exemplo:

> > `any (eye (2, 4), 2)`
> >
> > > `%[ 1; 1 ]`

Veja também: `all`.

### Referências

- https://www.mathworks.com/help/matlab/ref/any.html
- https://octave.sourceforge.io/octave/function/any.html
