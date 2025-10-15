# Array data structure in MathJSLab

In MATLAB&reg;/Octave there are two types of arrays: general arrays and cell
arrays.

General arrays can be of any size, and can be dynamically reshaped and resized.
It is easy to extract individual rows, columns, or submatrices using a variety
of indexing features. All elements of a general array are of the same type and
size. In general, cell arrays are like general arrays, except that their
elements can be of different types and sizes. All indexing features available
to general arrays is the same to cell arrays.

The general arrays is represented (and indexed) using brackets (`[` and `]`),
and cell arrays uses curly brackets (`{` and `}`).

In MathJSLab, the decimal.js type is used in an object that contains the real
and imaginary part to represent a number. This is what the objects contained in
arrays are like.

Due to the characteristics of the JavaScript engine, arrays containing objects
are arrays of references to objects that are not necessarily contiguous objects
in memory. So, using objects to represent array elements, general arrays are
indistinct from cell arrays in terms of the data structure they store.

In MathJSLab the only difference between general arrays and cell arrays is in
the processing of inputs, especially in evaluation: general arrays nested in
general arrays are concatenated. In cell arrays this does not happen. All
elements (including nested elements) are evaluated and the structure of the
cell array is preserved. This behavior makes MathJSLab treat general arrays and
cell arrays in an equivalent way to MATLAB&reg;/Octave, even though they have
the same data structure for both.
