- `LAMBDA = eig (A)`
- `LAMBDA = eig (A, B)`
- `[V, LAMBDA] = eig (A)`
- `[V, LAMBDA] = eig (A, B)`
- `[V, LAMBDA, W] = eig (A)`
- `[V, LAMBDA, W] = eig (A, B)`
- `[...] = eig (A,OPCIÓN DE SALDO)`
- `[...] = eig(A, B, ALGORITMO)`
- `[...] = eig (..., EIGVALOPCIÓN)`

Calcula los valores propios (`LAMBDA`) y, opcionalmente, los vectores propios
derechos (`V`) y los vectores propios izquierdos (`W`) de una matriz o par de
matrices.

El flag `BALANCEOPTION` puede ser uno de los siguientes:

- `"saldo"` (predeterminado): el equilibrio preliminar está habilitado.
- `"nobalance"` - Desactiva el equilibrio preliminar.

El flag `EIGVALOPTION` puede ser uno de los siguientes:

- `"matriz"` - Devuelve los valores propios en una matriz diagonal. (por
  defecto si se solicitan 2 o 3 salidas).
- `"vector"` - Devuelve los valores propios en un vector de columna.
  (predeterminado si solo se solicita 1 salida, por ejemplo,
  `LAMBDA = eig(A)`).

El flag `ALGORITMO` puede ser uno de los siguientes:

- `"chol"` - Utiliza la factorización de Cholesky de `B`. (predeterminado si
  `A` es simétrico (hermitiano) y `B` es simétrico (hermitiano) definido
  positivo).
- `"qz"` - Utiliza el algoritmo QZ. (se utiliza siempre que `A` o `B` no sean
  simétricos).

|                              | sin flag |  `chol`  |  `qz`  |
| :--------------------------: | :------: | :------: | :----: |
|     ambos son simétricos     | `"chol"` | `"chol"` | `"qz"` |
| al menos uno no es simétrico |  `"qz"`  |  `"qz"`  | `"qz"` |

Los valores propios devueltos por `eig` no están ordenados.

Véase también: `eigs`, `svd`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/eig.html
- https://octave.sourceforge.io/octave/function/eig.html
- https://mathworld.wolfram.com/Eigenvalue.html
- https://mathworld.wolfram.com/Eigenvector.html
- https://es.wikipedia.org/wiki/Vector,_valor_y_espacio_propios
