- `N = ndims (A)`

Retorna o número de dimensões de `A`.

Para qualquer array, o resultado será sempre maior ou igual a 2. Dimensões
singulares finais não são contabilizadas, ou seja, dimensões finais D maiores
que 2 para as quais 'size (A, D) = 1'.

> > `ndims (ones (4, 1, 2, 1))`

> > `%3%`

Veja também: `size`.

### Referências

- https://www.mathworks.com/help/matlab/ref/ndims.html
- https://octave.sourceforge.io/octave/function/ndims.html
