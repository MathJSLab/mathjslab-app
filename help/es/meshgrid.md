- `[XX, YY] = meshgrid (X, Y)`
- `[XX, YY, ZZ] = meshgrid (X, Y, Z)`
- `[XX, YY] = meshgrid (X)`
- `[XX, YY, ZZ] = meshgrid (X)`

Dados los vectores de coordenadas `X` e `Y`, devuelve las matrices `XX` y `YY`
correspondientes a una cuadrícula 2-D completa.

Las filas de `XX` son copias de `X` y las columnas de `YY` son copias de `Y`.
Si se omite `Y`, se considerará igual a `X`.

Si se proporciona la entrada opcional `Z` o se solicita `ZZ`, entonces la
salida será una cuadrícula tridimensional completa. Si se omite `Z` y se
solicita `ZZ`, se asumirá que es lo mismo que `Y`.

`meshgrid` se usa con mayor frecuencia para generar datos de entrada para una
función 2D o 3D que se trazará. El siguiente ejemplo crea un gráfico de
superficie de la función "sombrero".

> > `f = @(x,y) sin (sqrt (x.^2 + y.^2)) ./ sqrt (x.^2 + y.^2);`

> > `range = linspace (-8, 8, 41);`

> > `[X, Y] = meshgrid (range, range);`

> > `Z = f (X, Y);`

> > `surf (X, Y, Z);`

Nota de programación: `meshgrid` está restringido a la generación de
cuadrículas 2-D o 3-D. La función `ndgrid` generará 1-D por medio de N-D
cuadrículas. Sin embargo, las funciones no son completamente equivalentes. Si
`X` es un vector de longitud `M` e `Y` es un vector de longitud `N`, entonces
`meshgrid` produce una cuadrícula de salida que es NxM. `ndgrid` producirá una
salida que es MxN (transpuesta) a la misma entrada. Algunas funciones
principales esperan entrada `meshgrid` y otras esperan entrada `ndgrid`.
Consulte la documentación de la función en cuestión para determinar el formato
de entrada apropiado.

Véase también: `ndgrid`, `mesh`, `contour`, `surf`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/meshgrid.html
- https://octave.sourceforge.io/octave/function/meshgrid.html
