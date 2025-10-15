- `[XX, YY] = meshgrid (X, Y)`
- `[XX, YY, ZZ] = meshgrid (X, Y, Z)`
- `[XX, YY] = meshgrid (X)`
- `[XX, YY, ZZ] = meshgrid (X)`

Given vectors of `X` and `Y` coordinates, return matrices `XX` and `YY`
corresponding to a full 2-D grid.

The rows of `XX` are copies of `X`, and the columns of `YY` are copies of `Y`.
If `Y` is omitted, then it is assumed to be the same as `X`.

If the optional `Z` input is given, or `ZZ` is requested, then the output will
be a full 3-D grid. If `Z` is omitted and `ZZ` is requested, it is assumed to
be the same as `Y`.

`meshgrid` is most frequently used to produce input for a 2-D or 3-D function
that will be plotted. The following example creates a surface plot of the
"sombrero" function.

> > `f = @(x,y) sin (sqrt (x.^2 + y.^2)) ./ sqrt (x.^2 + y.^2);`

> > `range = linspace (-8, 8, 41);`

> > `[X, Y] = meshgrid (range, range);`

> > `Z = f (X, Y);`

> > `surf (X, Y, Z);`

Programming Note: `meshgrid` is restricted to 2-D or 3-D grid generation. The
`ndgrid` function will generate 1-D through N-D grids. However, the functions
are not completely equivalent. If `X` is a vector of length `M` and `Y` is a
vector of length `N`, then `meshgrid` will produce an output grid which is NxM.
`ndgrid` will produce an output which is MxN (transpose) for the same input.
Some core functions expect `meshgrid` input and others expect `ndgrid` input.
Check the documentation for the function in question to determine the proper
input format.

See also: `ndgrid`, `mesh`, `contour`, `surf`.

### References

- https://www.mathworks.com/help/matlab/ref/meshgrid.html
- https://octave.sourceforge.io/octave/function/meshgrid.html
