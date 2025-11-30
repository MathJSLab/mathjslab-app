- `Y = sumsq (X)`
- `Y = sumsq (X, DIM)`

Sum of squares of elements along dimension `DIM`.

If `DIM` is omitted, it defaults to the first non-singleton dimension.

This function is conceptually equivalent to computing

> > `sum (x .* conj (x), dim)`

but it uses less memory and avoids calling '`conj`' if `X` is real.

See also: `sum`, `prod`.

### References

- https://octave.sourceforge.io/octave/function/sumsq.html
