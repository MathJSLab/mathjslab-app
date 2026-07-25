- `B = subsref (A, S)`

Realiza referência com subscritos em `A` de acordo com a estrutura de
subscritos `S`.

A estrutura de subscritos `S` tem os campos `type` e `subs`. O campo `type`
seleciona indexação ordinária com `"()"`, indexação de células com `"{}"` ou
acesso a campos e propriedades com `"."`. O campo `subs` contém `":"`, um array
de células com valores de índice, ou o nome do campo referenciado.

Esta é a forma funcional de expressões como `A(:, 1:2)`, `C{1}` ou `S.field`.

Se `S` é um array de estruturas vazio com os campos `type` e `subs`, retorna
`A`.

Veja também: `subsasgn`, `substruct`.

### Referências

- https://www.mathworks.com/help/matlab/ref/subsref.html
- https://octave.sourceforge.io/octave/function/subsref.html
