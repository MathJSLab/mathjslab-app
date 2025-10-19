- `M = min (X)`
- `M = min (X, [], DIM)`
- `[M, IM] = min (X)`
- `M = min (X, Y)`

Find minimum values in the array `X`.

For a vector argument, return the minimum value. For a matrix argument, return
a row vector with the minimum value of each column. For a multi-dimensional
array, `min` operates along the first non-singleton dimension.

If the optional third argument `DIM` is present then operate along this
dimension. In this case the second argument is ignored and should be set to the
empty matrix.

For two inputs (`X` and `Y`), return the pairwise minimum according to the
rules for Broadcasting.

Thus,

> > `min (min (X))`

returns the smallest element of the 2-D matrix `X`, and

> > `min (2:5, pi)`

> > `%[2, 3, 3.1416, 3.1416]%`

compares each element of the range `2:5` with `pi`, and returns a row vector of
the minimum values.

For complex arguments, the magnitude of the elements are used for comparison.
If the magnitudes are identical, then the results are ordered by phase angle in
the range (-pi, pi]. Hence,

> > `min ([-1 i 1 -i])`

> > `%-i%`

because all entries have magnitude 1, but -i has the smallest phase angle with
value -pi/2.

If called with one input and two output arguments, `min` also returns the first
index of the minimum value(s). Thus,

> > `[x, ix] = min ([1, 3, 0, 2, 0])`

> > `%x = 0%`

> > `%ix = 3%`

See also: `max`, `cummin`, `cummax`.

### References

- https://www.mathworks.com/help/matlab/ref/min.html
- https://octave.sourceforge.io/octave/function/min.html
- https://mathworld.wolfram.com/Minimum.html
- https://en.wikipedia.org/wiki/Maximum_and_minimum
