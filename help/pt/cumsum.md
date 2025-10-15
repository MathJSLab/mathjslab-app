- `Y = cumsum(X)`
- `Y = cumsum(X, DIM)`

Soma acumulada dos elementos ao longo da dimensão `DIM`.

Se `DIM` for omitido, o padrão é a primeira dimensão não-singular. Por exemplo:

> > `cumsum ([1, 2; 3, 4; 5, 6])`

> > %%[1, 2; 4, 6; 9, 12]%%

Veja também: `sum`, `cumprod`.

### Referências

- https://www.mathworks.com/help/matlab/ref/cumsum.html
- https://octave.sourceforge.io/octave/function/cumsum.html
