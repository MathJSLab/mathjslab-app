- `IDX = find (X)`
- `IDX = find (X, N)`
- `IDX = find (X, N, DIRECTION)`
- `[I, J] = find (...)`
- `[I, J, V] = find (...)`

Return indices of nonzero elements of `X`.

With two outputs, return row and column subscripts. With three outputs, also
return the nonzero values. The optional `N` and `DIRECTION` arguments limit the
search to the first or last matches.

See also: `nonzeros`.

### References

- https://www.mathworks.com/help/matlab/ref/find.html
- https://octave.sourceforge.io/octave/function/find.html
