- `Y = ceil (X)`

Return the smallest integer not less than `X`.

This is equivalent to rounding towards positive infinity.

If `X` is complex, return `ceil (real (X)) + ceil (imag (X)) * I`.

> > `ceil ([-2.7, 2.7])`

> > %%ceil ([-2.7, 2.7]) = [-2, 3]%%

See also: `floor`, `round`, `fix`.

### References

- https://www.mathworks.com/help/matlab/ref/ceil.html
- https://octave.sourceforge.io/octave/function/ceil.html
- https://mathworld.wolfram.com/CeilingFunction.html
- https://en.wikipedia.org/wiki/Floor_and_ceiling_functions
