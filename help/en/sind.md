- `Y = sind (X)`

Compute the sine for each element of `X` in degrees.

This is defined as

> > %%sind(z) = rad2deg(sin(z))%%

The function is more accurate than `sin` for large values of `X` and for
multiples of 180 degrees (`X/180` is an integer) where `sind` returns `0`
rather than a small value on the order of eps.

See also: `asind`, `sin`.

### References

- https://www.mathworks.com/help/matlab/ref/sin.html
- https://octave.sourceforge.io/octave/function/sind.html
- https://mathworld.wolfram.com/Sine.html
- https://mathworld.wolfram.com/TrigonometricFunctions.html
- https://en.wikipedia.org/wiki/Sine_and_cosine
- https://en.wikipedia.org/wiki/Trigonometric_functions
