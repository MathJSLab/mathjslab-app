- `S = substruct (TYPE, SUBS, ...)`

Crea una estructura de subíndices para usar con `subsref` o `subsasgn`.

`TYPE` especifica el tipo de operación de indexación. Los valores válidos son
`"()"`, `"{}"` y `"."`. `SUBS` contiene los subíndices asociados, normalmente
como un arreglo de celdas para indexación de arreglos o celdas, o como un
nombre de campo para acceder a campos de estructuras y propiedades de objetos.

Por ejemplo, `substruct ("()", {3, ":"})` crea una estructura de subíndices que
selecciona la tercera fila y todas las columnas cuando se pasa a `subsref`.

Véase también: `subsref`, `subsasgn`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/substruct.html
- https://octave.sourceforge.io/octave/function/substruct.html
