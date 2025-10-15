- `M = cummin (X)`
- `M = cummin (X, DIM)`
- `[M, IM] = cummin (...)`

Return the cumulative minimum values along dimension `DIM`.

If `DIM` is unspecified it defaults to column-wise operation. For example:

> > `cummin ([5, 4, 6, 2, 3, 1])`

> > %%[5, 4, 4, 2, 2, 1]%%

If called with two output arguments the index of the minimum value is also
returned.

> > `[M, IM] = cummin ([5, 4, 6, 2, 3, 1])`

> > %%M = [5, 4, 4, 2, 2, 1]%%

> > %%IM = [1, 2, 2, 4, 4, 6]%%

See also: `cummax`, `min`, `max`.

### References

- https://www.mathworks.com/help/matlab/ref/cummin.html
- https://octave.sourceforge.io/octave/function/cummin.html
- https://mathworld.wolfram.com/Minimum.html
- https://en.wikipedia.org/wiki/Maximum_and_minimum
