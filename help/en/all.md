-- `TF = all (X)` -- `TF = all (X, DIM)`

For a vector argument, return true (logical `1` ) if all elements of the vector
are nonzero.

For a matrix argument, return a row vector of logical ones and zeros with each
element indicating whether all of the elements of the corresponding column of
the matrix are nonzero. For example:

> > `all ([2, 3; 1, 0])`
> >
> > > `%[ 1, 0 ]%`

If the optional argument `DIM` is supplied, work along dimension `DIM`.

See also: `any`.

### References

- https://www.mathworks.com/help/matlab/ref/all.html
- https://octave.sourceforge.io/octave/function/all.html
