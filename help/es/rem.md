- `R = rem (X, Y)`

Devuelve el resto de la división `X/Y`.

El resto se calcula mediante la expresión

> > `x - y .* fix (x ./ y)`

Se mostrará un mensaje de error si las dimensiones del argumento son no
conformes, o si alguno de los argumentos es complejo.

Por convención,

> > `rem (X, 0) = NaN` si `X` es un numero

> > `rem (X, 0) = 0` si `X` es un numero entero

> > `rem (X, Y)` devuelve un valor con el bit de signo de `X`

Para conocer las convenciones opuestas, consulte la función `mod`. En general,
`rem` es mejor para calcular el resto después de dividir dos números
_positivos_. Para números negativos o cuando los valores son periódicos, `mod`
es una mejor opción.

Véase también: `mod`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/rem.html
- https://octave.sourceforge.io/octave/function/rem.html
- https://mathworld.wolfram.com/Remainder.html
- https://es.wikipedia.org/wiki/Resto
