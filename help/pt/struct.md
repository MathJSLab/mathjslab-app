- `S = struct ()`
- `S = struct (FIELD1, VALUE1, FIELD2, VALUE2, ...)`
- `S = struct (OBJ)`

Cria uma estrutura escalar ou array e inicializa seus valores.

As variáveis `FIELD1`, `FIELD2`, ... são strings especificando os nomes dos
campos e as variáveis `VALUE1`, `VALUE2`, ... podem ser de qualquer tipo.

Se os valores forem matrizes celulares, cria uma matriz de estrutura e
inicializa seus valores. As dimensões de cada matriz celular de valores deve
combinar. Células singulares e valores não celulares são repetidos de modo que
eles preencham todo o array. Se as células estiverem vazias, cria uma matriz de
estrutura vazia com os nomes dos campos especificados.

Se o argumento for um objeto, retorna a estrutura subjacente.

Observe que a sintaxe é otimizada para _arrays_ de estruturas. Considerar os
seguintes exemplos:

> > `struct ("foo", 1)`

> > `struct {`

> > `    foo:  1`

> > `}`

> > `struct ("foo", {})`

> > `%[]%`

> > `struct ("foo", { {} })`

> > `struct {`

> > `   foo:``%{}%`

> > `}`

> > `struct ("foo", {1, 2, 3})`

> > `[`

> > `    struct {`

> > `        foo: 1`

> > `    },`

> > `    struct {`

> > `        foo: 2`

> > `    },`

> > `    struct {`

> > `        foo: 3`

> > `    },`

> > `]`

O primeiro caso é uma estrutura escalar comum – um campo, um valor. O segundo
produz um array de estruturas vazio com um campo e nenhum valor, pois esta
sendo passado um array de células vazio como valor do array de estruturas.
Quando o valor é uma matriz de células contendo uma única entrada, isso se
torna uma estrutura escalar com essa única entrada como o valor do campo. Essa
única entrada é uma matriz de células vazia.

Finalmente, se o valor for uma matriz de células não escalares, então 'struct'
produz um _array_ de estruturas.

Veja também: `cell2struct`, `fieldnames`, `getfield`, `setfield`, `rmfield`,
`isfield`, `orderfields`, `isstruct`, `structfun`.

### Referências

- https://www.mathworks.com/help/matlab/ref/struct.html
- https://octave.sourceforge.io/octave/function/struct.html
