- `RAD = deg2rad (DEG)`

Convierte grados a radianes.

La entrada `DEG` debe ser escalar o matricial. `DEG` puede ser complejo, en
cuyo caso los componentes real e imaginario se convertirán por separado.

La salida `RAD` tiene las mismas dimensiones que `DEG` con grados convertido a
radianes usando la constante de conversión %%pi/180%%.

Ejemplo:

`deg2rad ([0, 90, 180, 270, 360])`

%%deg2rad ([0, 90, 180, 270, 360]) = [0, 1.570796326794896619,
3.141592653589793238, 4.712388980384689857, 6.283185307179586476]%%

Véase también: `rad2deg`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/deg2rad.html
- https://octave.sourceforge.io/octave/function/deg2rad.html
- https://es.wikipedia.org/wiki/%C3%81ngulo
- https://es.wikipedia.org/wiki/Grado_sexagesimal
- https://es.wikipedia.org/wiki/Radi%C3%A1n
