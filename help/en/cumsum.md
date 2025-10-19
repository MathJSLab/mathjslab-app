- `Y = cumsum (X)`
- `Y = cumsum (X, DIM)`

Cumulative sum of elements along dimension `DIM`.

If `DIM` is omitted, it defaults to the first non-singleton dimension. For
example:

> > `cumsum ([1, 2; 3, 4; 5, 6])`

> > `%[1, 2; 4, 6; 9, 12]%`

See also: `sum`, `cumprod`.

### References

- https://www.mathworks.com/help/matlab/ref/cumsum.html
- https://octave.sourceforge.io/octave/function/cumsum.html
