- `Y = linspace (START, END)`
- `Y = linspace (START, END, N)`

Retorna um vetor linha com `N` elementos espaçados linearmente entre `START` e
`END`.

Se o número de elementos `N` for maior que um, então os pontos finais `START` e
`END` estão sempre incluídos no intervalo. Se `START` for maior que `END`, os
elementos são armazenados em ordem decrescente. Se o número de pontos `N` não é
especificado, um valor de 100 é usado.

A função `linspace` retorna um vetor linha quando `START` e `END` são
escalares. Se uma ou ambas as entradas forem vetores, então `linspace` os
transforma em vetores de coluna e retorna uma matriz onde cada linha é uma
sequência independente entre `START(ROW_N),END(ROW_N)`.

Notas de programação: Para compatibilidade com MATLAB&reg;/Octave, retorna o
segundo argumento (`END`) quando um único valor (%%N = 1%%) é solicitado. Se
`N` for um número não inteiro, então `floor (N)` é usado para arredondar o
número de elementos. Se `N` for zero ou negativo, então uma matriz 1x0 vazia é
retornada.

Veja também: `colon`, `logspace`.

### Referências

- https://www.mathworks.com/help/matlab/ref/linspace.html
- https://octave.sourceforge.io/octave/function/linspace.html
