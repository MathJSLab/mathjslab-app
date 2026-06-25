clear % clear all variables

function y = f(x) % Simple function
  y = x^2;
end
f(2)

function [a,b] = f(x) % Two return values
  a = x;
  b = x^2;
end
[a, b] = f(3)

function z = f(x,y) % Two parameters
  z = x + y;
end
f(2,3)

function y = f(x) % Use of internal variable
  a = x + 1;
  y = a * 2;
end

f(5)

function y = f(x) % start stack trace error test
  y = g(x);
end

function z = g(x)
  z = h(x);
end

function w = h(x)
  w = x + unknownVar;
end

f(2) % error: show stack trace
