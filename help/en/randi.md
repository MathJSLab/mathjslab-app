- `R = randi (IMAX)`
- `R = randi (IMAX, N)`
- `R = randi (IMAX, M, N, ...)`
- `R = randi ([IMIN IMAX], ...)`

Return random integers in the range `1:IMAX`.

Additional arguments determine the shape of the return matrix. When no
arguments are specified a single random integer is returned. If one argument N
is specified then a square matrix (N x N) is returned. Two or more arguments
will return a multi-dimensional matrix (M x N x ...).

The integer range may optionally be described by a two-element matrix with a
lower and upper bound in which case the returned integers will be on the
interval [IMIN, IMAX].

The following example returns 150 integers in the range 1-10.

> > `ri = randi (10, 150, 1)`

See also: `rand`, `randn`.

### References

- https://www.mathworks.com/help/matlab/ref/randi.html
- https://octave.sourceforge.io/octave/function/randi.html
