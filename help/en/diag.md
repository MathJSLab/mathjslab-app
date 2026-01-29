- `M = diag (V)`
- `M = diag (V, K)`
- `M = diag (V, M, N)`
- `V = diag (M)`
- `V = diag (M, K)`

Return a diagonal matrix with vector `V` on diagonal `K`.

The second argument is optional. If it is positive, the vector is placed on the
`K`-th superdiagonal. If it is negative, it is placed on the `-K`-th
subdiagonal. The default value of `K` is `0`, and the vector is placed on the
main diagonal. For example:

> > `diag ([1, 2, 3], 1)`

> > `%[0,1,0,0;0,0,2,0;0,0,0,3;0,0,0,0]%`

The 3-input form returns a diagonal matrix with vector `V` on the main diagonal
and the resulting matrix being of size `M` rows x `N` columns.

Given a matrix argument, instead of a vector, `diag` extracts the `K`-th
diagonal of the matrix.

### References

- https://www.mathworks.com/help/matlab/ref/diag.html
- https://octave.sourceforge.io/octave/function/diag.html
