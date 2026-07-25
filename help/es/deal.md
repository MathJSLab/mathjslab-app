- `[R1, R2, ..., RN] = deal (A)`
- `[R1, R2, ..., RN] = deal (A1, A2, ..., AN)`

Copia valores de entrada en variables de salida.

Con una sola entrada, `deal` copia ese valor en todas las salidas. Con varias
entradas, cada entrada se copia en la salida correspondiente.

`deal` suele ser útil al asignar valores desde listas separadas por comas,
incluidas listas producidas por arreglos de celdas o arreglos de estructuras.

Véase también: `cell2struct`, `struct2cell`, `repmat`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/deal.html
- https://octave.sourceforge.io/octave/function/deal.html
