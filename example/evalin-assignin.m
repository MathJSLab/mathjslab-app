clear

x = 20

function y = readcallerexpr()
  x = 10;
  y = evalin("caller", "x + 1");
end

readcallerexpr()

function y = readbaseexpr()
  x = 10;
  y = evalin("base", "x + 1");
end

readbaseexpr()

function setcaller()
  assignin("caller", "createdByCaller", 99)
end

setcaller()
createdByCaller

function setbase()
  assignin("base", "createdByBase", 123)
end

setbase()
createdByBase

function y = outerassignin()
  innerassignin();
  y = localValue;

  function innerassignin()
    assignin("caller", "localValue", 7)
  end
end

outerassignin()
exist("localValue", "var")

function y = outerevalin()
  localValue = 40;
  y = innerevalin();

  function z = innerevalin()
    z = evalin("caller", "localValue + 2");
  end
end

outerevalin()

function y = evalinassigns()
  evalin("caller", "madeByEvalin = 55");
  y = 1;
end

evalinassigns()
madeByEvalin

function y = evalinbaseassigns()
  evalin("base", "madeInBase = 77");
  y = 1;
end

evalinbaseassigns()
madeInBase

function y = assigncomputed()
  value = 5;
  assignin("caller", "computedValue", value + 10)
  y = 0;
end

assigncomputed()
computedValue

evalin("base", "x + createdByCaller + createdByBase")

evalin("unknown", "1")          % erro: workspace nao suportado
assignin("base", "bad-name", 1) % erro: nome de variavel invalido
assignin("base", "x")           % erro: chamada invalida

clear

function y = readcallerx()
  y = evalin("caller", "x");
end

f = @(x) readcallerx()
f(10)

x = 99
readcallerx()

function y = evalinlambdaouter()
  x = 7;
  f = @(t) evalin("caller", "x + 1");
  y = f(3);
end

evalinlambdaouter()

function y = evalinlambdaarg()
  f = @(x) evalin("caller", "x + 5");
  y = f(20);
end

evalinlambdaarg()

function y = evalinreturnedlambda()
  x = 30;
  f = makereadcallerlambda();
  y = f(1);
end

function f = makereadcallerlambda()
  f = @(t) evalin("caller", "x + t");
end

evalinreturnedlambda()

function y = assigninlambdaouter()
  f = @() assignin("caller", "createdInOuter", 9);
  f();
  y = createdInOuter;
end

assigninlambdaouter()
exist("createdInOuter", "var")

function y = assigninlambdaarg()
  f = @(x) assignin("caller", "createdInLambda", x + 1);
  f(40);
  y = createdInLambda;
end

assigninlambdaarg()
exist("createdInLambda", "var")

function y = evalinbasefromlambda()
  x = 1;
  f = @() evalin("base", "baseValue + 1");
  y = f();
end

baseValue = 100
evalinbasefromlambda()

evalin("caller", "baseValue")  % fora de função/lambda: deve usar base
