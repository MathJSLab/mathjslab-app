- `R = rem (X, Y)`

Retorna o resto da divisão `X / Y`.

O resto é calculado usando a expressão

> > `x - y .* fix (x ./ y)`

Uma mensagem de erro será exibida se as dimensões dos argumentos forem
não-conformes, ou se algum dos argumentos for complexo.

Por convenção,

> > `rem (X, 0) = NaN` se `X` for um número

> > `rem (X, 0) = 0` se `X` for um número inteiro

> > `rem (X, Y)` retorna um valor com o signbit de `X`

Para as convenções opostas, consulte a função `mod`. Em geral, `rem` é melhor
ao calcular o resto após a divisão de dois números _positivos_. Para números
negativos, ou quando os valores são periódico, `mod` é uma escolha melhor.

Veja também: `mod`.

### Referências

- https://www.mathworks.com/help/matlab/ref/rem.html
- https://octave.sourceforge.io/octave/function/rem.html
- https://mathworld.wolfram.com/Remainder.html
- https://pt.wikipedia.org/wiki/Resto_da_divis%C3%A3o_inteira
