- `[S1, S2, ..., SN] = ind2sub (DIMS, IND)

Convert linear indices to subscripts.

The input `DIMS` is a dimension vector where each element is the size of the
array in the respective dimension (see `size`). The second input `IND` contains
linear indices to be converted.

The outputs `S1`, ..., `SN` contain the converted subscripts.

Background: Array elements can be specified either by a linear index which
starts at 1 and runs through the number of elements in the array, or they may
be specified with subscripts for the row, column, page, etc. The functions
`ind2sub` and `sub2ind` interconvert between the two forms.

The linear index traverses dimension 1 (rows), then dimension 2 (columns), then
dimension 3 (pages), etc. until it has numbered all of the elements. Consider
the following 3-by-3 matrices:

> > `%[1,4,7;2,5,8;3,6,9]%`

> > `%['1,1', '1,2', '1,3'; '2,1', '2,2', '2,3'; '3,1', '3,2', '3,3']%`

The first matrix contains the linear indices for each matrix element. The
second matrix shows the subscript tuples for the same matrix.

The following example shows how to convert the linear indices '2' and '8' to
appropriate subscripts of a 3-by-3 matrix.

> > `ind = [2, 8]`

> > `[r, c] = ind2sub ([3, 3], ind)`

> > `%r = [2, 2]%`

> > `%c = [1, 3]%`

If the number of output subscripts exceeds the number of dimensions, the
exceeded dimensions are set to '1'. On the other hand, if fewer subscripts than
dimensions are provided, the exceeding dimensions are merged into the final
requested dimension. For clarity, consider the following examples:

> > `ind  = [2, 8]`

> > `dims = [3, 3]`

> > `# same as dims = [3, 3, 1]`

> > `[r, c, s] = ind2sub (dims, ind)`

> > `%r = [2, 2]%`

> > `%c = [1, 3]%`

> > `%s = [1, 1]%`

> > `# same as dims = [9]`

> > `r = ind2sub (dims, ind)`

> > `%r = [2, 8]%`

See also: `sub2ind`, `size`.

### References

- https://www.mathworks.com/help/matlab/ref/ind2sub.html
- https://octave.sourceforge.io/octave/function/ind2sub.html
- https://en.wikipedia.org/wiki/Row-_and_column-major_order
