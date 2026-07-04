clear

x = 10
eval("y = x + 1")
y

eval("z = x + y")
z

eval("w = 2; q = w + z")
w
q

function y = evalinside(x)
  eval("z = x + 1");
  y = z;
end

evalinside(10)
exist("z", "var")   % z nao deve existir no base

function [y, localName] = evalcreateslocal(x)
  eval("localValue = x + 5");
  y = localValue;
  localName = inputname(1);
end

a = 20
[y, localName] = evalcreateslocal(a)
exist("localValue", "var")  % localValue nao deve existir no base

function y = evalnested()
  x = 1;
  inner();
  y = x;

  function inner()
    eval("x = x + 4");
  end
end

evalnested()

function y = evalnestedlocal()
  inner();
  y = exist("createdInsideInner", "var");

  function inner()
    eval("createdInsideInner = 33");
  end
end

evalnestedlocal()

function y = evalwithcaller()
  x = 5;
  y = eval("x + 10");
end

evalwithcaller()

function y = evalcallsfunction(x)
  eval("t = helper(x)");
  y = t;

  function z = helper(v)
    z = v * 2;
  end
end

evalcallsfunction(8)

function y = evalusespersistent()
  persistent count = 0;
  eval("count = count + 1");
  y = count;
end

evalusespersistent()
evalusespersistent()

eval("baseEvalValue = 123")
baseEvalValue

eval(1)           % erro: chamada invalida
eval("1", "2")    % erro: chamada invalida
