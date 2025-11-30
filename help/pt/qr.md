- `[Q, R] = qr (A)`
- `[Q, R, P] = qr (A)`
- `X = qr (A)` # A não esparsa
- `R = qr (A)` # A esparsa
- `X = qr (A, B)` # A esparsa
- `[C, R] = qr (A, B)`
- `[...] = qr (..., 0)`
- `[...] = qr (..., "econ")`
- `[...] = qr (..., "vector")`
- `[...] = qr (..., "matrix")`

Calcula a fatoração QR de `A`, usando sub-rotinas padrão do LAPACK.

A fatoração QR é

> > `Q * R = A`

onde `Q` é uma matriz ortogonal e `R` é triangular superior.

Por exemplo, dada a matriz `A = [1, 2; 3, 4]`,

> > `[Q, R] = qr (A)`

retorna

> > `%Q=[-0.31623,-0.94868;-0.94868,0.31623]%`

> > `%R=[-3.16228,-4.42719;0,-0.63246]%`

que, multiplicados entre si, retornam a matriz original

> > `Q * R`

> > `%[1, 2; 3, 4]%`

Se apenas um único valor de retorno for solicitado, ele será `R`, se `A` for
esparsa, ou `X`, tal que `R = triu (X)` se `A` for cheia. (Observação:
diferentemente da maioria dos comandos, o valor de retorno único não é o
primeiro valor de retorno quando vários valores são solicitados.)

Se uma terceira saída `P` for solicitada, então `qr` calcula a fatoração QR
permutada.

> > `Q * R = A * P`

onde `Q` é uma matriz ortogonal, `R` é triangular superior e `P` é uma matriz
de permutação.

Se `A` for densa, a fatoração QR permutada tem a propriedade adicional de que
as entradas diagonais de R são ordenadas por magnitude decrescente. Em outras
palavras, `abs (diag (R))` será ordenado do maior para o menor.

Se `A` for esparsa, `P` é uma ordenação de redução de preenchimento das colunas
de `A`. Nesse caso, as entradas diagonais de `R` não são ordenadas por
magnitude decrescente.

Por exemplo, dada a matriz `A = [1, 2; 3, 4]`,

> > `[Q, R, P] = qr (A)`

retorna

> > `%Q=[-0.44721,-0.89443;-0.89443,0.44721]%`

> > `%R=[-4.47214,-3.13050;0.00000,0.44721]%`

> > `%P=[0,1;1,0]%`

Se a matriz de entrada `A` for esparsa, a fatoração QR esparsa é calculada
usando `SPQR` ou `CXSPARSE` (por exemplo, se `SPQR` não estiver disponível).
Como a matriz `Q` é, em geral, uma matriz completa, recomenda-se solicitar
apenas um valor de retorno `R`. Nesse caso, o cálculo evita a construção de `Q`
e retorna uma matriz esparsa `R` tal que `R = chol (A' * A)`.

Se `A` for densa, uma matriz adicional `B` for fornecida e dois valores de
retorno forem solicitados, então `qr` retorna `C`, onde `C = Q' * B`. Isso
permite que a aproximação por mínimos quadrados de `A \ B` seja calculada como:

> > `[C, R] = qr (A, B)`

> > `X = R \ C`

Se `A` for uma matriz esparsa `MxN` e uma matriz adicional `B` for fornecida,
um ou dois valores de retorno são possíveis. Se um valor de retorno `X` for
solicitado e `M < N`, então `X` é a solução de norma-2 mínima de `A \ B`. Se
`M >= N`, `X` é a aproximação por mínimos quadrados de `A \ B`. Se forem
solicitados dois valores de retorno, `C` e `R` têm o mesmo significado que no
caso denso (`C` é denso e `R` é esparso). A versão com um único parâmetro de
retorno deve ser preferida, pois utiliza menos memória e lida melhor com
matrizes com posto deficiente.

Se o argumento final for a string `"vector"`, então `P` será um vetor de
permutação (das colunas de `A`) em vez de uma matriz de permutação. Nesse caso,
a relação definidora é:

> > `Q * R = A(:, P)`

O padrão, no entanto, é retornar uma matriz de permutação, e isso pode ser
especificado explicitamente usando um argumento final do tipo `"matrix"`.

Se o argumento final for o escalar 0 ou a string `"econ"`, será retornada uma
fatoração econômica. Se a matriz original `A` tiver tamanho `MxN` e `M > N`, a
fatoração econômica calculará apenas `N` linhas em `R` e `N` colunas em `Q`,
omitindo os zeros em `R`. Se `M <= N`, não há diferença entre as fatorações
econômica e padrão. Ao calcular uma fatoração econômica e `A` for densa, a
saída `P` será sempre um vetor em vez de uma matriz. Se `A` for esparsa, a
saída `P` será uma matriz de permutação esparsa.

Contexto: A fatoração QR tem aplicações na solução de problemas de mínimos
quadrados

> > `min norm (A*x - b)`

para sistemas de equações sobredeterminados (ou seja, `A` é uma matriz alta e
estreita).

A fatoração QR permutada `[Q, R, P] = qr (A)` permite a construção de uma base
ortogonal de `span (A)`.

Veja também: `chol`, `hess`, `lu`, `qz`, `schur`, `svd`, `qrupdate`,
`qrinsert`, `qrdelete`, `qrshift`.

### Referências

- https://www.mathworks.com/help/matlab/ref/qr.html
- https://octave.sourceforge.io/octave/function/qr.html
- https://github.com/gnu-octave/octave/blob/default/liboctave/numeric/qr.h
- https://github.com/gnu-octave/octave/blob/default/libinterp/corefcn/qr.cc
- https://github.com/gnu-octave/octave/blob/default/liboctave/numeric/qrp.h
- https://mathworld.wolfram.com/QRDecomposition.html
- https://rosettacode.org/wiki/QR_decomposition
- https://pt.wikipedia.org/wiki/Decomposi%C3%A7%C3%A3o_QR
