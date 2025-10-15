- `C = mtimes (A, B)`
- `C = mtimes (A1, A2, ...)`

Return the matrix multiplication product of inputs.

This function and `A * B` are equivalent. If more arguments are given, the
multiplication is applied cumulatively from left to right:

> > `(...((A1 * A2) * A3) * ...)`

See also: `times`, `plus`, `minus`, `rdivide`, `mrdivide`, `mldivide`,
`mpower`.

### References

- https://www.mathworks.com/help/matlab/ref/mtimes.html
- https://octave.sourceforge.io/octave/function/mtimes.html
- https://mathworld.wolfram.com/MatrixMultiplication.html
- https://en.wikipedia.org/wiki/Matrix_multiplication
