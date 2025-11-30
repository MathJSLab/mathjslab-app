- `[Q, R] = qr (A)`
- `[Q, R, P] = qr (A)`
- `X = qr (A)` # non-sparse A
- `R = qr (A)` # sparse A
- `X = qr (A, B)` # sparse A
- `[C, R] = qr (A, B)`
- `[...] = qr (..., 0)`
- `[...] = qr (..., "econ")`
- `[...] = qr (..., "vector")`
- `[...] = qr (..., "matrix")`

Compute the QR factorization of `A`, using standard LAPACK subroutines.

The QR factorization is

> > `Q * R = A`

where `Q` is an orthogonal matrix and `R` is upper triangular.

For example, given the matrix `A = [1, 2; 3, 4]`,

> > `[Q, R] = qr (A)`

returns

> > `%Q=[-0.31623,-0.94868;-0.94868,0.31623]%`

> > `%R=[-3.16228,-4.42719;0,-0.63246]%`

which multiplied together return the original matrix

> > `Q * R`

> > `%[1, 2; 3, 4]%`

If just a single return value is requested then it is either `R`, if `A` is
sparse, or `X`, such that `R = triu (X)` if `A` is full. (Note: unlike most
commands, the single return value is not the first return value when multiple
values are requested.)

If a third output `P` is requested, then `qr` calculates the permuted QR
factorization

> > `Q * R = A * P`

where `Q` is an orthogonal matrix, `R` is upper triangular, and `P` is a
permutation matrix.

If `A` is dense, the permuted QR factorization has the additional property that
the diagonal entries of R are ordered by decreasing magnitude. In other words,
`abs (diag (R))` will be ordered from largest to smallest.

If `A` is sparse, `P` is a fill-reducing ordering of the columns of `A`. In
that case, the diagonal entries of `R` are not ordered by decreasing magnitude.

For example, given the matrix `A = [1, 2; 3, 4]`,

> > `[Q, R, P] = qr (A)`

returns

> > `%Q=[-0.44721,-0.89443;-0.89443,0.44721]%`

> > `%R=[-4.47214,-3.13050;0.00000,0.44721]%`

> > `%P=[0,1;1,0]%`

If the input matrix `A` is sparse, the sparse QR factorization is computed by
using `SPQR` or `CXSPARSE` (e.g., if `SPQR` is notavailable). Because the
matrix `Q` is, in general, a full matrix, it is recommended to request only one
return value `R`. In that case, the computation avoids the construction of `Q`
and returns a sparse `R` such that `R = chol (A' * A)`.

If `A` is dense, an additional matrix `B` is supplied and two return values are
requested, then `qr` returns `C`, where `C = Q' * B`. This allows the least
squares approximation of `A \ B` to be calculated as

> > `[C, R] = qr (A, B)`

> > `X = R \ C`

If `A` is a sparse `MxN` matrix and an additional matrix `B` is supplied, one
or two return values are possible. If one return value `X` is requested and
`M < N`, then `X` is the minimum 2-norm solution of `A \ B`. If `M >= N`, `X`
is the least squares approximation of `A \ B`. If two return values are
requested, `C` and `R` have the same meaning as in the dense case (`C` is dense
and `R` is sparse). The version with one return parameter should be preferred
because it uses less memory and can handle rank-deficient matrices better.

If the final argument is the string `"vector"` then `P` is a permutation vector
(of the columns of `A`) instead of a permutation matrix. In this case, the
defining relationship is:

> > `Q * R = A(:, P)`

The default, however, is to return a permutation matrix and this may be
explicitly specified by using a final argument of `"matrix"`.

If the final argument is the scalar 0 or the string `"econ"`, an economy
factorization is returned. If the original matrix `A` has size `MxN` and
`M > N`, then the economy factorization will calculate just `N` rows in `R` and
`N` columns in `Q` and omit the zeros in `R`. If `M <= N`, there is no
difference between the economy and standard factorizations. When calculating an
economy factorization and `A` is dense, the output `P` is always a vector
rather than a matrix. If `A` is sparse, output `P` is a sparse permutation
matrix.

Background: The QR factorization has applications in the solution of least
squares problems

> > `min norm (A*x - b)`

for overdetermined systems of equations (i.e., `A` is a tall, thin matrix).

The permuted QR factorization `[Q, R, P] = qr (A)` allows the construction of
an orthogonal basis of `span (A)`.

See also: `chol`, `hess`, `lu`, `qz`, `schur`, `svd`, `qrupdate`, `qrinsert`,
`qrdelete`, `qrshift`.

### References

- https://www.mathworks.com/help/matlab/ref/qr.html
- https://octave.sourceforge.io/octave/function/qr.html
- https://github.com/gnu-octave/octave/blob/default/liboctave/numeric/qr.h
- https://github.com/gnu-octave/octave/blob/default/libinterp/corefcn/qr.cc
- https://github.com/gnu-octave/octave/blob/default/liboctave/numeric/qrp.h
- https://mathworld.wolfram.com/QRDecomposition.html
- https://rosettacode.org/wiki/QR_decomposition
- https://en.wikipedia.org/wiki/QR_decomposition
