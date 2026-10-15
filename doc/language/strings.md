# Text and quote styles

MathJSLab accepts single-quoted and double-quoted text. Its runtime
`CharString` preserves the source quote style and stores the value as a row
character vector. Both forms use that same runtime representation; double
quotes do not establish MATLAB's separate scalar string-array semantics.

```matlab
single_quoted = 'lesson';
double_quoted = "lesson";
```

An apostrophe also denotes conjugate transpose when it follows an expression.
Use `.'` for transpose without complex conjugation. Quote delimiters therefore
need to be distinguished from transpose operators when reading expressions.

The kernel owns escape processing, text indexing and conversion. Consult the
installed package's help for the operation you need. MATLAB's distinction
between character arrays and string arrays should not be assumed to apply to
MathJSLab merely because both quote styles are accepted.
