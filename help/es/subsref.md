- `B = subsref (A, S)`

Realiza una referencia con subíndices sobre `A` de acuerdo con la estructura de
subíndices `S`.

La estructura de subíndices `S` tiene los campos `type` y `subs`. El campo
`type` selecciona indexación ordinaria con `"()"`, indexación de celdas con
`"{}"` o acceso a campos y propiedades con `"."`. El campo `subs` contiene
`":"`, un arreglo de celdas con valores de índice, o el nombre del campo
referenciado.

Esta es la forma funcional de expresiones como `A(:, 1:2)`, `C{1}` o `S.field`.

Si `S` es un arreglo de estructuras vacío con los campos `type` y `subs`,
devuelve `A`.

Véase también: `subsasgn`, `substruct`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/subsref.html
- https://octave.sourceforge.io/octave/function/subsref.html
