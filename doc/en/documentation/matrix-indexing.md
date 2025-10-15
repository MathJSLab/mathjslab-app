# Matrix Indexing in MathJSLab

> By Steve Eddins and Loren Shure, MathWorks, Source:
> https://www.mathworks.com/company/newsletters/articles/matrix-indexing-in-matlab.html

Indexing into a matrix is a means of selecting a subset of elements from the
matrix. MATLAB&reg; has several indexing styles that are not only powerful and
flexible, but also readable and expressive. Indexing is a key to the
effectiveness of MATLAB at capturing matrix-oriented ideas in understandable
computer programs.

Indexing is also closely related to another term MATLAB users often hear:
vectorization. Vectorization means using MATLAB language constructs to
eliminate program loops, usually resulting in programs that run faster and are
more readable. Of the many possible vectorization techniques, many rely on
MATLAB indexing methods, five of which are described in this article.

## Indexing Vectors

Let's start with the simple case of a vector and a single subscript. The vector
is:

```
v = [16 5 9 4 2 11 7 14];
```

The subscript can be a single value:

```
v(3) % Extract the third element
ans =
      9
```

Or the subscript can itself be another vector:
