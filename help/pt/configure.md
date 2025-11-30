- `RESULT = configure(CONFIG)`
- `RESULT = configure(config, value)`
- `RESULT = configure()`

Configura parâmetros internos do engine **MathJSLab**.

Se um array de configuração `CONFIG` for passado, ele deve ser um array com
duas colunas onde a primeira coluna deve conter uma string com o nome do
parâmetro de configuração e a segunda coluna deve conter o valor a ser
configurado.

Se forem passados dois parâmetros, o primeiro deverá ser uma string com o nome
do parâmetro de configuração e o segundo deve ser o valor a ser configurado.

Se chamado sem parâmetros, define todas as configurações com seus valores
padrão.

Os parâmetros de configuração disponíveis são:

| parâmetro            | significado                                                                                                                | tipo                                                                                | valor padrão  |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :------------ |
| `'blockThreshold'`   | Tamanho máximo das matrizes para operar a multiplicação (`mtimes`) usando o algoritmo simples.                             | inteiro, `%10^2%` a `...`                                                           | `%10^5%`      |
| `'blockSize'`        | Tamanho do bloco para operar a multiplicação (`mtimes`) usando o algoritmo em bloco.                                       | inteiro, `%8%` a `%512%`                                                            | `%64%`        |
| `'wasteLU'`          | Valor residual máximo, abaixo do qual o valor é considerado zero na decomposição LU.                                       | decimal, `%10^(-30)%` a `%1%`                                                       | `%10^(-15)%`  |
| `'real'`             | O tipo de dado usado como número real.                                                                                     | `'decimal'` ou `'number'`                                                           | `'decimal'`   |
| `'precision'`        | O número máximo de dígitos significativos do resultado de uma operação.                                                    | inteiro, `%1%` a `%10^9%` inclusive                                                 | `%336%`       |
| `'precisionCompare'` | O número de dígitos significativos para reduzir a precisão antes das operações de comparação e unparse.                    | inteiro, `%0%` a `%10^9%` inclusive (deve ser menor que o parâmetro `'precision'`). | `%7%`         |
| `'rounding'`         | O modo de arredondamento padrão usado ao arredondar o resultado de uma operação para `'precision'` dígitos significativos. | string (veja o significado abaixo)                                                  | `'half_down'` |
| `'toExpPos'`         | O valor do expoente positivo no qual e acima do qual unparse retorna a notação exponencial.                                | inteiro, `%0%` a `%9^15%` inclusive                                                 | `%20%`        |
| `'toExpNeg'`         | O valor do expoente negativo no qual e abaixo do qual unparse retorna a notação exponencial.                               | inteiro, `%-9^15%` a `%0%` inclusive                                                | `%-7%`        |
| `'minE'`             | O limite do expoente negativo, ou seja, o valor do expoente abaixo do qual ocorre o underflow para zero.                   | inteiro, `%-9^15%` a `%0%` inclusive                                                | `%-9^15%`     |
| `'maxE'`             | O limite do expoente positivo, ou seja, o valor do expoente acima do qual ocorre o overflow para `%Inf%`.                  | inteiro, `%0%` a `%9^15%` inclusive                                                 | `%9^15%`      |
| `'modulo'`           | O modo usado ao calcular o módulo: a mod n.                                                                                | string (veja o significado abaixo)                                                  | `'down'`      |
| `'crypto'`           | O valor que determina se a geração de números pseudoaleatórios criptograficamente seguros será usada.                      | lógico                                                                              | `'false'`     |

Caso o parâmetro `'real'` seja alterado deve-se executar o comando `clear` em
seguida.

#### opções de `rounding`

| valor          | significado                                                                                  |
| :------------- | :------------------------------------------------------------------------------------------- |
| `'up'`         | Arredonda afastando de `%0%`.                                                                |
| `'down'`       | Arredonda em direção a `%0%`.                                                                |
| `'ceil'`       | Arredonda em direção a `%Inf%`.                                                              |
| `'floor'`      | Arredonda em direção a `%-Inf%`.                                                             |
| `'half_up'`    | Arredonda ao vizinho mais próximo. Se for equidistante, arredonda afastando de `%0%`.        |
| `'half_down'`  | Arredonda ao vizinho mais próximo. Se for equidistante, arredonda em direção a `%0%`.        |
| `'half_even'`  | Arredonda ao vizinho mais próximo. Se for equidistante, arredonda em direção ao vizinho par. |
| `'half_ceil'`  | Arredonda ao vizinho mais próximo. Se for equidistante, arredonda em direção a `%Inf%`.      |
| `'half_floor'` | Arredonda ao vizinho mais próximo. Se for equidistante, arredonda em direção a `%-Inf%`.     |

#### opções de `modulo`

| valor         | significado                                                                                                                       |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `'up'`        | O resto é positivo se o dividendo for negativo, caso contrário é negativo.                                                        |
| `'down'`      | O restante tem o mesmo sinal do dividendo. Usa divisão truncada e corresponde ao comportamento do operador resto % do JavaScript. |
| `'floor'`     | O resto tem o mesmo sinal do divisor (corresponde ao operador % do Python).                                                       |
| `'half_even'` | A função resto do _IEEE 754_.                                                                                                     |
| `'euclid'`    | O resto é sempre positivo. Divisão euclidiana: `q = sign(x) * floor(a / abs(x))`.                                                 |

Veja também: `getconfig`, `clear`.
