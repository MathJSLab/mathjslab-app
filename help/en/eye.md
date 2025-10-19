- `I = eye (N)`
- `I = eye (M, N)`
- `I = eye ([M N])`

Return an identity matrix.

If invoked with a single scalar argument `N`, return a square `N x N` identity
matrix.

If supplied two scalar arguments `(M, N)`, `eye` takes them to be the number of
rows and columns. If given a vector with two elements, `eye` uses the values of
the elements as the number of rows and columns, respectively. For example:

> > `eye (3)`

> > `%eye (3) = [1,0,0;0,1,0;0,0,1]%`

The following expressions all produce the same result:

> > `eye (2)`

> > `eye (2, 2)`

> > `eye (size ([1, 2; 3, 4]))`

Calling `eye` with no arguments is equivalent to calling it with an argument
of 1. Any negative dimensions are treated as zero. These odd definitions are
for compatibility with
[MATLAB&reg;](https://www.mathworks.com/)/[Octave](https://www.gnu.org/software/octave/).

See also: `ones`, `zeros`.

### References

- https://www.mathworks.com/help/matlab/ref/eye.html
- https://octave.sourceforge.io/octave/function/eye.html
- https://mathworld.wolfram.com/IdentityMatrix.html
- https://en.wikipedia.org/wiki/Identity_matrix
