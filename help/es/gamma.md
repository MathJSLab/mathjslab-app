- `V = gamma (Z)`

Calcula la función Gamma.

La función Gamma se define como

`%gamma (z) = integral (t ^ (z-1) * exp (-t), t, 0, Inf)%`

Nota: La función `gamma` puede crecer bastante, incluso para valores de entrada
pequeños. En muchos casos, puede ser preferible utilizar el logaritmo natural
de la función gamma (`gammaln`) en cálculos para minimizar la pérdida de
precisión. El resultado final es entonces `exp (RESULT_USING_GAMMALN)`.

Véase también: `gammainc`, `gammaln`, `factorial`.

### Referencias

- https://www.mathworks.com/help/matlab/ref/gamma.html
- https://octave.sourceforge.io/octave/function/gamma.html
- https://mathworld.wolfram.com/GammaFunction.html
- https://es.wikipedia.org/wiki/Funci%C3%B3n_gamma
