- `B = subsasgn (A, S, RHS)`

Perform subscripted assignment on `A` according to the subscript structure `S`.

The subscript structure `S` has fields `type` and `subs`. The `type` field
selects ordinary indexing with `"()"`, cell indexing with `"{}"`, or field and
property assignment with `"."`. The `subs` field contains either `":"`, a cell
array of index values, or the assigned field name.

This is the functional form of assignments such as `A(:, 1:2) = 0`,
`C{1} = value`, or `S.field = value`.

If `S` is an empty structure array with fields `type` and `subs`, return `RHS`.

See also: `subsref`, `substruct`.

### References

- https://www.mathworks.com/help/matlab/ref/subsasgn.html
- https://octave.sourceforge.io/octave/function/subsasgn.html
