- `K = rank (A)`
- `K = rank (A, TOL)`

Compute the numerical rank of matrix `A`.

The rank is determined from the singular values of `A`. Singular values less
than the tolerance `TOL` are treated as zero.

See also: `cond`, `svd`, `qr`.

### References

- https://www.mathworks.com/help/matlab/ref/rank.html
- https://octave.sourceforge.io/octave/function/rank.html
