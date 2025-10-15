- `SZ = size (A)`
- `DIM_SZ = size (A, DIM)`
- `DIM_SZ = size (A, D1, D2, ...)`
- `[ROWS, COLS, ..., DIM_N_SZ] = size (...)`

Return a row vector with the size (number of elements) of each dimension for
the object `A`.

When given a second argument, `DIM`, return the size of the corresponding
dimension. If `DIM` is a vector, return each of the corresponding dimensions.
Multiple dimensions may also be specified as separate arguments.

With a single output argument, '`size`' returns a row vector. When called with
multiple output arguments, '`size`' returns the size of dimension `N` in the
`N`th argument. The number of rows, dimension 1, is returned in the first
argument, the number of columns, dimension 2, is returned in the second
argument, etc. If there are more dimensions in A than there are output
arguments, '`size`' returns the total number of elements in the remaining
dimensions in the final output argument.

Example 1: single row vector output

> > `size ([1, 2; 3, 4; 5, 6])`

> > %%[ 3, 2 ]%%

Example 2: number of elements in 2nd dimension (columns)

> > `size ([1, 2; 3, 4; 5, 6], 2)`

> > %%2%%

Example 3: number of output arguments `==` number of dimensions

> > `[nr, nc] = size ([1, 2; 3, 4; 5, 6])`

> > %%nr = 3%%

> > %%nc = 2%%

Example 4: number of output arguments `<` number of dimensions

> > `[nr, remainder] = size (ones (2, 3, 4, 5))`

> > %%nr = 2%%

> > %%remainder = 60%%

See also: `numel`, `ndims`, `length`, `rows`, `columns`, `size_equal`,
`common_size`.

### References

- https://www.mathworks.com/help/matlab/ref/size.html
- https://octave.sourceforge.io/octave/function/size.html
