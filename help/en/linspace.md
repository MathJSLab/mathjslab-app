- `Y = linspace (START, END)`
- `Y = linspace (START, END, N)`

Return a row vector with `N` linearly spaced elements between `START` and
`END`.

If the number of elements `N` is greater than one, then the endpoints `START`
and `END` are always included in the range. If `START` is greater than `END`,
the elements are stored in decreasing order. If the number of points `N` is not
specified, a value of 100 is used.

The `linspace` function returns a row vector when both `START` and `END` are
scalars. If one, or both, inputs are vectors, then `linspace` transforms them
to column vectors and returns a matrix where each row is an independent
sequence between `START(ROW_N), END(ROW_N)`.

Programming Notes: For compatibility with MATLAB&reg;/Octave, return the second
argument (`END`) when a single value (%%N = 1%%) is requested. If `N` is not an
integer then `floor (N)` is used to round the number of elements. If `N` is
zero or negative then an empty 1x0 matrix is returned.

See also: `colon`, `logspace`.

### References

- https://www.mathworks.com/help/matlab/ref/linspace.html
- https://octave.sourceforge.io/octave/function/linspace.html
