# Arrays, indexing and arithmetic

Square brackets construct numeric arrays. Commas or spaces separate columns;
semicolons separate rows. Parentheses select array entries using one-based
indices. Brackets are construction syntax, not indexing syntax.

```matlab
A = [1,2,3;4,5,6];
third_value = A(1,3);
first_column = A(:,1);
selected_values = A(2,[1,3]);
example_check = third_value == 3 && all(first_column == [1;4]) && all(selected_values == [4,6])
```

`:` selects a range or a complete dimension. `end` denotes the last position in
an indexing dimension. A logical mask selects matching entries:

```matlab
values = [2,7,4,9];
selected_values = values(values > 5);
last_value = values(end);
example_check = all(selected_values == [7,9]) && last_value == 9
```

Parenthesize arithmetic used as the lower bound of a colon range, for example
`(index+1):limit`, to make the intended range explicit.

## Cells and records

Curly braces construct cells and extract their contents. A cell can contain an
array or another value without concatenating it into its neighbors:

```matlab
items = {[1,2],7};
vector_value = items{1};
scalar_value = items{2};
record = struct();
record.values = vector_value;
example_check = all(record.values == [1,2]) && scalar_value == 7
```

Parentheses on a cell select cells; braces select contained values. Numeric
array construction instead concatenates compatible numeric blocks. The kernel
uses object-based numeric values, including real and imaginary components;
these objects should not be interpreted as contiguous native numeric memory.

## Element-wise and matrix operations

| Operation      | Element-wise               | Matrix                            |
| -------------- | -------------------------- | --------------------------------- |
| Multiplication | `.*`                       | `*`                               |
| Right division | `./`                       | `/`                               |
| Left division  | `.\`                       | `\`                               |
| Power          | `.^`                       | `^`                               |
| Transpose      | `.'` (without conjugation) | `'` (complex conjugate transpose) |

Addition and subtraction use `+` and `-` in both cases. Matrix products follow
linear-algebra dimensions. `A\b` solves a supported linear system; it is not
element-wise division.

```matlab
A = [1,2;3,4];
element_squares = A.^2;
matrix_square = A*A;
example_check = all(all(element_squares == [1,4;9,16])) && all(all(matrix_square == [7,10;15,22]))
```

Element-wise operations can expand singleton dimensions. Two sizes are
compatible when each corresponding dimension is equal or one is 1. For example,
adding a column vector to a row vector forms a grid:

```matlab
grid_values = [1;2]+[10,20,30];
example_check = all(all(grid_values == [11,21,31;12,22,32]))
```

This rule does not make incompatible matrix products valid. Do not assume that
every multi-input function implements element-wise expansion: in particular,
function arguments may denote dimensions or options. Check the relevant help
entry rather than inferring behavior from MATLAB syntax.

The kernel also supports empty and multidimensional arrays, but each operation
has its own restrictions. Test the exact dimensions needed by an application
instead of treating a MATLAB compatibility rule as a blanket guarantee.
