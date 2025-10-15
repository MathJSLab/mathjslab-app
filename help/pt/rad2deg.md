- `DEG = rad2deg (RAD)`

Converte radianos em graus.

A entrada `RAD` deve ser escalar ou matriz. `RAD` pode ser complexo, caso em
que os componentes reais e imaginários serão convertidos separadamente.

A saída `DEG` tem as mesmas dimensões de `RAD` com radianos convertido em graus
usando a constante de conversão `180/pi`.

Exemplo:

> > `rad2deg ([0, pi/2, pi, 3/2*pi, 2*pi])`

> > %%[0, 90, 180, 270, 360]%%

Veja também: `deg2rad`.

### Referências

- https://www.mathworks.com/help/matlab/ref/rad2deg.html
- https://octave.sourceforge.io/octave/function/rad2deg.html
- https://en.wikipedia.org/wiki/Angle
- https://en.wikipedia.org/wiki/Degree_(angle)
- https://en.wikipedia.org/wiki/Radian
