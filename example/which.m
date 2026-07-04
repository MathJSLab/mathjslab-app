clear % clear all variables

which("missing_name")
which missing_name

x = 1
which("x")
which x

function y = whichuser(x)
  y = x;
end

which("whichuser")
which whichuser

which("sin")
which sin

f = @sin
which(f)

g = @(x) x + 1
which(g)

function h = makewhichnested()
  function y = inner(x)
    y = x;
  end
  h = @inner;
end

h = makewhichnested()
which(h)

which("inner")
which inner

function y = outerwhich()
  y = exist("inner");
  which inner
  function z = inner()
    z = 1;
  end
end

outerwhich()
