- `F = factorial (N)`

Return the factorial of `N` where `N` is a real non-negative integer.

If `N` is a scalar, this is equivalent to `prod (1:N)`. For vector or matrix
arguments, return the factorial of each element in the array.

For non-integers see the generalized factorial function `gamma`. Note that the
factorial function grows large quite quickly, and even with double precision
values overflow will occur if `N > 171`. For such cases consider `gammaln`.

See also: `prod`, `gamma`, `gammainc`, `gammaln`.

### References

- https://www.mathworks.com/help/matlab/ref/factorial.html
- https://octave.sourceforge.io/octave/function/factorial.html
- https://mathworld.wolfram.com/Factorial.html
- https://en.wikipedia.org/wiki/Factorial
