- `RESULT = configure(CONFIG)`
- `RESULT = configure(config, value)`
- `RESULT = configure()`

Configura los parámetros internos de **MathJSLab**.

Si se pasa un array de configuración `CONFIG`, debe ser una matriz con dos
columnas donde la primera columna debe contener una string con el nombre del
parámetro de configuración y la segunda columna debe contener el valor a
configurar.

Si se pasan dos parámetros, el primero debe ser una string con el nombre del
parámetro de configuración y el segundo debe ser el valor a configurar.

Si se llama sin parámetros, establece todas las configuraciones en sus valores
predeterminados.

Los parámetros de configuración disponibles son:

| parámetro            | significado                                                                                                                             | tipo                                                                                | valor predeterminado |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :------------------- |
| `'real'`             | El tipo de dato utilizado como número real.                                                                                             | `'decimal'` ou `'number'`                                                           | `'decimal'`          |
| `'precision'`        | El número máximo de dígitos significativos del resultado de una operación.                                                              | entero, `%1%` a `%10^9%` inclusive                                                  | `%336%`              |
| `'precisionCompare'` | El número de dígitos significativos para reducir la precisión antes de las operaciones de comparación y unparse.                        | entero, `%0%` a `%10^9%` inclusive (debe ser menor que el parámetro `'precision'`). | `%7%`                |
| `'rounding'`         | El modo de redondeo predeterminado que se utiliza al redondear el resultado de una operación a dígitos significativos de `'precision'`. | string (ver significado más abajo)                                                  | `'half_down'`        |
| `'toExpPos'`         | El valor del exponente positivo en el cual y por encima del cual unparse devuelve la notación exponencial.                              | entero, `%0%` a `%9^15%` inclusive                                                  | `%20%`               |
| `'toExpNeg'`         | El valor del exponente negativo en el cual y por debajo del cual unparse devuelve la notación exponencial.                              | entero, `%-9^15%` a `%0%` inclusive                                                 | `%-7%`               |
| `'minE'`             | El límite del exponente negativo, es decir, el valor del exponente por debajo del cual se produce el underflow para a cero.             | entero, `%-9^15%` a `%0%` inclusive                                                 | `%-9^15%`            |
| `'maxE'`             | El límite del exponente positivo, es decir, el valor del exponente por encima del cual se produce el overflow para `%Inf%`.             | entero, `%0%` a `%9^15%` inclusive                                                  | `%9^15%`             |
| `'modulo'`           | El modo utilizado al calcular el módulo: a mod n.                                                                                       | string (ver significado más abajo)                                                  | `'down'`             |
| `'crypto'`           | El valor que determina si se utilizará la generación de números pseudoaleatorios criptográficamente seguros.                            | lógico                                                                              | `'false'`            |

Si se cambia el parámetro `'real'`, se debe ejecutar posteriormente el comando
`clear`.

#### opciones de `rounding`

| valor          | significado                                                                       |
| :------------- | :-------------------------------------------------------------------------------- |
| `'up'`         | Redondea desde `%0%`.                                                             |
| `'down'`       | Redondea hacia `%0%`.                                                             |
| `'ceil'`       | Redondea hacia `%Inf%`.                                                           |
| `'floor'`      | Redondea hacia `%-Inf%`.                                                          |
| `'half_up'`    | Redondea al vecino más cercano. Si es equidistante, redondee desde `%0%`.         |
| `'half_down'`  | Redondea al vecino más cercano. Si es equidistante, redondee hacia `%0%`.         |
| `'half_even'`  | Redondea al vecino más cercano. Si es equidistante, redondee hacia el vecino par. |
| `'half_ceil'`  | Redondea al vecino más cercano. Si es equidistante, redondee hacia `%Inf%`.       |
| `'half_floor'` | Redondea al vecino más cercano. Si es equidistante, redondee hacia `%-Inf%`.      |

#### opciones de `modulo`

| valor         | significado                                                                                                                                       |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `'up'`        | El resto es positivo si el dividendo es negativo, en caso contrario es negativo.                                                                  |
| `'down'`      | El resto tiene el mismo signo que el dividendo. Utiliza división truncada y coincide con el comportamiento del operador % restante de JavaScript. |
| `'floor'`     | El resto tiene el mismo signo que el divisor (corresponde al operador % de Python).                                                               |
| `'half_even'` | La función restante de _IEEE 754_.                                                                                                                |
| `'euclid'`    | El resto siempre es positivo. División euclidiana: `q = sign(x) * floor(a / abs(x))`.                                                             |

Véase tambiém: `getconfig`, `clear`.
