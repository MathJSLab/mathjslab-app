- `LAMBDA = eig (A)`
- `LAMBDA = eig (A, B)`
- `[V, LAMBDA] = eig (A)`
- `[V, LAMBDA] = eig (A, B)`
- `[V, LAMBDA, W] = eig (A)`
- `[V, LAMBDA, W] = eig (A, B)`
- `[...] = eig (A, BALANCEOPTION)`
- `[...] = eig(A, B, ALGORITMO)`
- `[...] = eig (..., EIGVALOPTION)`

Calcula os autovalores (`LAMBDA`) e, opcionalmente, os autovetores direitos
(`V`) e os autovetores esquerdos (`W`) de uma matriz ou par de matrizes.

O flag `BALANCEOPTION` pode ser um dos seguintes:

- `"balance"` (padrão) - O balanceamento preliminar está ativado.
- `"nobalance"` - Desativa o balanceamento preliminar.

O flag `EIGVALOPTION` pode ser um dos seguintes:

- `"matrix"` - Retorna os autovalores em uma matriz diagonal. (padrão se forem
  solicitadas 2 ou 3 saídas).
- `"vector"` - Retorna os autovalores em um vetor coluna. (padrão se apenas 1
  saída for solicitada, por exemplo, `LAMBDA = eig (A)`).

O flag `ALGORITMO` pode ser um dos seguintes:

- `"chol"` - Usa a fatoração de Cholesky de `B`. (padrão se `A` for simétrico
  (Hermitiano) e `B` for simétrico (Hermitiano) positivo definido).
- `"qz"` - Usa o algoritmo QZ. (usado sempre que `A` ou `B` não são
  simétricos).

|                               | sem flag |  `chol`  |  `qz`  |
| :---------------------------: | :------: | :------: | :----: |
|     ambos são simétricos      | `"chol"` | `"chol"` | `"qz"` |
| pelo menos um não é simétrico |  `"qz"`  |  `"qz"`  | `"qz"` |

Os autovalores retornados por `eig` não são ordenados.

Veja também: `eigs`, `svd`.

### Referências

- https://www.mathworks.com/help/matlab/ref/eig.html
- https://octave.sourceforge.io/octave/function/eig.html
- https://mathworld.wolfram.com/Eigenvalue.html
- https://mathworld.wolfram.com/Eigenvector.html
- https://pt.wikipedia.org/wiki/Autovalores_e_autovetores
