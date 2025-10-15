- `[Y1, Y2, ..., Yn] = ndgrid (X1, X2, ..., Xn)`
- `[Y1, Y2, ..., Yn] = ndgrid (X)`

Given n vectors `X1`, ..., `Xn`, `ndgrid` returns `n` arrays of dimension `n`.

The elements of the i-th output argument contains the elements of the vector
`Xi` repeated over all dimensions different from the i-th dimension. Calling
`ndgrid` with only one input argument `X` is equivalent to calling `ndgrid`
with all `n` input arguments equal to `X`:

> > `[Y1, Y2, ..., Yn] = ndgrid (X, ..., X)`

Programming Note: `ndgrid` is very similar to the function `meshgrid` except
that the first two dimensions are transposed in comparison to `meshgrid`. Some
core functions expect `meshgrid` input and others expect `ndgrid` input. Check
the documentation for the function in question to determine the proper input
format.

See also: `meshgrid`.

### References

- https://www.mathworks.com/help/matlab/ref/ndgrid.html
- https://octave.sourceforge.io/octave/function/ndgrid.html
