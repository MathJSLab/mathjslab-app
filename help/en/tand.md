- `Y = tand (X)`

Compute the tangent for each element of `X` in degrees.

This is defined as

> > `%tand(z) = rad2deg(tan(z))%`

Returns zero for elements where `X/180` is an integer and `Inf` for elements
where `(X-90)/180` is an integer.

See also: `atand`, `tan`.

### References

- https://www.mathworks.com/help/matlab/ref/tand.html
- https://octave.sourceforge.io/octave/function/tand.html
- https://mathworld.wolfram.com/Tangent.html
- https://mathworld.wolfram.com/TrigonometricFunctions.html
- https://en.wikipedia.org/wiki/Trigonometric_functions
