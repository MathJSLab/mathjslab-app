- `B = subsasgn (A, S, RHS)`

Realiza una asignación con subíndices sobre `A` de acuerdo con la estructura de
subíndices `S`.

La estructura de subíndices `S` tiene los campos `type` y `subs`. El campo
`type` selecciona indexación ordinaria con `"()"`, indexación de celdas con
`"{}"` o asignación de campos y propiedades con `"."`. El campo `subs` contiene
`":"`, un arreglo de celdas con valores de índice, o el nombre del campo que se
asigna.

Esta es la forma funcional de asignaciones como `A(:, 1:2) = 0`, `C{1} = value`
o `S.field = value`.

Si `S` es un arreglo de estructuras vacío con los campos `type` y `subs`,
devuelve `RHS`.

Véase también: `subsref`, `substruct`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/subsasgn.html
- https://octave.sourceforge.io/octave/function/subsasgn.html
