- `RESULT = configure(CONFIG)`
- `RESULT = configure(config, value)`
- `RESULT = configure()`

Configure internal parameters of **MathJSLab**.

If a configuration array `CONFIG` is passed, it must be an array with two
columns where the first column must contain a string with the name of the
configuration parameter and the second column must contain the value to set.

If two parameters are passed, the first must be a string with the name of the
configuration parameter and the second must be the value to configure.

If called with no parameters set all configurations to its default values.

The available configuration parameters are:

| parameter            | meaning                                                                                                    | type                                                                              | default value |
| :------------------- | :--------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- | :------------ |
| `'real'`             | O tipo de dado usado como número real.                                                                     | `'decimal'` or `'number'`                                                         | `'decimal'`   |
| `'precision'`        | The maximum number of significant digits of the result of an operation.                                    | integer, %%1%% to %%10^9%% inclusive                                              | %%336%%       |
| `'precisionCompare'` | The number of significant digits to reduce precision before compare operations and unparse.                | integer, %%0%% to %%10^9%% inclusive (must be less than `'precision'` parameter). | %%7%%         |
| `'rounding'`         | The default rounding mode used when rounding the result of an operation to `precision` significant digits. | string (see the meaning below)                                                    | `'half_down'` |
| `'toExpPos'`         | The positive exponent value at and above which unparse returns exponential notation.                       | integer, %%0%% to %%9^15%% inclusive                                              | %%20%%        |
| `'toExpNeg'`         | The negative exponent value at and below which unparse returns exponential notation.                       | integer, %%-9^15%% to %%0%% inclusive                                             | %%-7%%        |
| `'minE'`             | The negative exponent limit, i.e. the exponent value below which underflow to zero occurs.                 | integer, %%-9^15%% to %%0%% inclusive                                             | %%-9^15%%     |
| `'maxE'`             | The positive exponent limit, i.e. the exponent value above which overflow to %%Inf%% occurs.               | integer, %%0%% to %%9^15%% inclusive                                              | %%9^15%%      |
| `'modulo'`           | The modulo mode used when calculating the modulus: a mod n.                                                | string (see the meaning below)                                                    | `'down'`      |
| `'crypto'`           | The value that determines whether cryptographically-secure pseudo-random number generation is used.        | logical                                                                           | `'false'`     |

If the `'real'` parameter is changed, the `clear` command must be executed
afterwards.

#### `rounding` options

| value          | meaning                                                                          |
| :------------- | :------------------------------------------------------------------------------- |
| `'up'`         | Rounds away from %%0%%.                                                          |
| `'down'`       | Rounds towards %%0%%.                                                            |
| `'ceil'`       | Rounds towards %%Inf%%.                                                          |
| `'floor'`      | Rounds towards %%-Inf%%.                                                         |
| `'half_up'`    | Rounds towards nearest neighbour. If equidistant, rounds away from %%0%%.        |
| `'half_down'`  | Rounds towards nearest neighbour. If equidistant, rounds towards %%0%%.          |
| `'half_even'`  | Rounds towards nearest neighbour. If equidistant, rounds towards even neighbour. |
| `'half_ceil'`  | Rounds towards nearest neighbour. If equidistant, rounds towards %%Inf%%.        |
| `'half_floor'` | Rounds towards nearest neighbour. If equidistant, rounds towards %%-Inf%%.       |

#### `modulo` options

| value         | meaning                                                                                                                                        |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `'up'`        | The remainder is positive if the dividend is negative, else is negative.                                                                       |
| `'down'`      | The remainder has the same sign as the dividend. This uses truncating division and matches the behaviour of JavaScript's remainder operator %. |
| `'floor'`     | The remainder has the same sign as the divisor (matches Python's % operator).                                                                  |
| `'half_even'` | The _IEEE 754_ remainder function.                                                                                                             |
| `'euclid'`    | The remainder is always positive. Euclidian division: `q = sign(x) * floor(a / abs(x))`.                                                       |

See also: `getconfig`, `clear`.
