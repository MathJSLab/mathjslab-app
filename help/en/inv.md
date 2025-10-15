- `X = inv (A)`

Compute the inverse of the square matrix `A`.

In general it is best to avoid calculating the inverse of a matrix directly.
For example, it is both faster and more accurate to solve systems of equations
%%A*x = b%% with `Y = A \ b`, rather than `Y = inv (A) * b`.

See also: `ldivide`, `rdivide`, `pinv`.

### References

- https://www.mathworks.com/help/matlab/ref/inv.html
- https://octave.sourceforge.io/octave/function/inv.html
- https://mathworld.wolfram.com/MatrixInverse.html
- https://en.wikipedia.org/wiki/Invertible_matrix
