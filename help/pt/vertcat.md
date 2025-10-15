- `A = vertcat (ARRAY1, ARRAY2, ..., ARRAYN)`

Retorna a concatenação vertical de matrizes 'N'-dimensionais,
`ARRAY1, ARRAY2, ..., ARRAYN` ao longo da dimensão 1.

Matrizes também podem ser concatenados verticalmente usando a sintaxe para a
criação de novas matrizes. Por exemplo:

> > `A = [MATRIZ1; MATRIZ2; ... ]`

Esta sintaxe é um pouco mais eficiente porque o parser do MathJSLab pode
concatenar as matrizes sem a sobrecarga de uma chamada de função.

Veja também: `cat`, `horzcat`.

### Referências

- https://www.mathworks.com/help/matlab/ref/vertcat.html
- https://octave.sourceforge.io/octave/function/vertcat.html
