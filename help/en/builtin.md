- `builtin (FCN, ARG1, ARG2, ...)`
- `[OUT1, OUT2, ...] = builtin (FCN, ARG1, ARG2, ...)`

Call the base function `FCN` even if it is overloaded for the current argument
types.

This is useful inside overloaded methods that need to delegate part of their
work to the original built-in implementation.

See also: `feval`, `functions`.

### References

- https://www.mathworks.com/help/matlab/ref/builtin.html
- https://octave.sourceforge.io/octave/function/builtin.html
