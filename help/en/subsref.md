- `B = subsref (A, S)`

Perform subscripted reference on `A` according to the subscript structure `S`.

The subscript structure `S` has fields `type` and `subs`. The `type` field
selects ordinary indexing with `"()"`, cell indexing with `"{}"`, or field and
property access with `"."`. The `subs` field contains either `":"`, a cell
array of index values, or the referenced field name.

This is the functional form of expressions such as `A(:, 1:2)`, `C{1}`, or
`S.field`.

If `S` is an empty structure array with fields `type` and `subs`, return `A`.

See also: `subsasgn`, `substruct`.

### References

- https://www.mathworks.com/help/matlab/ref/subsref.html
- https://octave.sourceforge.io/octave/function/subsref.html
