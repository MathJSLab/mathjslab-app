- `Y = cumprod(X)`
- `Y = cumprod(X, DIM)`

Produto acumulado dos elementos ao longo da dimensão `DIM`.

Se `DIM` for omitido, o padrão é a primeira dimensão não-singular. Por exemplo:

> > `cumprod([1, 2; 3, 4; 5, 6])`

> > %%[1, 2; 3, 8; 15, 48]%%

Veja também: `prod`, `cumsum`.

### Referências

- https://www.mathworks.com/help/matlab/ref/cumprod.html
- https://octave.sourceforge.io/octave/function/cumprod.html
