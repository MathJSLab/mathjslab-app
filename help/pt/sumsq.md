- `Y = sumsq (X)`
- `Y = sumsq (X, DIM)`

Soma dos quadrados dos elementos ao longo da dimensão `DIM`.

Se `DIM` for omitido, o padrão é a primeira dimensão não singular.

Esta função é conceitualmente equivalente à

> > `sum (x .* conj (x), dim)`

mas usa menos memória e evita chamar '`conj`' se `X` for real.

Veja também: `sum`, `prod`.

### Referências

- https://octave.sourceforge.io/octave/function/sumsq.html
