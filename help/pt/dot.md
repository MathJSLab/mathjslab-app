- `Z = ponto(X, Y)`
- `Z = ponto(X, Y, DIM)`

Calcula o produto escalar de dois vetores.

Se `X` e `Y` forem matrizes, calcule os produtos escalares ao longo da primeira
dimensão não singular (diferente de 1).

Se o argumento opcional `DIM` for fornecido, calcule os produtos escalares ao
longo desta dimensão.

Nota de Implementação: Isso é equivalente a `sum(conj(X) .* Y, DIM)`, mas evita
a formação de uma matriz temporária e é mais rápido. Quando `X` e `Y` são
vetores coluna, o resultado é equivalente a `X' * Y`. Embora `dot` seja
definido para matrizes de inteiros, a saída pode diferir do resultado esperado
devido ao intervalo limitado de objetos inteiros.

Veja também: `cross`, `divergence`, `tensorprod`.

### References

- https://www.mathworks.com/help/matlab/ref/dot.html
- https://octave.sourceforge.io/octave/function/dot.html
