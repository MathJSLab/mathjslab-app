- `Y = logspace (A, B)`
- `Y = logspace (A, B, N)`
- `Y = logspace (A, pi)`
- `Y = logspace (A, pi, N)`

Return a row vector with `N` elements logarithmically spaced from %%10^A%% to
%%10^B%%.

If the number of elements `N` is unspecified it defaults to 50.

If `B` is equal to %%pi%%, the points are between %%10^A%% and %%pi%%, _not_
%%10^A%% and %%10^pi%%, which is useful in digital signal processing.

Programming Notes: For compatibility with MATLAB&reg;/Octave, return the
right-hand side of the range (%%10^B%%) when a single value (%%N = 1%%) is
requested. If `N` is not an integer then `floor (N)` is used to round the
number of elements. If `N` is zero or negative then an empty 1x0 matrix is
returned.

See also: `linspace`.

### References

- https://www.mathworks.com/help/matlab/ref/logspace.html
- https://octave.sourceforge.io/octave/function/logspace.html
