- `DEG = rad2deg (RAD)`

Convert radians to degrees.

The input `RAD` must be a scalar, vector, or N-dimensional array of double or
single floating point values. `RAD` may be complex in which case the real and
imaginary components are converted separately.

The output `DEG` is the same size and shape as `RAD` with radians converted to
degrees using the conversion constant `180/pi`.

Example:

> > `rad2deg ([0, pi/2, pi, 3/2*pi, 2*pi])`

> > %%[0, 90, 180, 270, 360]%%

See also: `deg2rad`.

### References

- https://www.mathworks.com/help/matlab/ref/rad2deg.html
- https://octave.sourceforge.io/octave/function/rad2deg.html
- https://en.wikipedia.org/wiki/Angle
- https://en.wikipedia.org/wiki/Degree_(angle)
- https://en.wikipedia.org/wiki/Radian
