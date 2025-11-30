-- `TF = any (X)` -- `TF = any (X, DIM)`

For a vector argument, return true (logical `1`) if any element of the vector
is nonzero.

For a matrix argument, return a row vector of logical ones and zeros with each
element indicating whether any of the elements of the corresponding column of
the matrix are nonzero. For example:

> > `any (eye (2, 4))`
> >
> > > `%[ 1, 1, 0, 0 ]%`

If the optional argument `DIM` is supplied, work along dimension `DIM`. For
example:

> > `any (eye (2, 4), 2)`
> >
> > > `%[ 1; 1 ]`

See also: `all`.

### References

- https://www.mathworks.com/help/matlab/ref/any.html
- https://octave.sourceforge.io/octave/function/any.html
