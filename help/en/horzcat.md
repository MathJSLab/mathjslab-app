- `A = horzcat (ARRAY1, ARRAY2, ..., ARRAYN)`

Return the horizontal concatenation of `N-D` array objects, `ARRAY1`, `ARRAY2`,
..., `ARRAYN` along dimension 2.

Arrays may also be concatenated horizontally using the syntax for creating new
matrices. For example:

`A = [ ARRAY1, ARRAY2, ... ]`

This syntax is slightly more efficient because the MathJSLab parser can
concatenate the arrays without the overhead of a function call.

See also: `cat`, `vertcat`.

### References

- https://www.mathworks.com/help/matlab/ref/horzcat.html
- https://octave.sourceforge.io/octave/function/horzcat.html
