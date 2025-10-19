- `RAD = deg2rad (DEG)`

Converte graus em radianos.

A entrada `DEG` deve ser escalar ou matriz. `DEG` pode ser complexo, caso em
que os componentes reais e imaginários serão convertidos separadamente.

A saída `RAD` tem as mesmas dimensões que `DEG` com graus convertidos em
radianos usando a constante de conversão `%pi/180%`.

Exemplo:

`deg2rad ([0, 90, 180, 270, 360])`

%%deg2rad ([0, 90, 180, 270, 360]) = [0, 1.570796326794896619,
3.141592653589793238, 4.712388980384689857, 6.283185307179586476]%%

Veja também: `rad2deg`.

### Referências

- https://www.mathworks.com/help/matlab/ref/deg2rad.html
- https://octave.sourceforge.io/octave/function/deg2rad.html
- https://pt.wikipedia.org/wiki/%C3%82ngulo
- https://pt.wikipedia.org/wiki/Grau_(geometria)
- https://pt.wikipedia.org/wiki/Radiano
