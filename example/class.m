clear

class(1)
class([1, 2, 3])
class([1; 2; 3])

class("abc")
class('abc')

class({1, 2, 3})

s = struct()
class(s)

f = @sin
class(f)

g = @(x) x + 1
class(g)

isa(1, "double")
isa([1, 2], "double")
isa("abc", "char")
isa('abc', "char")
isa({1, 2}, "cell")
isa(struct(), "struct")
isa(@sin, "function_handle")
isa(@(x) x + 1, "function_handle")

isa(1, "char")
isa("abc", "double")
isa({1, 2}, "double")
isa(struct(), "cell")
isa(@sin, "double")

isa(1, "single")

function h = makeclasshandle()
  function y = inner(x)
    y = x + 1;
  end
  h = @inner;
end

h = makeclasshandle()
class(h)
isa(h, "function_handle")

function y = acceptdouble(x)
  arguments
    x double
  end
  y = isa(x, "double");
end

acceptdouble(5)
acceptdouble([1, 2])
