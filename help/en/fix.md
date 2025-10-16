- `Y = fix (X)`

Truncate fractional portion of `X` and return the integer portion.

This is equivalent to rounding towards zero. If `X` is complex, return %%fix
(real (X)) + fix (imag (X)) * I%%.

> > `fix ([-2.7, 2.7])`

> > %%fix ([-2.7, 2.7]) = [-2, 2]%%

See also: `ceil`, `floor`, `round`.

### References

- https://www.mathworks.com/help/matlab/ref/fix.html
- https://octave.sourceforge.io/octave/function/fix.html
