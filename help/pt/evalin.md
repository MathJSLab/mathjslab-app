- `evalin (CONTEXT, TRY)`
- `evalin (CONTEXT, TRY, CATCH)`

Avalia a string `TRY` em outro contexto de área de trabalho.

O argumento `CONTEXT` normalmente é `"caller"` ou `"base"`. Se `CATCH` for
fornecido e a avaliação de `TRY` falhar, avalia `CATCH`.

Veja também: `eval`, `assignin`.

### Referências

- https://www.mathworks.com/help/matlab/ref/evalin.html
- https://octave.sourceforge.io/octave/function/evalin.html
