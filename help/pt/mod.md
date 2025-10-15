- `M = mod (X, Y)`

Calcula o módulo de `X` e `Y`.

Conceitualmente o módulo é definido por

> > `x - y .* floor (x ./ y)`

e é escrito de forma que o módulo correto seja retornado para tipos inteiros.
Esta função trata valores negativos corretamente. Ou seja, `mod (-1, 3)` é 2,
não -1, como `rem (-1, 3)` retorna.

Ocorre um erro se as dimensões dos argumentos não concordarem, ou se algum dos
argumentos for complexo.

Por convenção,

> > `mod (X, 0) = X` `mod (X, Y)` retorna um valor com o signbit de `Y`

Para as convenções opostas, consulte a função `rem`. Em geral, `mod` é uma
escolha melhor do que `rem` quando qualquer uma das entradas são números
negativos ou quando os valores são periódicos.

Veja também: `rem`.

### Referências

- https://www.mathworks.com/help/matlab/ref/mod.html
- https://octave.sourceforge.io/octave/function/mod.html
- https://mathworld.wolfram.com/Mod.html
- https://pt.wikipedia.org/wiki/Opera%C3%A7%C3%A3o_m%C3%B3dulo
- https://pt.wikipedia.org/wiki/Aritm%C3%A9tica_modular
