# Cálculo do dia da semana

A organização das atividades humanas em ciclos de sete dias é muito antiga e
certamente é baseada no período das fases da Lua. Os nomes dos dias da semana,
na maioria dos idiomas, derivam dos nomes dos objetos não fixos visíveis no
céu: o Sol, a Lua, Mercúrio, Vênus, Marte, Júpiter e Saturno. Esse sistema de
nomes e a adoção da semana como unidade laboral de tempo foi introduzido no
Império Romano durante a antiguidade tardia, associado a alguns deuses
olímpicos. Em algumas outras línguas, os dias da semana são nomeados conforme
as divindades correspondentes da cultura regional.

Durante as mudanças de calendário o ciclo de dias da semana foi mantido
inalterado. A última mudança de calendário foi do **calendário juliano** para o
**calendário gregoriano** em 1582. Foram omitidos dez dias do calendário
juliano, deixando de existir os dias 5 a 14 de outubro de 1582. O dia sucessivo
à quinta-feira, 4 de outubro, foi sexta-feira, 15 de outubro. O calendário
juliano, anterior ao calendário gregoriano, foi adotado no ano 46 a.C.

A grande questão no calendário, que motivou a criação dos calendários cada vez
mais precisos, é que a duração do **ano trópico** não é um número inteiro de
dias. A noção de que um dia deve ser acrescido a cada 4 anos remonta ao antigo
Egito, por causa da observação da estrela Sirius ao nascer do Sol, que
acontecia só uma vez a cada 4 anos.

Para elaborar um algoritmo que calcule o dia da semana algumas considerações
históricas devem ser observadas. Em especial a consideração do início do ano na
antiguidade. Desde a antiguidade tardia em Roma, o primeiro dia do ano era 1º
de março. Por isso a regra do **ano bissexto** insere um dia no final de
fevereiro, que era o último mês do ano.

A regra antiga, no calendário juliano, era

> O ano é bissexto se é divisível por 4, e neste caso terá um dia acrescentado
> ao final de fevereiro.

Isso incluía 1 dia a cada 4 anos no calendário.

A regra do ano bissexto no atual calendário gregoriano é a seguinte:

> O ano é bissexto se for divisível por 4, mas não se for dividido por 100,
> exceto se for divisível por 400, neste caso será bissexto.

Isso inclui 97 dias a cada 400 anos.

No calendário juliano o ano tem em média 365.25 dias. No calendário gregoriano
o ano tem em média 365.2425 dias, que é mais próximo do valor do ano trópico. O
valor do ano trópico varia lentamente ao longo do tempo (esta variação mínima
não é considerada no calendário). No ano 2000 o ano trópico tinha em média
365.24219 dias.

Um algoritmo que calcule o dia da semana deve considerar os anos bissextos do
calendário gregoriano.

Para calcular o número de dias bissextos incrementados desde o ano 0,
considerando que as divisões são com resultado inteiro, fazemos:

> %%ano/4 - ano/100 + ano/400%%

Assim, um algoritmo que calcule o dia da semana no calendário gregoriano deve
considerar os dias acrescidos devido aos anos bissextos.

Iniciaremos considerando o número de _dias em cada mês_ no ano e o número de
_dias acumulados no início de cada mês_ (num ano não bissexto).

| Mês       | Dias | Acumulado |
| --------- | ---- | --------- |
| Janeiro   | 31   | 0         |
| Fevereiro | 28   | 31        |
| Março     | 31   | 59        |
| Abril     | 30   | 90        |
| Maio      | 31   | 120       |
| Junho     | 30   | 151       |
| Julho     | 31   | 181       |
| Agosto    | 31   | 212       |
| Setembro  | 30   | 243       |
| Outubro   | 31   | 273       |
| Novembro  | 30   | 304       |
| Dezembro  | 31   | 334       |

Tomando o resto da divisão por 7 (o número de dias na semana) da coluna
'Acumulado' teremos o número de dias da semana "deslocados" no início de cada
mês, ou seja, quantos dias a avançar no dia da semana do início do mês anterior
para equivaler ao primeiro dia da semana do mês atual.

| Mês       | Dias | Acumulado | Resto Acumulado/7 |
| --------- | ---- | --------- | ----------------- |
| Janeiro   | 31   | 0         | 0                 |
| Fevereiro | 28   | 31        | 3                 |
| Março     | 31   | 59        | 3                 |
| Abril     | 30   | 90        | 6                 |
| Maio      | 31   | 120       | 1                 |
| Junho     | 30   | 151       | 4                 |
| Julho     | 31   | 181       | 6                 |
| Agosto    | 31   | 212       | 2                 |
| Setembro  | 30   | 243       | 5                 |
| Outubro   | 31   | 273       | 0                 |
| Novembro  | 30   | 304       | 3                 |
| Dezembro  | 31   | 334       | 5                 |

No caso de um ano (não bissexto) o avanço é de 1 dia no dia da semana pois o
resto da divisão de 365 por 7 é 1. Considerando o antigo início do ano romano
em 1º de março, vamos colocar uma coluna de dias a avançar no dia da semana
pela passagem do ano. Por exemplo, considere que a tabela mostra a passagem de
dois anos sucessivos. Vamos fazer isso para subtrair o avanço pelo ano do
'Resto Acumulado/7'.

| Mês       | Dias | Acumulado | Resto Acumulado/7 | Avanço ano | Subtração |
| --------- | ---- | --------- | ----------------- | ---------- | --------- |
| Janeiro   | 31   | 0         | 0                 | 0          | 0         |
| Fevereiro | 28   | 31        | 3                 | 0          | 3         |
| Março     | 31   | 59        | 3                 | 1          | 2         |
| Abril     | 30   | 90        | 6                 | 1          | 5         |
| Maio      | 31   | 120       | 1                 | 1          | 0         |
| Junho     | 30   | 151       | 4                 | 1          | 3         |
| Julho     | 31   | 181       | 6                 | 1          | 5         |
| Agosto    | 31   | 212       | 2                 | 1          | 1         |
| Setembro  | 30   | 243       | 5                 | 1          | 4         |
| Outubro   | 31   | 273       | 0                 | 1          | -1        |
| Novembro  | 30   | 304       | 3                 | 1          | 2         |
| Dezembro  | 31   | 334       | 5                 | 1          | 4         |

Somente o mês de outubro resultou num número negativo. Vamos somar 7,
resultando em 6, para obter um número positivo. Considerando o ciclo de 7 dias
na semana, avançar 6 dias ou recuar 1 dia resulta no mesmo dia da semana.

O resultado é:

| Mês       | Dias | Acumulado | Resto Acumulado/7 | Avanço ano | Subtração | Resultado |
| --------- | ---- | --------- | ----------------- | ---------- | --------- | --------- |
| Janeiro   | 31   | 0         | 0                 | 0          | 0         | 0         |
| Fevereiro | 28   | 31        | 3                 | 0          | 3         | 3         |
| Março     | 31   | 59        | 3                 | 1          | 2         | 2         |
| Abril     | 30   | 90        | 6                 | 1          | 5         | 5         |
| Maio      | 31   | 120       | 1                 | 1          | 0         | 0         |
| Junho     | 30   | 151       | 4                 | 1          | 3         | 3         |
| Julho     | 31   | 181       | 6                 | 1          | 5         | 5         |
| Agosto    | 31   | 212       | 2                 | 1          | 1         | 1         |
| Setembro  | 30   | 243       | 5                 | 1          | 4         | 4         |
| Outubro   | 31   | 273       | 0                 | 1          | -1        | 6         |
| Novembro  | 30   | 304       | 3                 | 1          | 2         | 2         |
| Dezembro  | 31   | 334       | 5                 | 1          | 4         | 4         |

Este resultado final representa o número de dias a avançar no dia da semana a
cada mês, considerando a passagem do ano em 1º de março. Um algoritmo que use
este resultado deve considerar o ano anterior se o mês for janeiro ou
fevereiro.

Com base nos resultados anteriores, vamos delinear o algoritmo para computar o
dia da semana:

Considere a sequência

> `MD = 0,3,2,5,0,3,5,1,4,6,2,4`

indexada de 1 a 12, representando o resultado anterior. Assim, por exemplo,
`MD[8] = 1`, representando o avanço de dias da semana, em relação a 1º de
janeiro, no início de agosto.

Considere o ano na variável `A`, o mês na variável `M` e o dia na variável `D`.
Os meses, de janeiro a dezembro, são indicados de 1 a 12, como na squência
`MD`.

> `A = ano`
>
> `M = mês`
>
> `D = data`

Então fazemos:

> `se M<3 então A = A - 1`

Esta é a correção da passagem do ano em 1º de março.

Então calculamos o número de dias acrescidos pelos anos bissextos:

> `B = A/4 - A/100 + A/400`

Onde cada divisão resulta em inteiro.

Para calcular um número (o resultado não é único) de dias na semana acrescidos
na data atual fazemos

> `T = A + B + MD[M] + D`

Tomamos o resto da divisão deste resultado por 7 e somamos 1. O resultado
corresponde ao dia da semana, contando de 1 a 7, começando no domingo.

Este é o algoritmo mais simples conhecido para calcular o dia da semana no
calendário gregoriano.

Para codificar este algoritmo em uma linguagem de programação algumas
alterações no intervalo de índices representando os meses e a semana devem ser
observados, caso necessário, já que em quase a totalidade das linguagens o
primeiro elemento de uma sequência (um array) recebe o índice 0.

Abaixo está um exemplo usando a linguagem MATLAB (cujos arrays são indexados
começando em 1).

```matlab
% Name: weekday.m
% Author: Sergio Lindau, license MIT.
% Purpose: Calculate weekday for a given date.
% preconditions: variable YEAR, MONTH and  DATE defined.
t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]
W = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
year = YEAR - (MONTH < 3)
WEEKDAY = W(mod(year + fix(year/4) - fix(year/100) + fix(year/400) + t(MONTH) + DATE, 7) + 1)
clear t W year
```

A seguir, o mesmo código em linguagem C:

```C
/* Name: weekday.c */
/* Author: Sergio Lindau, license MIT. */
/* Purpose: Calculate weekday for a given date. */
/* preconditions: variable YEAR, MONTH and  DATE defined. */
int t[] = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
char W[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
int year = YEAR - (MONTH < 3);
int WEEKDAY = W(mod(year + fix(year/4) - fix(year/100) + fix(year/400) + t(MONTH) + DATE, 7) + 1)
```
