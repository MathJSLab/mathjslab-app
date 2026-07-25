- `S = substruct (TYPE, SUBS, ...)`

Create a subscript structure for use with `subsref` or `subsasgn`.

`TYPE` specifies the kind of indexing operation. Valid values are `"()"`,
`"{}"`, and `"."`. `SUBS` contains the associated subscripts, usually as a cell
array for array or cell indexing, or as a field name for structure and object
property access.

For example, `substruct ("()", {3, ":"})` creates a subscript structure that
selects the third row and all columns when passed to `subsref`.

See also: `subsref`, `subsasgn`.

### References

- https://www.mathworks.com/help/matlab/ref/substruct.html
- https://octave.sourceforge.io/octave/function/substruct.html
