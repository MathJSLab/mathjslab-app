- `Z = cross (X, Y)`
- `Z = cross (X, Y, DIM)`

Compute the vector cross product of two 3-dimensional vectors `X` and `Y`.

If `X` and `Y` are arrays, the cross product is applied along the first
dimension with three elements.

The optional argument `DIM` forces the cross product to be calculated along the
specified dimension. An error will be produced if the specified dimension is
not three elements in size.

Example Code:

> > `cross ([1, 1, 0], [0, 1, 1])`

> > `%[1  -1   1]%`

> > `cross (magic (3), eye (3), 2)`

> > `%[0,6,-1;-7,0,3;9,-4,0]%`

See also: `dot`, `curl`, `divergence`.

### References

- https://www.mathworks.com/help/matlab/ref/cross.html
- https://octave.sourceforge.io/octave/function/cross.html
