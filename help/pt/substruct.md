- `S = substruct (TYPE, SUBS, ...)`

Cria uma estrutura de subscritos para usar com `subsref` ou `subsasgn`.

`TYPE` especifica o tipo de operação de indexação. Os valores válidos são
`"()"`, `"{}"` e `"."`. `SUBS` contém os subscritos associados, normalmente
como um array de células para indexação de arrays ou células, ou como nome de
campo para acesso a campos de estruturas e propriedades de objetos.

Por exemplo, `substruct ("()", {3, ":"})` cria uma estrutura de subscritos que
seleciona a terceira linha e todas as colunas quando passada para `subsref`.

Veja também: `subsref`, `subsasgn`.

### Referências

- https://www.mathworks.com/help/matlab/ref/substruct.html
- https://octave.sourceforge.io/octave/function/substruct.html
