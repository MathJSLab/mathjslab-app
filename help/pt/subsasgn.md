- `B = subsasgn (A, S, RHS)`

Realiza atribuição com subscritos em `A` de acordo com a estrutura de
subscritos `S`.

A estrutura de subscritos `S` tem os campos `type` e `subs`. O campo `type`
seleciona indexação ordinária com `"()"`, indexação de células com `"{}"` ou
atribuição de campos e propriedades com `"."`. O campo `subs` contém `":"`, um
array de células com valores de índice, ou o nome do campo atribuído.

Esta é a forma funcional de atribuições como `A(:, 1:2) = 0`, `C{1} = value` ou
`S.field = value`.

Se `S` é um array de estruturas vazio com os campos `type` e `subs`, retorna
`RHS`.

Veja também: `subsref`, `substruct`.

### Referências

- https://www.mathworks.com/help/matlab/ref/subsasgn.html
- https://octave.sourceforge.io/octave/function/subsasgn.html
