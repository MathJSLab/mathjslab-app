- `Z = dot (X, Y)`
- `Z = dot (X, Y, DIM)`

Compute the dot product of two vectors.

If `X` and `Y` are matrices, calculate the dot products along the first
non-singleton dimension.

If the optional argument `DIM` is given, calculate the dot products along this
dimension.

Implementation Note: This is equivalent to `sum (conj (X) .* Y, DIM)`, but
avoids forming a temporary array and is faster. When `X` and `Y` are column
vectors, the result is equivalent to `X' * Y`. Although, `dot` is defined for
integer arrays, the output may differ from the expected result due to the
limited range of integer objects.

See also: `cross`, `divergence`, `tensorprod`.

### References

- https://www.mathworks.com/help/matlab/ref/dot.html
- https://octave.sourceforge.io/octave/function/dot.html
