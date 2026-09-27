1. Matemática inline com cifrões

Sintaxe:

$x^2 + y^2 = z^2$

Exemplo dentro de uma frase:

A relação $x^2 + y^2 = z^2$ é conhecida.

O GitHub renderiza somente a parte entre os cifrões como matemática inline.


2. Matemática inline com cifrões e crases

Sintaxe:

$`x^2 + y^2 = z^2`$

A sequência de abertura é:

cifrão + crase

$`

A sequência de fechamento é:

crase + cifrão

`$

Exemplo dentro de uma frase:

A relação $`x^2 + y^2 = z^2`$ é conhecida.

As crases protegem a expressão de conflitos com a sintaxe Markdown.
O resultado visual também é uma expressão matemática inline.


3. Matemática em bloco com dois cifrões

Sintaxe:

$$
\left(
    \sum_{k=1}^{n} a_k b_k
\right)^2
$$

A expressão aparece separada do parágrafo, ocupando um bloco próprio.


4. Matemática em bloco com um fence de código "math"

Sintaxe:

```math
\left(
    \sum_{k=1}^{n} a_k b_k
\right)^2
```
