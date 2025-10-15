- `[Y1, Y2, ..., Yn] = ndgrid (X1, X2, ..., Xn)`
- `[Y1, Y2, ..., Yn] = ndgrid (X)`

Dados n vetores `X1`, ..., `Xn`, `ndgrid` retorna `n` matrizes de dimensão `n`.

Os elementos do i-ésimo argumento de saída contêm os elementos do vetor `Xi`
repetido em todas as dimensões diferentes da i-ésima dimensão. Chamar `ndgrid`
com apenas um argumento de entrada `X` é equivalente a chamar `ndgrid` com
todos os argumentos de entrada `n` iguais a `X`:

> > `[Y1, Y2, ..., Yn] = ndgrid (X, ..., X)`

Nota de programação: `ndgrid` é muito semelhante à função `meshgrid` exceto que
as duas primeiras dimensões são transpostas em comparação com `meshgrid`.
Algumas funções principais esperam entrada `meshgrid` e outras esperam entrada
`ndgrid`. Verifique a documentação da função em questão para determinar o
formato de entrada adequado.

Veja também: `meshgrid`.

### Referências

- https://www.mathworks.com/help/matlab/ref/ndgrid.html
- https://octave.sourceforge.io/octave/function/ndgrid.html
