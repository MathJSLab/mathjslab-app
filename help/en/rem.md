- `R = rem (X, Y)`

Return the remainder of the division `X / Y`.

The remainder is computed using the expression

> > `x - y .* fix (x ./ y)`

An error message is printed if the dimensions of the arguments do not agree, or
if either argument is complex.

By convention,

> > `rem (X, 0) = NaN` if `X` is a floating point variable

> > `rem (X, 0) = 0` if `X` is an integer variable

> > `rem (X, Y)` returns a value with the signbit from `X`

For the opposite conventions see the `mod` function. In general, `rem` is best
when computing the remainder after division of two _positive_ numbers. For
negative numbers, or when the values are periodic, `mod` is a better choice.

See also: `mod`.

### References

- https://www.mathworks.com/help/matlab/ref/rem.html
- https://octave.sourceforge.io/octave/function/rem.html
- https://mathworld.wolfram.com/Remainder.html
- https://en.wikipedia.org/wiki/Remainder
