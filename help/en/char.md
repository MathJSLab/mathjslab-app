- `C = char (X)`
- `C = char (X, ...)`
- `C = char (S1, S2, ...)`
- `C = char (CELL_ARRAY)`

Create a character array from numeric arrays, character arrays, strings, or
cell arrays.

Arguments are concatenated vertically. Rows are padded with blanks as needed so
that every row has the same length.

For numeric input, each element is converted to the corresponding character
code. Values outside the supported character-code range are invalid.

For cell arrays, each element is converted separately and concatenated into the
resulting character array.

See also: `string`, `cellstr`, `ischar`.

### References

- https://www.mathworks.com/help/matlab/ref/char.html
- https://octave.sourceforge.io/octave/function/char.html
