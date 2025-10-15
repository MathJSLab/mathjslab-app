- `R = randi (IMAX)`
- `R = randi (IMAX, N)`
- `R = randi (IMAX, M, N, ...)`
- `R = randi ([IMIN IMAX], ...)`

Devuelve números enteros aleatorios en el rango `1:IMAX`.

Los argumentos adicionales determinan las dimensiones de la matriz de retorno.
Cuando no se especifica ningún argumento, se devuelve un único número entero
aleatorio. Si se especifica un argumento `N`, se devuelve una matriz cuadrada
(N x N). Dos o más argumentos devolverán una matriz multidimensional (M x N
x...).

Opcionalmente, el rango de números enteros se puede describir mediante una
matriz con un límite superior e inferior, en cuyo caso los números enteros
devueltos estarán en el rango [IMIN, IMAX].

El siguiente ejemplo devuelve 150 números enteros en el rango de 1 a 10.

> > `ri = randi (10, 150, 1)`

Véase también: `rand`, `randn`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/randi.html
- https://octave.sourceforge.io/octave/function/randi.html
