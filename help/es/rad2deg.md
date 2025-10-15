- `DEG = rad2deg (RAD)`

Convierte radianes a grados.

La entrada `RAD` debe ser escalar o matricial. `RAD` puede ser complejo, en
cuyo caso los componentes real e imaginario se convertirán por separado.

La salida `DEG` tiene las mismas dimensiones que `RAD` con radianes convertidos
a grados usando la constante de conversión `180/pi`.

Ejemplo:

> > `rad2deg ([0, pi/2, pi, 3/2*pi, 2*pi])`

> > %%[0, 90, 180, 270, 360]%%

Véase también: `deg2rad`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/rad2deg.html
- https://octave.sourceforge.io/octave/function/rad2deg.html
- https://es.wikipedia.org/wiki/%C3%81ngulo
- https://es.wikipedia.org/wiki/Grado_sexagesimal
- https://es.wikipedia.org/wiki/Radi%C3%A1n
