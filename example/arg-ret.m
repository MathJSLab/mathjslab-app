clear

function [a, b] = pair(x)
  a = x;
  b = x + 1;
end

pair(10)

[u, v] = pair(10)

function y = countargs(a, b)
  y = nargin;
end

countargs(3, 4)

function [a, b] = countouts()
  a = nargout;
  b = nargout + 10;
end

x = countouts()

[x, y] = countouts()

function [a, b] = counts(x)
  a = nargin();
  b = nargout();
end

[p, q] = counts(7)

function y = inner()
  y = nargout;
end

function [a, b] = outer()
  a = inner();
  b = nargout;
end

[m, n] = outer()

[u, v, w] = pair(10) % error: saída 3 não existe

function y = firstextra(a, varargin)
  y = a + varargin{1};
end

firstextra(10, 3, 4)

function y = addfirsttwo(varargin)
  y = varargin{1} + varargin{2};
end

addfirsttwo(5, 7)

function y = countall(a, varargin)
  y = nargin;
end

countall(1)

countall(1, 2, 3)

function y = noextra(a, varargin)
  y = nargin;
end

noextra(9)

function y = secondextra(a, varargin)
  y = varargin{2};
end

secondextra(1, 20, 30)

function [a, b] = varoutcheck(x, varargin)
  a = nargin;
  b = x + varargin{1};
end

[p, q] = varoutcheck(10, 5)

function y = needsfixed(a, b, varargin)
  y = nargin;
end

needsfixed(1) % error: falta o segundo argumento fixo

function varargout = splitvar(x)
  varargout{1} = x;
  varargout{2} = x + 1;
end

a = splitvar(10)

[a, b] = splitvar(10)

function varargout = countvarouts()
  varargout{1} = nargout;
  varargout{2} = nargout + 10;
end

c = countvarouts()

[c, d] = countvarouts()

function varargout = echoextras(varargin)
  varargout{1} = varargin{1};
  varargout{2} = varargin{2};
end

[u, v] = echoextras(3, 4)

function varargout = mixfixed(a, varargin)
  varargout{1} = nargin;
  varargout{2} = a + varargin{1};
end

[p, q] = mixfixed(10, 5)

function varargout = oneout(x)
  varargout{1} = x;
end

[z1, z2] = oneout(99) % error: saída 2 não foi preenchida

function y = checkedarg(x)
  arguments
    x
  end
  y = x;
end

checkedarg(5)

function y = checkedtwo(x, z)
  arguments
    x
    z
  end
  y = x + z;
end

checkedtwo(2, 3)

function y = checkedvarargin(x, varargin)
  arguments
    x
    varargin
  end
  y = nargin;
end

checkedvarargin(1, 2, 3)

function varargout = checkedvarargout(x)
  arguments
    x
  end
  varargout{1} = x;
  varargout{2} = x + 1;
end

[a1, a2] = checkedvarargout(10)

function y = badarg(x) % error
  arguments
    z
  end
  y = x;
end

function y = checkedsize(x) % error
  arguments
    x (1,1)
  end
  y = x;
end

function y = adddefault(x, z)
  arguments
    x
    z = 10
  end
  y = x + z;
end

adddefault(5)

adddefault(5, 3)

function y = defaultfromprevious(x, z)
  arguments
    x
    z = x + 1
  end
  y = z;
end

defaultfromprevious(10)

function y = defaultchain(x, z, w)
  arguments
    x
    z = x + 1
    w = z + 1
  end
  y = w;
end

defaultchain(20)

defaultchain(20, 30)

defaultchain(20, 30, 40)

function y = defaultwithvarargin(x, z, varargin)
  arguments
    x
    z = 10
    varargin
  end
  y = x + z + nargin;
end

defaultwithvarargin(5)

defaultwithvarargin(5, 3, 9)

function y = needsfirst(x, z)
  arguments
    x
    z = 10
  end
  y = x + z;
end

needsfirst() % error: x continua obrigatório

% A sequence to test return.
clear

function y = early(x)
  y = x;
  return
  y = x + 100;
end

early(5)
early(-3)


function y = abszero(x)
  if x < 0
    y = 0;
    return
  end
  y = x;
end

abszero(-5)
abszero(7)


function y = earlycounter(stop)
  persistent c = 0;
  c = c + 1;
  y = c;
  if stop
    return
  end
  y = c + 100;
end

earlycounter(1)
earlycounter(0)
earlycounter(1)


function [a, b] = earlypair()
  a = 1;
  return
  b = 2;
end

a = earlypair()
[a, b] = earlypair()   % erro: b não foi atribuída


function y = returnwithglobal(x)
  global g
  g = x;
  y = g;
  return
  g = 999;
  y = 999;
end

returnwithglobal(7)
g

return                  % erro: return fora de função


clear

function [a, b] = fixedarity(x, y)
  a = x;
  b = y;
end

nargin(@fixedarity)
nargout(@fixedarity)

nargin("fixedarity")
nargout("fixedarity")

function y = varinarity(x, varargin)
  y = nargin;
end

nargin(@varinarity)

varinarity(1)
varinarity(1, 2, 3)

function varargout = varoutarity(x)
  varargout{1} = x;
  varargout{2} = x + 1;
end

nargout(@varoutarity)

a = varoutarity(10)
[a, b] = varoutarity(10)

nargin(@(x, y) x + y)
nargout(@(x, y) x + y)

nargin("@(x, y, z) x + y + z")
nargout("@(x, y, z) x + y + z")

function h = makenestedarity(a)
  function [u, v] = inner(x, y)
    u = x + a;
    v = y + a;
  end
  h = @inner;
end

h = makenestedarity(10)
nargin(h)
nargout(h)

[u, v] = h(1, 2)

function y = currentnargin(a, b, varargin)
  y = nargin;
end

currentnargin(1, 2)
currentnargin(1, 2, 3, 4)

function [a, b] = currentnargout(x)
  a = nargout;
  b = nargout + x;
end

z = currentnargout(10)
[z, w] = currentnargout(10)


clear

function y = checkedinputs(a, varargin)
  narginchk(1, 3)
  y = nargin;
end

checkedinputs(10)          % OK: 1
checkedinputs(10, 20)      % OK: 2
checkedinputs(10, 20, 30)  % OK: 3
checkedinputs()            % erro: poucos argumentos
checkedinputs(1, 2, 3, 4)  % erro: muitos argumentos

function y = checkedinputsinf(a, varargin)
  narginchk(1, Inf)
  y = nargin;
end

checkedinputsinf(1)              % OK: 1
checkedinputsinf(1, 2, 3, 4, 5)  % OK: 5

function [a, b] = checkedoutputs(x)
  nargoutchk(1, 2)
  a = nargout;
  b = x + 1;
end

a = checkedoutputs(10)       % OK: a = 1
[a, b] = checkedoutputs(10)  % OK: a = 2, b = 11
checkedoutputs(10)           % OK: uma saída implícita

function varargout = checkedvaroutputs(x)
  nargoutchk(1, 2)
  varargout{1} = nargout;
  varargout{2} = x + 1;
  varargout{3} = x + 2;
end

a = checkedvaroutputs(10)          % OK: a = 1
[a, b] = checkedvaroutputs(10)     % OK: a = 2, b = 11
[a, b, c] = checkedvaroutputs(10)  % erro: muitas saídas

function y = exactinputs(a, b)
  narginchk(2, 2)
  y = a + b;
end

exactinputs(3, 4)  % OK: 7
exactinputs(3)     % erro: poucos argumentos
exactinputs(3,4,5) % erro: muitos argumentos

function y = invalidbounds(x)
  narginchk(3, 1)
  y = x;
end

invalidbounds(1)   % erro: limite máximo menor que mínimo

clear

function [a, b] = arityfixed(x, y)
  a = x;
  b = y;
end

nargin(@arityfixed)
nargout(@arityfixed)
nargin("arityfixed")
nargout("arityfixed")

function y = arityvarin(x, varargin)
  y = nargin;
end

nargin(@arityvarin)
nargin("arityvarin")
arityvarin(1)
arityvarin(1, 2, 3)

function varargout = arityvarout(x)
  varargout{1} = x;
  varargout{2} = x + 1;
end

nargout(@arityvarout)
nargout("arityvarout")
a = arityvarout(10)
[a, b] = arityvarout(10)

function [a, varargout] = aritymixedout(x, varargin)
  a = x;
  varargout{1} = nargin;
  varargout{2} = x + 2;
end

nargin(@aritymixedout)
nargout(@aritymixedout)
nargin("aritymixedout")
nargout("aritymixedout")
a = aritymixedout(5)
[a, b] = aritymixedout(5, 6, 7)
[a, b, c] = aritymixedout(5, 6, 7)

nargin(@(x, y) x + y)
nargout(@(x, y) x + y)
nargin("@(x, y, z) x + y + z")
nargout("@(x, y, z) x + y + z")

function h = makearityhandle(offset)
  function [u, v] = inner(x, y)
    u = x + offset;
    v = y + offset;
  end
  h = @inner;
end

h = makearityhandle(10)
nargin(h)
nargout(h)

nargin(3)              % erro esperado
nargout("missingfunc") % erro esperado


clear

function [a, varargout] = mixedoutvalues(x, varargin)
  a = x;
  varargout{1} = nargin;
  varargout{2} = x + 2;
end

a = mixedoutvalues(5)
[a, b] = mixedoutvalues(5, 6, 7)
[a, b, c] = mixedoutvalues(5, 6, 7)

nargin(@mixedoutvalues)
nargout(@mixedoutvalues)
nargin("mixedoutvalues")
nargout("mixedoutvalues")

function [a, b, varargout] = twomixedoutvalues(x)
  a = x;
  b = x + 1;
  varargout{1} = x + 2;
  varargout{2} = x + 3;
end

a = twomixedoutvalues(10)
[a, b] = twomixedoutvalues(10)
[a, b, c] = twomixedoutvalues(10)
[a, b, c, d] = twomixedoutvalues(10)

nargout(@twomixedoutvalues)
nargout("twomixedoutvalues")

function [a, varargout] = missingmixedout(x)
  a = x;
  varargout{1} = x + 1;
end

[a, b] = missingmixedout(4)
[a, b, c] = missingmixedout(4)   % erro esperado: terceiro retorno indefinido

function [a, varargout] = countmixedout(varargin)
  a = nargin;
  varargout{1} = nargin + 10;
  varargout{2} = nargin + 20;
end

a = countmixedout()
[a, b] = countmixedout(1, 2)
[a, b, c] = countmixedout(1, 2, 3)
nargin(@countmixedout)
nargout(@countmixedout)

clear

f = @(x, y) nargin
f(1, 2)

f = @(x, y) nargin()
f(10, 20)

g = @(x) nargout
a = g(10)

g = @(x) nargout()
a = g(20)

h = @(x, y, z) nargin + nargout
h(1, 2, 3)

function f = makeanonmeta(offset)
  f = @(x, y) nargin + nargout + offset;
end

m = makeanonmeta(10)
m(1, 2)

function f = makeanonwithclosure(a)
  b = 5;
  f = @(x, y) x + y + a + b + nargin + nargout;
end

q = makeanonwithclosure(100)
q(1, 2)

function y = callanoninside(f)
  y = f(3, 4);
end

f = @(x, y) x + y + nargin + nargout
callanoninside(f)

nargin(@(x, y) nargin)
nargout(@(x) nargout)

f = @(x) nargin
f()          % erro esperado: número inválido de argumentos

f = @(x) nargout
[a, b] = f(1) % erro esperado: número inválido de saídas

clear

f = @(x) inputname(1)
source = 10
f(source)
f(10)

g = @(x, y, z) [inputname(1), inputname(2), inputname(3)]
a = 1
b = 2
g(a, b, a + b)

h = @(x, y) inputname(2)
h(a, b)
h(a, 20)

function f = makeinputnameanon()
  f = @(x) inputname(1);
end

m = makeinputnameanon()
value = 42
m(value)
m(42)

function f = makeinputnameclosure(offset)
  f = @(x) [inputname(1), inputname(2)];
end

q = makeinputnameclosure(10)
first = 1
second = 2
q(first, second)       % erro esperado: lambda espera 1 argumento

function f = makeinputnameclosure2(offset)
  f = @(x, y) [inputname(1), inputname(2)];
end

q = makeinputnameclosure2(10)
q(first, second)
q(first, second + 1)

inputname(1)           % erro esperado: fora de função/lambda

f = @(x) inputname(0)
f(a)                   % erro esperado: índice inválido

f = @(x) inputname(1.5)
f(a)                   % erro esperado: índice inválido
