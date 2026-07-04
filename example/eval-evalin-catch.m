clear

eval("missingValue + 1", "caughtValue = 12")
caughtValue

eval("okValue = 5", "shouldNotRun = 99")
okValue
exist("shouldNotRun", "var")

function y = evalcatchinside()
  eval("missingName + 1", "fallback = 42");
  y = fallback;
end

evalcatchinside()
exist("fallback", "var")  % fallback nao deve existir no base

function [y, existsLocal] = evalcatchlocal()
  eval("missingLocal + 1", "localFallback = 77");
  y = localFallback;
  existsLocal = exist("localFallback", "var");
end

[y, existsLocal] = evalcatchlocal()
exist("localFallback", "var")  % localFallback nao deve existir no base

function y = evalcatchnested()
  x = 1;
  inner();
  y = x;

  function inner()
    eval("missingNested + 1", "x = x + 4");
  end
end

evalcatchnested()

function y = evalcatchpropagates()
  eval("missingPrimary", "missingCatch");
  y = 1;
end

evalcatchpropagates()  % erro: missingCatch indefinido

function y = evalincatchcaller()
  evalin("caller", "missingCaller + 1", "callerFallback = 33");
  y = 1;
end

evalincatchcaller()
callerFallback

function y = evalincatchbase()
  evalin("base", "missingBase + 1", "baseFallback = 44");
  y = 1;
end

evalincatchbase()
baseFallback

function y = evalincatchouter()
  y = inner();

  function z = inner()
    evalin("caller", "missingOuter + 1", "outerFallback = 55");
    z = outerFallback;
  end
end

evalincatchouter()
exist("outerFallback", "var")  % outerFallback nao deve existir no base

function y = evalinbaseok()
  evalin("base", "baseOk = 66", "baseCatch = 77");
  y = 1;
end

evalinbaseok()
baseOk
exist("baseCatch", "var")

function y = evalincatchpropagates()
  evalin("base", "missingPrimary", "missingCatch");
  y = 1;
end

evalincatchpropagates()  % erro: missingCatch indefinido

eval("primaryOK = 1", "catchShouldNotRun = 2")
primaryOK
exist("catchShouldNotRun", "var")

eval("missingAgain", "catchAgain = 3")
catchAgain
