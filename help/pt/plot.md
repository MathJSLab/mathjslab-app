- `plot (Y)`
- `plot (X, Y)`
- `plot (X, Y, FMT)`
- `plot (..., PROPERTY, VALUE, ...)`
- `plot (X1, Y1, ..., XN, YN)`
- `plot (HAX, ...)`
- `H = plot (...)`

Produz gráficos 2-D.

Muitas combinações diferentes de argumentos são possíveis. A forma mais simples
é

> > `plot (Y)`

onde o argumento é considerado o conjunto de coordenadas `Y` e as coordenadas
`X` são consideradas como o intervalo `1:numel (Y)`.

Se mais de um argumento for fornecido, eles serão interpretados como

> > `plot (Y, PROPERTY, VALUE, ...)`

ou

> > `plot (X, Y, PROPERTY, VALUE, ...)`

ou

> > `plot (X, Y, FMT, ...)`

e assim por diante. Qualquer número de conjuntos de argumentos pode aparecer.
Os valore `X` e `Y` são interpretados da seguinte forma:

- Se um único argumento de dados for fornecido, ele será considerado o conjunto
  de coordenadas `Y` e as coordenadas `X` são consideradas como índices dos
  elementos, começando com 1.

- Se `X` e `Y` forem escalares, um único ponto será plotado.

- `squeeze()` é aplicado a argumentos com mais de duas dimensões, mas não mais
  do que duas dimensões singulares.

- Se ambos os argumentos forem vetores, os elementos de `Y` serão plotados
  versus os elementos de `X`.

- Se `X` é um vetor e `Y` é uma matriz, então as colunas (ou linhas) de `Y` são
  plotados versus `X`. (usando qualquer combinação que corresponda, tentando
  com colunas primeiro.)

- Se `X` for uma matriz e `Y` for um vetor, `Y` será plotado versus as colunas
  (ou linhas) de `X`. (usando qualquer combinação que corresponda, tentando com
  colunas primeiro.)

- Se ambos os argumentos forem matrizes, as colunas de `Y` serão plotadas
  versus as colunas de `X`. Neste caso, ambas as matrizes devem ter o mesmo
  número de linhas e colunas e nenhuma tentativa é feito para transpor os
  argumentos para fazer o número de linhas corresponder.

Vários pares propriedade-valor podem ser especificados, mas eles devem aparecer
aos pares. Esses argumentos são aplicados aos objetos de linha desenhado por
`plot`. Propriedades úteis para modificar são `"linestyle"`, `"linewidth"`,
`"color"`, `"marker"`, `"markersize"`, `"markeredgecolor"`,
`"markerfacecolor"`. A lista completa de propriedades está documentada em
Propriedades da linha.

The `FMT` format argument can also be used to control the plot style. It is a
string composed of four optional parts:
"\<linestyle\>\<marker\>\<color\>\<;displayname;\>". When a marker is
specified, but no linestyle, only the markers are plotted. Similarly, if a
linestyle is specified, but no marker, then only lines are drawn. If both are
specified then lines and markers will be plotted. If no `FMT` and no
`PROPERTY`/`VALUE` pairs are given, then the default plot style is solid lines
with no markers and the color determined by the `"colororder"` property of the
current axes.

Format arguments:

#### linestyle

- '-' Use solid lines (default).
- '--' Use dashed lines.
- ':' Use dotted lines.
- '-.' Use dash-dotted lines.

#### marker

- '+' crosshair
- 'o' circle
- '\*' star
- '.' point
- 'x' cross
- '|' vertical line
- '\_' horizontal line
- 's' square
- 'd' diamond
- '^' upward-facing triangle
- 'v' downward-facing triangle
- '>' right-facing triangle
- '<' left-facing triangle
- 'p' pentagram
- 'h' hexagram

#### color

- 'k', "black" blacK
- 'r', "red" Red
- 'g', "green" Green
- 'b', "blue" Blue
- 'y', "yellow" Yellow
- 'm', "magenta" Magenta
- 'c', "cyan" Cyan
- 'w', "white" White

#### `";displayname;"`

The text between semicolons is used to set the `"displayname"` property which
determines the label used for the plot legend.

The `FMT` argument may also be used to assign legend labels. To do so, include
the desired label between semicolons after the formatting sequence described
above, e.g., `"+b;Data Series 3;"`. Note that the last semicolon is required
and MathJSLab will generate an error if it is left out.

Here are some plot examples:

> > `plot (x, y, "or", x, y2, x, y3, "m", x, y4, "+")`

This command will plot `y` with red circles, `y2` with solid lines, `y3` with
solid magenta lines, and `y4` with points displayed as `'+'`.

> > `plot (b, "*", "markersize", 10)`

This command will plot the data in the variable `b`, with points displayed as
`'*'` and a marker size of 10.

> > `t = 0:0.1:6.3;`

> > `plot (t, cos(t), "-;cos(t);", t, sin(t), "-b;sin(t);");`

This will plot the cosine and sine functions and label them accordingly in the
legend.

If the first argument `HAX` is an axes handle, then plot into this axes, rather
than the current axes returned by `gca`.

The optional return value `H` is a vector of graphics handles to the created
line objects.

To save a plot, in one of several image formats such as PostScript or PNG, use
the 'print' command.

See also: `axis`, `box`, `grid`, `hold`, `legend`, `title`, `xlabel`, `ylabel`,
`xlim`, `ylim`, `ezplot`, `errorbar`, `fplot`, `line`, `plot3`, `polar`,
`loglog`, `semilogx`, `semilogy`, `subplot`.

### References

- https://www.mathworks.com/help/matlab/ref/plot.html
- https://octave.sourceforge.io/octave/function/plot.html
