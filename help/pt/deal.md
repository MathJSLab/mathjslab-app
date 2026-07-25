- `[R1, R2, ..., RN] = deal (A)`
- `[R1, R2, ..., RN] = deal (A1, A2, ..., AN)`

Copia valores de entrada para variáveis de saída.

Com uma única entrada, `deal` copia esse valor para todas as saídas. Com várias
entradas, cada entrada é copiada para a saída correspondente.

`deal` costuma ser útil ao atribuir valores de listas separadas por vírgulas,
incluindo listas produzidas por arrays de células ou arrays de estruturas.

Veja também: `cell2struct`, `struct2cell`, `repmat`.

### Referências

- https://www.mathworks.com/help/matlab/ref/deal.html
- https://octave.sourceforge.io/octave/function/deal.html
