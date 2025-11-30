- `S = std (X)`
- `S = std (X, W)`
- `S = std (X, W, DIM)`
- `S = std (X, W, VECDIM)`
- `S = std (X, W, "ALL")`
- `S = std (..., NANFLAG)`
- `[S, M] = std (...)`

Compute the standard deviation of the elements of the vector `X`.

The standard deviation is defined as

> > `std (X) = sqrt ((1 / (N-1)) * SUM_i ((X(i) - mean(X))^2))`

where `N` is the number of elements of `X`.

If `X` is an array, compute the standard deviation along the first
non-singleton dimensions of `X`.

The optional argument `W` determines the weighting scheme to use. Valid values
are:

- `0` \[default\]:

Normalize with `N-1` (population standard deviation). This provides the square
root of the best unbiased estimator of the standard deviation.

- `1`:

Normalize with `N` (sample standard deviation). This provides the square root
of the second moment around the mean.

- a vector:

Compute the weighted standard deviation with non-negative weights. The length
of `W` must equal the size of `X` in the operating dimension. `NaN` values are
permitted in `W`, will be multiplied with the associated values in `X`, and can
be excluded by the `NANFLAG` option.

- an array:

Similar to vector weights, but `W` must be the same size as `X`. If the
operating dimension is supplied as `VECDIM` or `"all"` and `W` is not a scalar,
`W` must be an same-sized array.

Note: `W` must always be specified before specifying any of the following
dimension options. To use the default value for `W` you may pass an empty input
argument `[]`.

The optional variable `DIM` forces `std` to operate over the specified
dimension, which must be a positive integer-valued number. Specifying any
singleton dimension in `X`, including any dimension exceeding `ndims (X)`, will
result in a standard deviation of `0`.

Specifying the dimensions as `VECDIM`, a vector of non-repeating dimensions,
will return the standard deviation calculated over the array slice defined by
`VECDIM`. If `VECDIM` indexes all dimensions of `X`, then it is equivalent to
the option `"all"`. Any dimension in `VECDIM` greater than `ndims (X)` is
ignored.

Specifying the dimension as `"all"` will force `std` to operate on all elements
of `X`, and is equivalent to `std (X(:))`.

The optional variable `NANFLAG` specifies whether to include or exclude `NaN`
values from the calculation using any of the previously specified input
argument combinations. The default value for `NANFLAG` is `"includenan"` which
keeps `NaN` values in the calculation. To exclude `NaN` values set the value of
`NANFLAG` to `"omitnan"`. The output will still contain `NaN` values if `X`
consists of all `NaN` values in the operating dimension.

The optional second output variable `M` contains the mean of the elements of
`X` used to calculate the standard deviation. If `V` is the weighted standard
deviation, then `M` is also the weighted mean.

See also: `var`, `bounds`, `mad`, `range`, `iqr`, `mean`, `median`.

### References

- https://www.mathworks.com/help/matlab/ref/std.html
- https://octave.sourceforge.io/octave/function/std.html
