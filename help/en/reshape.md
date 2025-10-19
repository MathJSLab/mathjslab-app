- `B = reshape (A, M, N, ...)`
- `B = reshape (A, [M N ...])`
- `B = reshape (A, ..., [], ...)`
- `B = reshape (A, SIZE)`

Return a matrix with the specified dimensions `(M, N, ...)` whose elements are
taken from the matrix `A`.

The elements of the matrix are accessed in column-major order (like Fortran
arrays are stored).

The following code demonstrates reshaping a 1x4 row vector into a 2x2 square
matrix.

> > `reshape ([1, 2, 3, 4], 2, 2)`

> > `%[1, 3; 2, 4]%`

Note that the total number of elements in the original matrix ('prod (size
(A))') must match the total number of elements in the new matrix ('prod ([M N
...])').

A single dimension of the return matrix may be left unspecified and Octave will
determine its size automatically. An empty matrix ([]) is used to flag the
unspecified dimension.

See also: `resize`, `vec`, `postpad`, `cat`, `squeeze`.

### References

- https://www.mathworks.com/help/matlab/ref/reshape.html
- https://octave.sourceforge.io/octave/function/reshape.html
