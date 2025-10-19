- `IND = sub2ind (DIMS, I, J)`
- `IND = sub2ind (DIMS, S1, S2, ..., SN)`

Convert subscripts to linear indices.

The input `DIMS` is a dimension vector where each element is the size of the
array in the respective dimension (see `size`). The remaining inputs are
scalars or vectors of subscripts to be converted.

The output vector `IND` contains the converted linear indices.

Background: Array elements can be specified either by a linear index which
starts at 1 and runs through the number of elements in the array, or they may
be specified with subscripts for the row, column, page, etc. The functions
`ind2sub` and `sub2ind` interconvert between the two forms.

The linear index traverses dimension 1 (rows), then dimension 2 (columns), then
dimension 3 (pages), etc. until it has numbered all of the elements. Consider
the following 3-by-3 matrix:

> > `%['1,1', '1,2', '1,3'; '2,1', '2,2', '2,3'; '3,1', '3,2', '3,3'] = [1, 4, 7; 2, 5, 8; 3, 6, 9]%`

The left matrix contains the subscript tuples for each matrix element. The
right matrix shows the linear indices for the same matrix.

The following example shows how to convert the two-dimensional indices `(2,1)`
and `(2,3)` of a 3-by-3 matrix to linear indices with a single call to
`sub2ind`.

> > `s1 = [2, 2]`

> > `s2 = [1, 3]`

> > `ind = sub2ind ([3, 3], s1, s2)`

> > `%ind = [2, 8]%`

See also: `ind2sub`, `size`.

### References

- https://www.mathworks.com/help/matlab/ref/sub2ind.html
- https://octave.sourceforge.io/octave/function/sub2ind.html
