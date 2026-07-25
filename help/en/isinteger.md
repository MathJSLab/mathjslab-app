- `TF = isinteger (X)`

Return true if `X` is an integer object.

Integer objects include classes such as `int8`, `uint8`, `int16`, `uint16`,
`int32`, `uint32`, `int64`, and `uint64`.

Numeric constants are usually double-precision floating-point values, so
`isinteger (14)` is false unless `14` has been explicitly converted to an
integer class.

See also: `isfloat`, `ischar`, `islogical`, `isnumeric`, `isa`.

### References

- https://www.mathworks.com/help/matlab/ref/isinteger.html
- https://octave.sourceforge.io/octave/function/isinteger.html
