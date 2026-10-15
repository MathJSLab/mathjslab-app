# Linear indexing and storage order

Linear indexing visits a numeric matrix column by column. For a matrix with
`rows` rows, entry `(row,column)` has one-based linear index
`row + (column-1)*rows`.

```matlab
A = [1,2,3;4,5,6];
linear_values = A(:);
example_check = all(linear_values == [1;4;2;5;3;6]) && A(4) == 5
```

For dimensions $d_1,\ldots,d_n$ and one-based subscripts $i_1,\ldots,i_n$, the
corresponding column-major linear index is

$$
1+\sum_{k=1}^{n}(i_k-1)\prod_{j=1}^{k-1}d_j.
$$

This is an indexing convention. The JavaScript implementation stores references
to value objects; it does not promise a contiguous native memory block.
Row-major storage instead places successive elements of a row next to each
other. Neither physical-storage terminology nor a renderer's table layout
should change the language's linear-index order.
