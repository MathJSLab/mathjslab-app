- `evalin (CONTEXT, TRY)`
- `evalin (CONTEXT, TRY, CATCH)`

Evaluate the string `TRY` in another workspace context.

The `CONTEXT` argument is normally `"caller"` or `"base"`. If `CATCH` is
supplied and evaluation of `TRY` fails, evaluate `CATCH`.

See also: `eval`, `assignin`.

### References

- https://www.mathworks.com/help/matlab/ref/evalin.html
- https://octave.sourceforge.io/octave/function/evalin.html
