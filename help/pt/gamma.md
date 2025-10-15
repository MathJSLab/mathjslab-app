- `V = gamma (Z)`

Calcula a função Gama.

A função Gama é definida como

%%gamma (z) = integral (t ^ (z-1) \* exp (-t), t, 0, Inf)%%

Observação: A função `gamma` pode crescer bastante, mesmo para pequenos valores
de entrada. Em muitos casos, pode ser preferível usar o logaritmo natural da
função gama (`gammaln`) em cálculos para minimizar a perda de precisão. O
resultado final é então `exp (RESULT_USING_GAMMALN)`.

Veja também: `gammainc`, `gammaln`, `factorial`.

### Referências

- https://www.mathworks.com/help/matlab/ref/gamma.html
- https://octave.sourceforge.io/octave/function/gamma.html
- https://mathworld.wolfram.com/GammaFunction.html
- https://pt.wikipedia.org/wiki/Fun%C3%A7%C3%A3o_gama
