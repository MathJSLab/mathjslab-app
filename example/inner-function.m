clear % clear all variables

clear

function y = outercallbefore(x)
  a = 10;
  y = inner(x);

  function z = inner(t)
    z = t + a;
  end
end

outercallbefore(5)


function y = outerwrite()
  a = 1;
  inner();
  y = a;

  function inner()
    a = 5;
  end
end

outerwrite()
outerwrite()


function y = outershadow()
  a = 10;
  y = inner(3) + a;

  function z = inner(a)
    a = a + 1;
    z = a;
  end
end

outershadow()


function y = outerreturnupdate()
  y = 1;
  bump();

  function bump()
    y = y + 1;
  end
end

outerreturnupdate()


function y = outernoleak()
  y = inner();

  function z = inner()
    z = 1;
  end
end

outernoleak()
inner()   % erro: função aninhada não deve vazar para o escopo global


function y = nestedwithreturn(x)
  y = inner(x);

  function z = inner(t)
    if t < 0
      z = 0;
      return
    end
    z = t;
  end
end

nestedwithreturn(-5)
nestedwithreturn(7)


function y = nestedpersistent()
  y = bump();

  function z = bump()
    persistent c = 0;
    c = c + 1;
    z = c;
  end
end

nestedpersistent()
nestedpersistent()
nestedpersistent()


clear

clear

function f = makenested(a)
  function z = inner(x)
    z = x + a;
  end
  f = @inner;
end

h = makenested(10)
h(5)

function f = makecounter()
  c = 0;
  function z = bump()
    c = c + 1;
    z = c;
  end
  f = @bump;
end

h = makecounter()
h()
h()
h()

h1 = makecounter()
h2 = makecounter()
h1()
h1()
h2()
h1()
h2()

function f = makeadder(a)
  function y = add(x)
    y = x + a;
  end
  f = @add;
end

add3 = makeadder(3)
add10 = makeadder(10)
add3(7)
add10(7)

function [inc, get] = makestate()
  value = 0;
  function y = increment()
    value = value + 1;
    y = value;
  end
  function y = current()
    y = value;
  end
  inc = @increment;
  get = @current;
end

[inc, get] = makestate()
get()
inc()
inc()
get()

function f = makeparamshadow(a)
  function y = inner(a)
    a = a + 1;
    y = a;
  end
  f = @inner;
end

shadow = makeparamshadow(100)
shadow(5)

function f = makeouterwriter()
  y = 1;
  function z = bump()
    y = y + 1;
    z = y;
  end
  f = @bump;
end

writer = makeouterwriter()
writer()
writer()

clear

func2str(@sin)

f = str2func("sin")
f(0)

g = str2func("@(x) x + 1")
g(4)

func2str(g)

info = functions(@sin)
info.function
info.type
info.workspace

info = functions(@(x) x + 1)
info.function
info.type
info.workspace

function h = makenestedhandle(a)
  function y = inner(x)
    y = x + a;
  end
  h = @inner;
end

h = makenestedhandle(10)
h(5)

func2str(h)

info = functions(h)
info.function
info.type
info.workspace

function [h1, h2] = makepair()
  value = 0;
  function y = inc()
    value = value + 1;
    y = value;
  end
  function y = get()
    y = value;
  end
  h1 = @inc;
  h2 = @get;
end

[inc, get] = makepair()
functions(inc)
functions(get)
get()
inc()
inc()
get()
