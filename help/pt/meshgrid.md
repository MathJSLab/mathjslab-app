- `[XX, YY] = meshgrid (X, Y)`
- `[XX, YY, ZZ] = meshgrid (X, Y, Z)`
- `[XX, YY] = meshgrid (X)`
- `[XX, YY, ZZ] = meshgrid (X)`

Dados vetores de coordenadas `X` e `Y`, retorne as matrizes `XX` e `YY`
correspondendo a uma grade 2-D completa.

As linhas de `XX` são cópias de `X` e as colunas de `YY` são cópias de `Y`. Se
`Y` for omitido, então será considerado igual a `X`.

Se a entrada opcional `Z` for fornecida ou `ZZ` for solicitado, então a saída
será uma grade 3-D completa. Se `Z` for omitido e `ZZ` for solicitado, será
assumido como sendo o mesmo que `Y`.

`meshgrid` é usado com mais frequência para produzir entrada para uma função
2-D ou 3-D que será plotada. O exemplo a seguir cria um gráfico de superfície
da função "sombrero".

> > `f = @(x,y) sin (sqrt (x.^2 + y.^2)) ./ sqrt (x.^2 + y.^2);`

> > `range = linspace (-8, 8, 41);`

> > `[X, Y] = meshgrid (range, range);`

> > `Z = f (X, Y);`

> > `surf (X, Y, Z);`

Nota de programação: `meshgrid` é restrito à geração de grade 2-D ou 3-D. A
função `ndgrid` irá gerar 1-D através de N-D grades. No entanto, as funções não
são completamente equivalentes. Se `X` for um vetor de comprimento `M` e `Y`
for um vetor de comprimento `N`, então `meshgrid` produzirá uma grade de saída
que é NxM. `ndgrid` produzirá uma saída que é MxN (transposta) para a mesma
entrada. Algumas funções principais esperam entrada `meshgrid` e outras esperam
entrada `ndgrid`. Verifique a documentação da função em questão para determinar
o formato de entrada adequado.

Veja também: `ndgrid`, `mesh`, `contour`, `surf`.

### Referências

- https://www.mathworks.com/help/matlab/ref/meshgrid.html
- https://octave.sourceforge.io/octave/function/meshgrid.html
