- `I = eye (N)`
- `I = eye (M, N)`
- `I = eye ([M N])`

Retorna a matriz identidade.

Com um único argumento escalar `N`, retorna uma matriz de identidade quadrada
`N x N`.

Se forem dados dois argumentos escalares `(M, N)`, `eye` os considera como o
número de linhas e colunas. Se for dado um vetor com dois elementos, `eye` usa
os valores dos elementos como o número de linhas e colunas, respectivamente.
Por exemplo:

> > `eye (3)`

> > `%eye (3) = [1,0,0;0,1,0;0,0,1]%`

Todas as expressões a seguir produzem o mesmo resultado:

> > `eye (2)`

> > `eye (2, 2)`

> > `eye (size ([1, 2; 3, 4]))`

Chamar a função `eye` sem argumentos é equivalente a chamar com o argumento
`1`. Quaisquer dimensões negativas são tratadas como zero. Essas definições
ímpares são para compatibilidade com o
[MATLAB&reg;](https://www.mathworks.com/)/[Octave](https://www.gnu.org/software/octave/).

Veja também: `ones`, `zeros`.

### Referências

- https://www.mathworks.com/help/matlab/ref/eye.html
- https://octave.sourceforge.io/octave/function/eye.html
- https://mathworld.wolfram.com/IdentityMatrix.html
- https://pt.wikipedia.org/wiki/Matriz_identidade
