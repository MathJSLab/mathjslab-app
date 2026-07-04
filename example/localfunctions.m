clear

function y = localfirst(x)
  y = x + 1;
end

function y = localsecond(x)
  y = x + 2;
end

c = localfunctions()
func2str(c{1})
func2str(c{2})
feval(c{1}, 10)
feval(c{2}, 10)

h = c{1}
h(20)
which(h)
functions(h)

function [name, y, kind, workspace] = outermakehandles(a)
  c = localfunctions();
  h = c{1};
  info = functions(h);
  name = func2str(h);
  y = h(5);
  kind = info.type;
  workspace = info.workspace;

  function z = inner(x)
    z = x + a;
  end
end

[name, y, kind, workspace] = outermakehandles(10)

function [y1, y2] = outertwo(a)
  c = localfunctions();
  h1 = c{1};
  h2 = c{2};
  y1 = h1(5);
  y2 = h2(5);

  function z = addbase(x)
    z = x + a;
  end

  function z = mulbase(x)
    z = x * a;
  end
end

[y1, y2] = outertwo(3)

function names = nestednames()
  c = localfunctions();
  names = {func2str(c{1}), func2str(c{2})};

  function y = alpha()
    y = 1;
  end

  function y = beta()
    y = 2;
  end
end

nestednames()

function y = nestedwithstate()
  count = 0;
  c = localfunctions();
  bump = c{1};
  y = bump() + bump();

  function z = inc()
    count = count + 1;
    z = count;
  end
end

nestedwithstate()
nestedwithstate()

localfunctions(1)  % erro: chamada inválida
