- `N = ndims (A)`

Return the number of dimensions of `A`.

For any array, the result will always be greater than or equal to 2. Trailing
singleton dimensions are not counted, i.e., trailing dimensions D greater than
2 for which 'size (A, D) = 1'.

> > `ndims (ones (4, 1, 2, 1))`

> > %%3%%

See also: `size`.

### References

- https://www.mathworks.com/help/matlab/ref/ndims.html
- https://octave.sourceforge.io/octave/function/ndims.html
