- `C = times (A, B)`
- `C = times (A1, A2, ...)`

Return the element-by-element multiplication product of inputs.

This function and `A .* B` are equivalent. If more arguments are given, the
multiplication is applied cumulatively from left to right:

> > `(...((A1 .* A2) .* A3) .* ...)`

See also: `mtimes`, `rdivide`.

### References

- https://www.mathworks.com/help/matlab/ref/times.htm
- https://octave.sourceforge.io/octave/function/times.html
- https://mathworld.wolfram.com/Multiplication.html
- https://mathworld.wolfram.com/Times.html
- https://en.wikipedia.org/wiki/Multiplication
- https://en.wikipedia.org/wiki/Product_(mathematics)
- https://en.wikipedia.org/wiki/Multiplication_sign
