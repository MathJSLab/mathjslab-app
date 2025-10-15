- `plot3 (X, Y, Z)`
- `plot3 (X, Y, Z, PROP, VALUE, ...)`
- `plot3 (X, Y, Z, FMT)`
- `plot3 (X, CPLX)`
- `plot3 (CPLX)`
- `plot3 (HAX, ...)`
- `H = plot3 (...)`

Produce gráficos 3D.

Son posibles muchas combinaciones diferentes de argumentos. A la forma más
sencilla es

> > `plot3 (X,Y,Z)`

en el que los argumentos se consideran los vértices de los puntos a trazarse en
tres dimensiones. Si todos los argumentos son vectores de misma longitud,
entonces se dibuja una única línea continua. Me caigo Los argumentos son
matrices, por lo que cada columna se trata como una línea separada. No se hace
ningún intento de transponer los argumentos a hacer coincidir el número de
líneas.

Si sólo se dan dos argumentos, como por ejemplo

> > `plot3 (X, CPLX)`

las partes real e imaginaria del segundo argumento se utilizan como Coordenadas
`Y` y `Z`, respectivamente.

Si sólo se da un argumento, como por ejemplo

> > `plot3 (CPLX)`

las partes real e imaginaria del argumento se utilizan como los valores de `Y`
y `Z`, y se trazan contra su índice.

Los argumentos también se pueden dar en grupos de tres, como por ejemplo

> > `plot3 (X1, Y1, Z1, X2, Y2, Z2, ...)`

donde cada conjunto de tres argumentos se trata como una línea separada o
conjunto de líneas en tres dimensiones.

Para trazar varios grupos de uno o dos argumentos, separe cada grupo con una
cadena de formato vacía, como

> > `plot3 (X1, C1, "", C2, "", ...)`

Se pueden especificar múltiples pares propiedad-valor, lo que afectará los
objetos de línea dibujados por `plot3`. Si se da el argumento `FMT` formateará
los objetos de línea de la misma manera que `plot`. A La lista completa de
propiedades está documentada en Propiedades de fila.

Si el primer argumento `HAX` es un identificador de eje, entonces trace esto
ejes, en lugar de los ejes actuales devueltos por `gca`.

El valor de retorno opcional `H` es un identificador del gráfico creado.

Ejemplo:

> > `z = [0:0.05:5];`

> > `plot3 (cos (2*pi*z), sin (2*pi*z), z, ";helix;");`

> > `plot3 (z, exp (2i*pi*z), ";complex sinusoid;");`

Véase también: `ezplot3`, `plot`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/plot3.html
- https://octave.sourceforge.io/octave/function/plot3.html
