- `S = struct ()`
- `S = struct (FIELD1, VALUE1, FIELD2, VALUE2, ...)`
- `S = struct (OBJ)`

Create a scalar or array structure and initialize its values.

The `FIELD1`, `FIELD2`, ... variables are strings specifying the names of the
fields and the `VALUE1`, `VALUE2`, ... variables can be of any type.

If the values are cell arrays, create a structure array and initialize its
values. The dimensions of each cell array of values must match. Singleton cells
and non-cell values are repeated so that they fill the entire array. If the
cells are empty, create an empty structure array with the specified field
names.

If the argument is an object, return the underlying struct.

Observe that the syntax is optimized for struct _arrays_. Consider the
following examples:

> > `struct ("foo", 1)`

> > `struct {`

> > `    foo:  1`

> > `}`

> > `struct ("foo", {})`

> > %%[]%%

> > `struct ("foo", { {} })`

> > `struct {`

> > `   foo:`%%{}%%

> > `}`

> > `struct ("foo", {1, 2, 3})`

> > `[`

> > `    struct {`

> > `        foo: 1`

> > `    },`

> > `    struct {`

> > `        foo: 2`

> > `    },`

> > `    struct {`

> > `        foo: 3`

> > `    },`

> > `]`

The first case is an ordinary scalar struct--one field, one value. The second
produces an empty struct array with one field and no values, since being passed
an empty cell array of struct array values. When the value is a cell array
containing a single entry, this becomes a scalar struct with that single entry
as the value of the field. That single entry happens to be an empty cell array.

Finally, if the value is a non-scalar cell array, then 'struct' produces a
struct _array_.

See also: `cell2struct`, `fieldnames`, `getfield`, `setfield`, `rmfield`,
`isfield`, `orderfields`, `isstruct`, `structfun`.

### References

- https://www.mathworks.com/help/matlab/ref/struct.html
- https://octave.sourceforge.io/octave/function/struct.html
