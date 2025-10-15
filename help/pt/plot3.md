- `plot3 (X, Y, Z)`
- `plot3 (X, Y, Z, PROP, VALUE, ...)`
- `plot3 (X, Y, Z, FMT)`
- `plot3 (X, CPLX)`
- `plot3 (CPLX)`
- `plot3 (HAX, ...)`
- `H = plot3 (...)`

Produz gráficos 3D.

Muitas combinações diferentes de argumentos são possíveis. A forma mais simples
é

> > `plot3 (X, Y, Z)`

em que os argumentos são considerados os vértices dos pontos a serem plotados
em três dimensões. Se todos os argumentos são vetores de mesmo comprimento,
então uma única linha contínua é desenhada. Se todos argumentos são matrizes,
então cada coluna é tratada como uma linha separada. Nenhuma tentativa é feita
para transpor os argumentos para fazer com que o número de linhas corresponda.

Se apenas dois argumentos forem dados, como

> > `plot3 (X, CPLX)`

as partes real e imaginária do segundo argumento são usadas como coordenadas
`Y` e `Z`, respectivamente.

Se apenas um argumento for dado, como

> > `plot3 (CPLX)`

as partes reais e imaginárias do argumento são usadas como os valores de `Y` e
`Z`, e eles são plotados em relação ao seu índice.

Os argumentos também podem ser dados em grupos de três, como

> > `plot3 (X1, Y1, Z1, X2, Y2, Z2, ...)`

em que cada conjunto de três argumentos é tratado como uma linha separada ou
conjunto de linhas em três dimensões.

Para plotar vários grupos de um ou dois argumentos, separe cada grupo com uma
string de formato vazia, como

> > `plot3 (X1, C1, "", C2, "", ...)`

Vários pares propriedade-valor podem ser especificados, o que afetará os
objetos de linha desenhados por `plot3`. Se o argumento `FMT` for fornecido ele
formatará os objetos de linha da mesma maneira que `plot`. A lista completa de
propriedades está documentada em Propriedades da Linha.

Se o primeiro argumento `HAX` for um identificador de eixo, então plote neste
eixos, em vez dos eixos atuais retornados por `gca`.

O valor de retorno opcional `H` é um handle para a plotagem criada.

Exemplo:

> > `z = [0:0.05:5];`

> > `plot3 (cos (2*pi*z), sin (2*pi*z), z, ";helix;");`

> > `plot3 (z, exp (2i*pi*z), ";complex sinusoid;");`

Veja também: `ezplot3`, `plot`.

### Referências

- https://www.mathworks.com/help/matlab/ref/plot3.html
- https://octave.sourceforge.io/octave/function/plot3.html
