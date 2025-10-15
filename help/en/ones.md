- `VAL = ones (N)`
- `VAL = ones (M, N)`
- `VAL = ones (M, N, K, ...)`
- `VAL = ones ([M, N, ...])`

Return a matrix or N-dimensional array whose elements are all 1.

If invoked with a single scalar integer argument `N`, return a square `N x N`
matrix.

If invoked with two or more scalar integer arguments, or a vector of integer
values, return an array with the given dimensions.

To create a constant matrix whose values are all the same use an expression
such as

> > `val_matrix = val * ones (m, n)`

See also: `zeros`.

### References

- https://www.mathworks.com/help/matlab/ref/ones.html
- https://octave.sourceforge.io/octave/function/ones.html
- https://en.wikipedia.org/wiki/Matrix_of_ones
