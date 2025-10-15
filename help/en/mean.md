- `mean (X)`

- `Y = mean (X)`
- `Y = mean (X, 'all')`
- `Y = mean (X, DIM)`
- `Y = mean (..., 'NANFLAG')`

Compute the mean of the elements of `X`.

- If X is a vector, then `mean (X)` returns the mean of the elements in `X`
  defined as

> > `mean (X) = SUM_i X(i) / N`

where `N` is the number of elements in the `X` vector.

- If `X` is a matrix, then `mean` returns a row vector with the mean of each
  column in `X`.

- If `X` is a multi-dimensional array, then `mean` operates along the first
  non-singleton dimension of `X`.

The optional input `DIM` forces `mean` to operate over the specified
dimension(s). `DIM` can either be a scalar dimension or a vector of
non-repeating dimensions. Dimensions must be positive integers, and the mean is
calculated over the array slice defined by `DIM`.

Specifying dimension `'all'` will force `mean` to operate on all elements of
`X`, and is equivalent to `mean (X(:))`.

The optional input `NANFLAG` specifies whether to include/exclude `NaN` values
from the calculation. By default, `NaN` values are included in the calculation
(`NANFLAG` has the value `'includenan'`). To exclude `NaN` values, set the
value of NANFLAG to `'omitnan'`.

See also: `median`, `mode`.

### References

- https://www.mathworks.com/help/matlab/ref/mean.html
- https://octave.sourceforge.io/octave/function/mean.html
- https://mathworld.wolfram.com/ArithmeticMean.html
- https://en.wikipedia.org/wiki/Mean
