- `M = mod (X, Y)`

Compute the modulo of `X` and `Y`.

Conceptually this is given by

> > `x - y .* floor (x ./ y)`

and is written such that the correct modulus is returned for integer types.
This function handles negative values correctly. That is, `mod (-1, 3)` is 2,
not -1, as `rem (-1, 3)` returns.

An error results if the dimensions of the arguments do not agree, or if either
of the arguments is complex.

By convention,

> > `mod (X, 0) = X` `mod (X, Y)` returns a value with the signbit from `Y`

For the opposite conventions see the `rem` function. In general, `mod` is a
better choice than `rem` when any of the inputs are negative numbers or when
the values are periodic.

See also: `rem`.

### References

- https://www.mathworks.com/help/matlab/ref/mod.html
- https://octave.sourceforge.io/octave/function/mod.html
- https://mathworld.wolfram.com/Mod.html
- https://en.wikipedia.org/wiki/Modulo_(mathematics)
- https://en.wikipedia.org/wiki/Modular_arithmetic
