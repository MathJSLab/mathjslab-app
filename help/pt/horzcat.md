- `A = horzcat (ARRAY1, ARRAY2, ..., ARRAYN)`

Retorna a concatenação horizontal de matrizes 'N'-dimensionais, `ARRAY1`,
`ARRAY2`, ..., `ARRAYN` ao longo da dimensão 2.

Matrizes também podem ser concatenadas horizontalmente usando a sintaxe para
criação de novas matrizes. Por exemplo:

> > `A = [MATRIZ1, MATRIZ2, ...]`

Esta sintaxe é um pouco mais eficiente porque o parser do MathJSLab pode
concatenar as matrizes sem a sobrecarga de uma chamada de função.

Veja também: `cat`, `vertcat`.

### Referências

- https://www.mathworks.com/help/matlab/ref/horzcat.html
- https://octave.sourceforge.io/octave/function/horzcat.html
