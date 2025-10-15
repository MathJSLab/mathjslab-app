- `Y = logspace (A, B)`
- `Y = logspace (A, B, N)`
- `Y = logspace (A, pi)`
- `Y = logspace (A, pi, N)`

Retorna um vetor linha com `N` elementos logaritmicamente espaçados de %%10^A%%
a %%10^B%%.

Se o número de elementos `N` não for especificado, o padrão será 50.

Se `B` for igual a %%pi%%, os pontos estarão entre %%10^A%% e %%pi%%, _não_
%%10^A%% e %%10^pi%%, que é útil no processamento de sinais digitais.

Notas de programação: Para compatibilidade com MATLAB&reg;/Octave, retorna o
lado direito do intervalo (%%10^B%%) quando um único valor (%%N = 1%%) é
requerido. Se `N` não for um número inteiro, então `floor (N)` será usado para
arredondar o número de elementos. Se `N` for zero ou negativo, então uma matriz
1x0 vazia é retornada.

Veja também: `linspace`.

### Referências

- https://www.mathworks.com/help/matlab/ref/logspace.html
- https://octave.sourceforge.io/octave/function/logspace.html
