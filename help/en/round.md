- `Y = round (X)`

Return the integer nearest to `X`.

If `X` is complex, return `round (real (X)) + round (imag (X)) * I`. If there
are two nearest integers, return the one further away from zero.

> > `round ([-2.7, 2.7])` %%[-3, 3]%%

See also: `ceil`, `floor`, `fix`, `roundb`.

### References

- https://www.mathworks.com/help/matlab/ref/round.html
- https://octave.sourceforge.io/octave/function/round.html
- https://mathworld.wolfram.com/Rounding.html
- https://en.wikipedia.org/wiki/Rounding
