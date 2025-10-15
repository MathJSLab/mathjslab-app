- `F = factorial (N)`

Retorna o fatorial de `N` onde `N` é um número inteiro real não negativo.

Se `N` for um escalar, isso é equivalente a `prod (1:N)`. Para argumentos vetor
ou matriz, retorna o fatorial de cada elemento no array.

Para argumentos não inteiros, consulte a função fatorial generalizada `gamma`.
Observe que a função fatorial cresce muito rapidamente e o estouro ocorrerá se
`N > 171`. Para tais casos, considere `gammaln`.

Veja também: `prod`, `gamma`, `gammainc`, `gammaln`.

### Referências

- https://www.mathworks.com/help/matlab/ref/factorial.html
- https://octave.sourceforge.io/octave/function/factorial.html
- https://mathworld.wolfram.com/Factorial.html
- https://pt.wikipedia.org/wiki/Fatorial
