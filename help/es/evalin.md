- `evalin (CONTEXT, TRY)`
- `evalin (CONTEXT, TRY, CATCH)`

Evalúa la cadena `TRY` en otro contexto de espacio de trabajo.

El argumento `CONTEXT` normalmente es `"caller"` o `"base"`. Si se proporciona
`CATCH` y la evaluación de `TRY` falla, evalúa `CATCH`.

Véase también: `eval`, `assignin`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/evalin.html
- https://octave.sourceforge.io/octave/function/evalin.html
