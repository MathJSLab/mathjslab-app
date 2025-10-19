- `RAD = deg2rad (DEG)`

Convert degrees to radians.

The input `DEG` must be a scalar, vector, or N-dimensional array. `DEG` may be
complex in which case the real and imaginary components are converted
separately.

The output `RAD` is the same size and shape as `DEG` with degrees converted to
radians using the conversion constant `%pi/180%`.

Example:

`deg2rad ([0, 90, 180, 270, 360])`

%%deg2rad ([0, 90, 180, 270, 360]) = [0, 1.570796326794896619,
3.141592653589793238, 4.712388980384689857, 6.283185307179586476]%%

See also: `rad2deg`.

### References

- https://www.mathworks.com/help/matlab/ref/deg2rad.html
- https://octave.sourceforge.io/octave/function/deg2rad.html
- https://en.wikipedia.org/wiki/Angle
- https://en.wikipedia.org/wiki/Degree_(angle)
- https://en.wikipedia.org/wiki/Radian
