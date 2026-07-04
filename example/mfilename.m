clear

mfilename()

function y = currentname()
  y = mfilename();
end

currentname()

function y = currentnamefullpath()
  y = mfilename("fullpath");
end

currentnamefullpath()

function y = currentnameclass()
  y = mfilename("class");
end

currentnameclass()

function y = outermfilename()
  y = mfilename();
end

outermfilename()

function y = nestedmfilename()
  y = inner();
  function z = inner()
    z = mfilename();
  end
end

nestedmfilename()

function [a, b] = bothmfilename()
  a = mfilename();
  b = inner();
  function z = inner()
    z = mfilename("fullpath");
  end
end

[a, b] = bothmfilename()

function h = makemfilenamehandle()
  function y = inner()
    y = mfilename();
  end
  h = @inner;
end

h = makemfilenamehandle()
h()

function y = callmfilenamehandle(f)
  y = f();
end

callmfilenamehandle(h)
