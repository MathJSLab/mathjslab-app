- `V = var (X)`
- `V = var (X, W)`
- `V = var (X, W, DIM)`
- `V = var (X, W, VECDIM)`
- `V = var (X, W, "all")`
- `V = var (..., NANFLAG)`
- `[V, M] = var (...)`

Compute the variance of the elements of the vector `X`.

The variance is defined as

> > `var (X) = (1 / (N-1)) * SUM_i ((X(i) - mean(X))^2)`

where `N` is the number of elements of `X`.

If X is an array, compute the variance along the first non-singleton dimensions
of X.

The optional argument `W` determines the weighting scheme to use. Valid values
are:

- `0` \[default\]:

Normalize with `N-1` (population variance). This provides the square root of
the best unbiased estimator of the variance.

- `1`:

Normalize with `N` (sample variance). This provides the square root of the
second moment around the mean.

- a vector:

Compute the weighted variance with non-negative weights. The length of `W` must
equal the size of `X` in the operating dimension. `NaN` values are permitted in
`W`, will be multiplied with the associated values in `X`, and can be excluded
by the `NANFLAG` option.

- an array:

Similar to vector weights, but W must be the same size as `X`. If the operating
dimension is supplied as `VECDIM` or `"all"` and `W` is not a scalar, `W` must
be an same-sized array.

Note: `W` must always be specified before specifying any of the following
dimension options. To use the default value for `W` you may pass an empty input
argument `[]`.

The optional variable `DIM` forces `var` to operate over the specified
dimension, which must be a positive integer-valued number. Specifying any
singleton dimension in `X`, including any dimension exceeding `ndims (X)`, will
result in a variance of `0`.

Specifying the dimensions as `VECDIM`, a vector of non-repeating dimensions,
will return the variance calculated over the array slice defined by `VECDIM`.
If `VECDIM` indexes all dimensions of `X`, then it is equivalent to the option
`"all"`. Any dimension in `VECDIM` greater than `ndims (X)` is ignored.

Specifying the dimension as `"all"` will force `var` to operate on all elements
of `X`, and is equivalent to `var (X(:))`.

The optional variable `NANFLAG` specifies whether to include or exclude `NaN`
values from the calculation using any of the previously specified input
argument combinations. The default value for `NANFLAG` is `"includenan"` which
keeps `NaN` values in the calculation. To exclude `NaN` values set the value of
`NANFLAG` to `"omitnan"`. The output will still contain `NaN` values if `X`
consists of all `NaN` values in the operating dimension.

The optional second output variable `M` contains the mean of the elements of
`X` used to calculate the variance. If `V` is the weighted variance, then `M`
is also the weighted mean.

See also: `std`, `mean`, `cov`, `skewness`, `kurtosis`, `moment`.

### References

- https://www.mathworks.com/help/matlab/ref/var.html
- https://octave.sourceforge.io/octave/function/var.html
