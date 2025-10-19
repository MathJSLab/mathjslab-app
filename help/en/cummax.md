- `M = cummax (X)`
- `M = cummax (X, DIM)`
- `[M, IM] = cummax (...)`

Return the cumulative maximum values along dimension `DIM`.

If `DIM` is unspecified it defaults to column-wise operation. For example:

> > `cummax ([1, 3, 2, 6, 4, 5])`

> > `%[1, 3, 3, 6, 6, 6]%`

If called with two output arguments the index of the maximum value is also
returned.

> > `[w, iw] = cummax ([1, 3, 2, 6, 4, 5])`

> > `%M = [1, 3, 3, 6, 6, 6]%`

> > `%IM = [1, 2, 2, 4, 4, 4]%`

See also: `cummin`, `max`, `min`.

### References

- https://www.mathworks.com/help/matlab/ref/cummax.html
- https://octave.sourceforge.io/octave/function/cummax.html
- https://mathworld.wolfram.com/Maximum.html
- https://en.wikipedia.org/wiki/Maximum_and_minimum
