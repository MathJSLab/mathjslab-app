- `S = struct ()`
- `S = struct (FIELD1, VALUE1, FIELD2, VALUE2, ...)`
- `S = struct (OBJ)`

Crea una estructura escalar o de matriz e inicializa sus valores.

Las variables `FIELD1`, `FIELD2`, ... son cadenas que especifican los nombres
de los campos y las variables `VALUE1`, `VALUE2`, ... pueden ser de cualquier
tipo.

Si los valores son matrices de celdas, crea una matriz de estructura y
inicializa sus valores. Las dimensiones de cada matriz de valores de celda.
debe coincidir con. Las celdas singulares y los valores que no son celdas se
repiten en un que llenen toda la matriz. Si las celdas están vacías, cree una
matriz de estructura vacía con los nombres de campo especificados.

Si el argumento es un objeto, devuelve la estructura subyacente.

Tenga en cuenta que la sintaxis está optimizada para _arrays_ de estructuras.
Considerar los siguientes ejemplos:

> > `struct ("foo", 1)`

> > `struct {`

> > `    foo:  1`

> > `}`

> > `struct ("foo", {})`

> > %%[]%%

> > `struct ("foo", { {} })`

> > `struct {`

> > `   foo:`%%{}%%

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

El primer caso es una estructura escalar común: un campo, un valor. El segundo
produce una matriz de estructura vacía con un campo y ningún valor, ya que se
pasa una matriz de celdas vacía como valor de la matriz de estructura. Cuando
el valor es una matriz de celdas que contienen una sola entrada, esto se
convierte en una estructura escalar con esta única entrada como el valor de la
campo. Esta única entrada es una matriz vacía de celdas.

Finalmente, si el valor es una matriz de celdas no escalares, entonces
'estructura' produce un _array_ de estructuras.

Véase también: `cell2struct`, `fieldnames`, `getfield`, `setfield`, `rmfield`,
`isfield`, `orderfields`, `isstruct`, `structfun`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/struct.html
- https://octave.sourceforge.io/octave/function/struct.html
