- `C = char (X)`
- `C = char (X, ...)`
- `C = char (S1, S2, ...)`
- `C = char (CELL_ARRAY)`

Crea un arreglo de caracteres a partir de arreglos numéricos, arreglos de
caracteres, cadenas o arreglos de celdas.

Los argumentos se concatenan verticalmente. Las filas se rellenan con espacios
en blanco según sea necesario para que todas tengan la misma longitud.

Para entrada numérica, cada elemento se convierte al código de carácter
correspondiente. Los valores fuera del rango de códigos de caracteres admitido
no son válidos.

Para arreglos de celdas, cada elemento se convierte por separado y se concatena
en el arreglo de caracteres resultante.

Véase también: `string`, `cellstr`, `ischar`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/char.html
- https://octave.sourceforge.io/octave/function/char.html
