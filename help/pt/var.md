- `V = var (X)`
- `V = var (X, W)`
- `V = var (X, W, DIM)`
- `V = var (X, W, VECDIM)`
- `V = var (X, W, "all")`
- `V = var (..., NANFLAG)`
- `[V, M] = var (...)`

Calcula a variância dos elementos do vetor `X`.

A variância é definida como

> > `var (X) = (1 / (N-1)) * SUM_i ((X(i) - mean(X))^2)`

onde `N` é o número de elementos de `X`.

Se X for uma matriz, calcule a variância ao longo das primeiras dimensões não
unitárias de X.

O argumento opcional `W` determina o esquema de ponderação a ser usado. Os
valores válidos são:

- `0` \[padrão\]:

Normaliza com N-1 (variância da população). Isso fornece a raiz quadrada do
melhor estimador não viesado da variância.

- `1`:

Normaliza com N (variância da amostra). Isso fornece a raiz quadrada do segundo
momento em torno da média.

- um vetor:

Calcula a variância ponderada com pesos não negativos. O comprimento de `W`
deve ser igual ao tamanho de `X` na dimensão operacional. Valores `NaN` são
permitidos em `W`, serão multiplicados pelos valores associados em `X` e podem
ser excluídos pela opção `NANFLAG`.

- uma matriz:

Semelhante aos pesos vetoriais, mas W deve ter o mesmo tamanho que `X`. Se a
dimensão operacional for fornecida como `VECDIM` ou `"all"` e `W` não for um
escalar, `W` deverá ser uma matriz do mesmo tamanho.

Nota: `W` deve sempre ser especificado antes de qualquer uma das opções de
dimensão a seguir. Para usar o valor padrão de `W`, você pode passar um
argumento de entrada vazio `[]`.

A variável opcional `DIM` força `var` a operar sobre a dimensão especificada,
que deve ser um número inteiro positivo. Especificar qualquer dimensão única em
`X`, incluindo qualquer dimensão que exceda `ndims(X)`, resultará em uma
variância de `0`.

Especifica as dimensões como `VECDIM`, um vetor de dimensões não repetidas,
retornará a variância calculada sobre a fatia da matriz definida por `VECDIM`.
Se `VECDIM` indexar todas as dimensões de `X`, será equivalente à opção
`"all"`. Qualquer dimensão em `VECDIM` maior que `ndims(X)` será ignorada.

Especifica a dimensão como `"all"` forçará `var` a operar em todos os elementos
de `X` e é equivalente a `var(X(:))`.

A variável opcional `NANFLAG` especifica se os valores NaN devem ser incluídos
ou excluídos do cálculo, usando qualquer uma das combinações de argumentos de
entrada especificadas anteriormente. O valor padrão para `NANFLAG` é
`"includenan"`, que mantém os valores `NaN` no cálculo. Para excluir os valores
`NaN`, defina o valor de `NANFLAG` como `"omitnan"`. A saída ainda conterá
valores `NaN` se `X` consistir inteiramente de valores `NaN` na dimensão
operacional.

A segunda variável de saída opcional, `M`, contém a média dos elementos de `X`
usados para calcular a variância. Se `V` for a variância ponderada, então `M`
também será a média ponderada.

Veja também: `std`, `mean`, `cov`, `skewness`, `kurtosis`, `moment`.

### Referências

- https://www.mathworks.com/help/matlab/ref/var.html
- https://octave.sourceforge.io/octave/function/var.html
