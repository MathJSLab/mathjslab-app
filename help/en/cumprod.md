- `Y = cumprod (X)`
- `Y = cumprod (X, DIM)`

Cumulative product of elements along dimension `DIM`.

If `DIM` is omitted, it defaults to the first non-singleton dimension. For
example:

> > `cumprod ([1, 2; 3, 4; 5, 6])`

> > `%[1, 2; 3, 8; 15, 48]%`

See also: `prod`, `cumsum`.

### References

- https://www.mathworks.com/help/matlab/ref/cumprod.html
- https://octave.sourceforge.io/octave/function/cumprod.html
