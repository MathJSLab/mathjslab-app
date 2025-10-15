- `R = randi (IMAX)`
- `R = randi (IMAX, N)`
- `R = randi (IMAX, M, N, ...)`
- `R = randi ([IMIN IMAX], ...)`

Retorna números inteiros aleatórios no intervalo `1:IMAX`.

Argumentos adicionais determinam as dimensões da matriz de retorno. Quando
nenhum argumento é especificado, um único número inteiro aleatório é devolvida.
Se um argumento `N` for especificado, então uma matriz quadrada (N x N) é
retornada. Dois ou mais argumentos retornarão uma matriz multidimensional (M x
N x ...).

O intervalo inteiro pode opcionalmente ser descrito por uma matriz com um
limite inferior e superior, nesse caso os inteiros retornados estarão no
intervalo [IMIN, IMAX].

O exemplo a seguir retorna 150 números inteiros no intervalo de 1 a 10.

> > `ri = randi (10, 150, 1)`

Veja também: `rand`, `randn`.

### Referências

- https://www.mathworks.com/help/matlab/ref/randi.html
- https://octave.sourceforge.io/octave/function/randi.html
