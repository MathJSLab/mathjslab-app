- `M = mod (X, Y)`

Calcula el módulo de `X` e `Y`.

Conceptualmente, el módulo está definido por

> > `x - y .* floor (x ./ y)`

y está escrito de manera que se devuelva el módulo correcto para tipos enteros.
Esta función maneja correctamente los valores negativos. Es decir,
`mod (-1, 3)` es 2, no -1, como devuelve `rem (-1, 3)`.

Se produce un error si las dimensiones de los argumentos no coinciden o si
alguno de los argumentos es complejo.

Por convención,

> > `mod (X, 0) = X` `mod (X, Y)` devuelve un valor con el bit de signo de `Y`

Para conocer las convenciones opuestas, consulte la función `rem`. En general,
`mod` es una mejor opción que `rem` cuando alguna de las entradas son números
negativos o cuando los valores son periódicos.

Véase también: `rem`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/mod.html
- https://octave.sourceforge.io/octave/function/mod.html
- https://mathworld.wolfram.com/Mod.html
- https://es.wikipedia.org/wiki/Operaci%C3%B3n_m%C3%B3dulo
- https://es.wikipedia.org/wiki/Aritm%C3%A9tica_modular
