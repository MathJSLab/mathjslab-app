- `H = hypot (X, Y)`
- `H = hypot (X, Y, Z, ...)`

Compute the element-by-element square root of the sum of the squares of `X` and
`Y`.

This is equivalent to `sqrt (X.^2 + Y.^2)`, but is calculated in a manner that
avoids overflows for large values of X or Y.

`hypot` can also be called with more than 2 arguments; in this case, the
arguments are accumulated from left to right:

> > `hypot (hypot (X, Y), Z)` `hypot (hypot (hypot (X, Y), Z), W)`

, etc.

### References

- https://www.mathworks.com/help/matlab/ref/hypot.html
- https://octave.sourceforge.io/octave/function/hypot.html
- https://mathworld.wolfram.com/Hypotenuse.html
- https://en.wikipedia.org/wiki/Hypotenuse
