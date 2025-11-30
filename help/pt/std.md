- `S = std (X)`
- `S = std (X, W)`
- `S = std (X, W, DIM)`
- `S = std (X, W, VECDIM)`
- `S = std (X, W, "ALL")`
- `S = std (..., NANFLAG)`
- `[S, M] = std (...)`

Calcula o desvio padrão dos elementos do vetor `X`.

O desvio padrão é definido como

> > `std (X) = sqrt ((1 / (N-1)) * SUM_i ((X(i) - mean(X))^2))`

onde `N` é o número de elementos de `X`.

Se `X` for uma matriz, calcule o desvio padrão ao longo das primeiras dimensões
não unitárias de `X`.

O argumento opcional `W` determina o esquema de ponderação a ser usado. Os
valores válidos são:

- `0` \[padrão\]:

Normaliza com `N-1` (desvio padrão da população). Isso fornece a raiz quadrada
do melhor estimador não viesado do desvio padrão.

- `1`:

Normaliza com `N` (desvio padrão da amostra). Isso fornece a raiz quadrada do
segundo momento em torno da média.

- um vetor:

Calcula o desvio padrão ponderado com pesos não negativos. O comprimento de `W`
deve ser igual ao tamanho de `X` na dimensão operacional. Valores `NaN` são
permitidos em `W`, serão multiplicados pelos valores associados em `X` e podem
ser excluídos pela opção `NANFLAG`.

- uma matriz:

Semelhante aos pesos vetoriais, mas `W` deve ter o mesmo tamanho que `X`. Se a
dimensão operacional for fornecida como `VECDIM` ou `"all"` e `W` não for um
escalar, `W` deverá ser uma matriz do mesmo tamanho. Nota: `W` deve sempre ser
especificado antes de qualquer uma das opções de dimensão a seguir. Para usar o
valor padrão de `W`, você pode passar um argumento de entrada vazio `[]`.

A variável opcional `DIM` força `std` a operar sobre a dimensão especificada,
que deve ser um número inteiro positivo. Especificar qualquer dimensão única em
`X`, incluindo qualquer dimensão que exceda `ndims(X)`, resultará em um desvio
padrão de `0`.

Especificar as dimensões como `VECDIM`, um vetor de dimensões não repetidas,
retornará o desvio padrão calculado sobre a fatia da matriz definida por
`VECDIM`. Se `VECDIM` indexar todas as dimensões de `X`, será equivalente à
opção `"all"`. Qualquer dimensão em `VECDIM` maior que `ndims(X)` será
ignorada.

Especificar a dimensão como `"all"` forçará `std` a operar em todos os
elementos de `X` e é equivalente a `std(X(:))`. A variável opcional `NANFLAG`
especifica se os valores `NaN` devem ser incluídos ou excluídos do cálculo,
usando qualquer uma das combinações de argumentos de entrada especificadas
anteriormente. O valor padrão para `NANFLAG` é `"includenan"`, que mantém os
valores `NaN` no cálculo. Para excluir os valores `NaN`, defina o valor de
`NANFLAG` como `"omitnan"`. A saída ainda conterá valores `NaN` se `X`
consistir inteiramente de valores `NaN` na dimensão operacional.

A segunda variável de saída opcional, `M`, contém a média dos elementos de `X`
usados para calcular o desvio padrão. Se `V` for o desvio padrão ponderado,
então `M` também será a média ponderada.

Veja também: `var`, `bounds`, `mad`, `range`, `iqr`, `mean`, `median`.

### Referências

- https://www.mathworks.com/help/matlab/ref/std.html
- https://octave.sourceforge.io/octave/function/std.html
