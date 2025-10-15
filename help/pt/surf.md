- `surf (X, Y, Z)`
- `surf (Z)`
- `surf (..., C)`
- `surf (..., PROP, VAL, ...)`
- `surf (HAX, ...)`
- `H = surf (...)`

Plot a 3-D surface mesh.

The surface mesh is plotted using shaded rectangles. The vertices of the
rectangles [X, Y] are typically the output of `meshgrid`. over a 2-D
rectangular region in the x-y plane. `Z` determines the height above the plane
of each vertex. If only a single `Z` matrix is given, then it is plotted over
the meshgrid `X = 1:columns (Z), Y = 1:rows (Z)`. Thus, columns of `Z`
correspond to different `X` values and rows of `Z` correspond to different `Y`
values.

The color of the surface is computed by linearly scaling the `Z` values to fit
the range of the current colormap. Use 'caxis' and/or change the colormap to
control the appearance.

Optionally, the color of the surface can be specified independently of `Z` by
supplying a color matrix, `C`.

Any property/value pairs are passed directly to the underlying surface object.
The full list of properties is documented at Surface Properties.

If the first argument `HAX` is an axes handle, then plot into this axes, rather
than the current axes returned by `gca`.

The optional return value `H` is a graphics handle to the created surface
object.

Note: The exact appearance of the surface can be controlled with the `shading`
command or by using `set` to control surface object properties.

See also: `ezsurf`, `surfc`, `surfl`, `surfnorm`, `trisurf`, `contour`, `mesh`,
`surface`, `meshgrid`, `hidden`, `shading`, `colormap`, `caxis`.

### References

- https://www.mathworks.com/help/matlab/ref/surf.html
- https://octave.sourceforge.io/octave/function/surf.html
