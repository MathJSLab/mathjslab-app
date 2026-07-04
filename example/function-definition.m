clear % clear all variables
a = 1
b = -10
c = 21
f = @(x) a*x^2+b*x+c
f(3)
f(7)
f(2)
f

clear % clear all variables
sin %% error
z = @sin
z
sin(3)
z(3)

clear % clear all variables
a = 5
a
sum(i, 1, 3, i)
sin(0)
sin = 10
sin

clear % clear all variables
sin % error
f = sin %error
sin(2) % resolve via apply → resolveFunction
cos(0) % resolve via apply → resolveFunction
f = @sin
f(2) % resolve via resolveCallable
g = @(x)x^2
g(3)
a = [1 2 3]
a(2)
(a)(2)
(@sin)(2)

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

clear % clear all variables
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
unknownVar = 1
f(2) % no error
unknownVar = 3
function w = h(x)
  w = x + unknownVar;
end
f(2)
unknownVar = 1
f(2)
