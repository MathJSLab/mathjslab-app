- `M = max (X)`
- `M = max (X, [], DIM)`
- `[M, IM] = max (X)`
- `M = max (X, Y)`

Find maximum values in the array `X`.

For a vector argument, return the maximum value. For a matrix argument, return
a row vector with the maximum value of each column. For a multi-dimensional
array, `max` operates along the first non-singleton dimension.

If the optional third argument `DIM` is present then operate along this
dimension. In this case the second argument is ignored and should be set to the
empty matrix.

For two inputs (`X` and `Y`), return the pairwise maximum according to the
rules for Broadcasting.

Thus,

> > `max (max (X))`

returns the largest element of the 2-D matrix `X`, and

> > `max (2:5, pi)`

> > %%[3.1416, 3.1416, 4.0000, 5.0000]%%

compares each element of the range `2:5` with `pi`, and returns a row vector of
the maximum values.

For complex arguments, the magnitude of the elements are used for comparison.
If the magnitudes are identical, then the results are ordered by phase angle in
the range (-pi, pi]. Hence,

> > `max ([-1 i 1 -i])`

> > %%-1%%

because all entries have magnitude 1, but -1 has the largest phase angle with
value pi.

If called with one input and two output arguments, `max` also returns the first
index of the maximum value(s). Thus,

> > `[x, ix] = max ([1, 3, 5, 2, 5])`

> > %%x = 5%%

> > %%ix = 3%%

See also: `min`, `cummax`, `cummin`.

### References

- https://www.mathworks.com/help/matlab/ref/max.html
- https://octave.sourceforge.io/octave/function/max.html
- https://mathworld.wolfram.com/Maximum.html
- https://en.wikipedia.org/wiki/Maximum_and_minimum
