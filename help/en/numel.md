- `N = numel (A)`
- `N = numel (A, IDX1, IDX2, ...)`

Return the number of elements in the object `A`.

Optionally, if indices `IDX1`, `IDX2`, ... are supplied, return the number of
elements that would result from the indexing

> > `A(IDX1, IDX2, ...)`

Note that the indices do not have to be scalar numbers. For example,

> > `A = 1;`

> > `B = ones (2, 3);`

> > `numel (A, B)`

will return 6, as this is the number of ways to index with `B`. Or the index
could be the string `":"` which represents the colon operator. For example,

> > `A = ones (5, 3);`

> > `numel (A, 2, ":")`

will return 3 as the second row has three column entries.

See also: `size`, `length`, `ndims`.

### References

- https://www.mathworks.com/help/matlab/ref/numel.html
- https://octave.sourceforge.io/octave/function/numel.html
