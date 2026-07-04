clear % clear all variables

feval(@sin, 0)

feval("sin", 0)

f = @cos
feval(f, 0)

g = @(x) x + 1
feval(g, 4)

feval("@(x) x + 1", 4)

function y = twice(x)
  y = 2 * x;
end

feval(@twice, 5)
feval("twice", 6)

function [a, b] = pair(x)
  a = nargout;
  b = x + 1;
end

x = feval(@pair, 10)
[x, y] = feval("pair", 10)

function h = makefevalnested(a)
  function z = inner(x)
    z = x + a;
  end
  h = @inner;
end

h = makefevalnested(10)
feval(h, 5)

function h = makefevalcounter()
  c = 0;
  function z = bump()
    c = c + 1;
    z = c;
  end
  h = @bump;
end

counter = makefevalcounter()
feval(counter)
feval(counter)
feval(counter)

function callnooutput(f, x)
  feval(f, x);
end

function showvalue(x)
  y = x + 1
end

callnooutput(@showvalue, 9)

clear

f = @(x, y) nargin + nargout
feval(f, 1, 2)

f = @(x) inputname(1)
source = 10
feval(f, source)
feval(f, 10)

feval("@(x) inputname(1)", source)
feval("@(x) inputname(1)", 10)

function y = fevalinputname(x)
  y = inputname(1);
end

source2 = 20
feval(@fevalinputname, source2)
feval("fevalinputname", source2)
feval(@fevalinputname, 20)

function y = readcallerx()
  y = evalin("caller", "x");
end

g = @(x) readcallerx()
feval(g, 30)

function y = fevaloutercaller()
  x = 7;
  f = @(t) evalin("caller", "x + t");
  y = feval(f, 3);
end

fevaloutercaller()

function f = makefevalnested(offset)
  function z = inner(x)
    z = x + offset;
  end
  f = @inner;
end

h = makefevalnested(100)
feval(h, 5)

function [a, b] = fevalpairmeta(x)
  a = nargout;
  b = inputname(1);
end

value = 40
a = feval(@fevalpairmeta, value)
[a, b] = feval(@fevalpairmeta, value)

feval(123, 1)          % erro esperado: primeiro argumento inválido
feval("@(x) x + 1", 4)
