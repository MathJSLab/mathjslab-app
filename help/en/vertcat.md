- `A = vertcat (ARRAY1, ARRAY2, ..., ARRAYN)`

Return the vertical concatenation of N-D array objects,
`ARRAY1, ARRAY2, ..., ARRAYN` along dimension 1.

Arrays may also be concatenated vertically using the syntax for creating new
matrices. For example:

> > `A = [ ARRAY1; ARRAY2; ... ]`

This syntax is slightly more efficient because the MathJSLab parser can
concatenate the arrays without the overhead of a function call.

See also: `cat`, `horzcat`.

### References

- https://www.mathworks.com/help/matlab/ref/vertcat.html
- https://octave.sourceforge.io/octave/function/vertcat.html
