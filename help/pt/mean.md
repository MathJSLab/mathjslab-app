- `Y = mean (X)`
- `Y = mean (X, 'all')`
- `Y = mean (X, DIM)`
- `Y = mean (..., 'NANFLAG')`

Calcula a média dos elementos de `X`.

- Se X for um vetor, então `mean (X)` retorna a média dos elementos em `X`
  definidos como

> > `mean (X) = SUM_i X(i) / N`

onde `N` é o número de elementos no vetor `X`.

- Se `X` for uma matriz, então `mean` retornará um vetor linha com a média de
  cada coluna em `X`.

- Se `X` for um array multidimensional, então `mean` opera junto a primeira
  dimensão não singular de `X`.

A entrada opcional `DIM` força `mean` a operar sobre a(s) dimensão(ões)
especificada(s). `DIM` pode ser uma dimensão escalar ou um vetor de dimensões
não repetidas. As dimensões devem ser números inteiros positivos, e a média é
calculada sobre a fatia da matriz definida por `DIM`.

Especificar a dimensão `'all'` forçará `mean` a operar em todos elementos de
`X` e é equivalente a `mean (X(:))`.

A entrada opcional `NANFLAG` especifica se deve incluir/excluir valores `NaN`
do cálculo. Por padrão, os valores `NaN` são incluídos no cálculo (`NANFLAG`
tem o valor `'includenan'`). Para que exclua valores `NaN`, defina o valor de
`NANFLAG` como `'omitnan'`.

Veja também: `median`, `mode`.

### Referências

- https://www.mathworks.com/help/matlab/ref/mean.html
- https://octave.sourceforge.io/octave/function/mean.html
- https://mathworld.wolfram.com/ArithmeticMean.html
- https://pt.wikipedia.org/wiki/M%C3%A9dia_aritm%C3%A9tica
