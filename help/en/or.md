- `TF = or (X, Y)`
- `TF = or (X1, X2, ...)`

Return the logical **OR** of `X` and `Y`.

This function is equivalent to the operator syntax `X | Y`. If more than two
arguments are given, the logical **OR** is applied cumulatively from left to
right:

> > `(...((X1 | X2) | X3) | ...)`

See also: `and`, `not`, `xor`.

### References

- https://www.mathworks.com/help/matlab/ref/or.html
- https://octave.sourceforge.io/octave/function/or.html
- https://mathworld.wolfram.com/OR.html
- https://en.wikipedia.org/wiki/Logical_disjunction
