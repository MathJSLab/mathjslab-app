- `Y = floor (X)`

Return the largest integer not greater than `X`.

This is equivalent to rounding towards negative infinity. If `X` is complex,
return %%floor (real (X)) + floor (imag (X)) * I%%.

> > `floor ([-2.7, 2.7])`

> > %%floor ([-2.7, 2.7]) = [-3, 2]%%

See also: `ceil`, `round`, `fix`.

### References

- https://www.mathworks.com/help/matlab/ref/floor.html
- https://octave.sourceforge.io/octave/function/floor.html
- https://mathworld.wolfram.com/FloorFunction.html
- https://en.wikipedia.org/wiki/Floor_and_ceiling_functions
