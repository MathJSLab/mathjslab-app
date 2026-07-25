- `[R1, R2, ..., RN] = deal (A)`
- `[R1, R2, ..., RN] = deal (A1, A2, ..., AN)`

Copy input values into output variables.

With one input, `deal` copies that value to every output. With multiple inputs,
each input is copied to the corresponding output.

`deal` is often useful when assigning values from comma-separated lists,
including lists produced by cell arrays or structure arrays.

See also: `cell2struct`, `struct2cell`, `repmat`.

### References

- https://www.mathworks.com/help/matlab/ref/deal.html
- https://octave.sourceforge.io/octave/function/deal.html
