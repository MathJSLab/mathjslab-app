clear

function [first, second, third, fourth] = namesofinputs(x, y, z)
  first = inputname(1);
  second = inputname(2);
  third = inputname(3);
  fourth = inputname(4);
end

a = 10
b = 20

[first, second, third, fourth] = namesofinputs(a, b, a)
[first, second, third, fourth] = namesofinputs(a, b + 1, 30)
[first, second, third, fourth] = namesofinputs(10, a, b)

function name = singleinputname(x)
  name = inputname(1);
end

singleinputname(a)
singleinputname(a + 1)
singleinputname(100)

function [name1, name2, count] = varargininputnames(x, varargin)
  name1 = inputname(1);
  name2 = inputname(2);
  count = nargin;
end

varargininputnames(a)
varargininputnames(a, b)
varargininputnames(a, b + 1)

function name = outerinputname(x)
  name = inner(x);

  function y = inner(value)
    y = inputname(1);
  end
end

outerinputname(a)
outerinputname(5)

function [outername, innername] = twolevelinputname(x)
  outername = inputname(1);
  innername = inner(x);

  function y = inner(value)
    y = inputname(1);
  end
end

[outername, innername] = twolevelinputname(a)
[outername, innername] = twolevelinputname(5)

function y = badinputname(n)
  y = inputname(n);
end

badinputname(1)
badinputname(2)
badinputname(0)    % erro: indice deve ser inteiro positivo
badinputname(1.5)  % erro: indice deve ser inteiro positivo

inputname(1)       % erro: inputname so e valido dentro de funcao
