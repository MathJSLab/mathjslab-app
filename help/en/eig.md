- `LAMBDA = eig (A)`
- `LAMBDA = eig (A, B)`
- `[V, LAMBDA] = eig (A)`
- `[V, LAMBDA] = eig (A, B)`
- `[V, LAMBDA, W] = eig (A)`
- `[V, LAMBDA, W] = eig (A, B)`
- `[...] = eig (A, BALANCEOPTION)`
- `[...] = eig (A, B, ALGORITHM)`
- `[...] = eig (..., EIGVALOPTION)`

Compute the eigenvalues (`LAMBDA`) and optionally the right eigenvectors (`V`)
and the left eigenvectors (`W`) of a matrix or pair of matrices.

The flag `BALANCEOPTION` can be one of:

- `"balance"` (default) - Preliminary balancing is on.
- `"nobalance"` - Disables preliminary balancing.

The flag `EIGVALOPTION` can be one of:

- `"matrix"` - Return the eigenvalues in a diagonal matrix. (default if 2 or 3
  outputs are requested).
- `"vector"` - Return the eigenvalues in a column vector. (default if only 1
  output is requested, e.g., `LAMBDA = eig (A)`).

The flag `ALGORITHM` can be one of:

- `"chol"` - Use the Cholesky factorization of `B`. (default if `A` is
  symmetric (Hermitian) and `B` is symmetric (Hermitian) positive definite).
- `"qz"` - Use the QZ algorithm. (used whenever `A` or `B` are not symmetric).

|                               | no flag  |  `chol`  |  `qz`  |
| :---------------------------: | :------: | :------: | :----: |
|      both are symmetric       | `"chol"` | `"chol"` | `"qz"` |
| at least one is not symmetric |  `"qz"`  |  `"qz"`  | `"qz"` |

The eigenvalues returned by `eig` are not ordered.

See also: `eigs`, `svd`.

### References

- https://www.mathworks.com/help/matlab/ref/eig.html
- https://octave.sourceforge.io/octave/function/eig.html
- https://mathworld.wolfram.com/Eigenvalue.html
- https://mathworld.wolfram.com/Eigenvector.html
- https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors
