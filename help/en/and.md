- `TF = and (X, Y)`
- `TF = and (X1, X2, ...)`

Return the logical **AND** of `X` and `Y`.

This function is equivalent to the operator syntax `X & Y`. If more than two
arguments are given, the logical **AND** is applied cumulatively from left to
right:

> > `(...((X1 & X2) & X3) & ...)`

See also: `or`, `not`, `xor`.

### References

- https://www.mathworks.com/help/matlab/ref/and.html
- https://octave.sourceforge.io/octave/function/and.html
- https://mathworld.wolfram.com/AND.html
- https://en.wikipedia.org/wiki/Logical_conjunction
