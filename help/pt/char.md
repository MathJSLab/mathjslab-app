- `C = char (X)`
- `C = char (X, ...)`
- `C = char (S1, S2, ...)`
- `C = char (CELL_ARRAY)`

Cria um array de caracteres a partir de arrays numéricos, arrays de caracteres,
strings ou arrays de células.

Os argumentos são concatenados verticalmente. As linhas são preenchidas com
espaços em branco conforme necessário para que todas tenham o mesmo
comprimento.

Para entrada numérica, cada elemento é convertido para o código de caractere
correspondente. Valores fora do intervalo de códigos de caracteres suportado
não são válidos.

Para arrays de células, cada elemento é convertido separadamente e concatenado
no array de caracteres resultante.

Veja também: `string`, `cellstr`, `ischar`.

### Referências

- https://www.mathworks.com/help/matlab/ref/char.html
- https://octave.sourceforge.io/octave/function/char.html
