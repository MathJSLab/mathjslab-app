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
f(3)
clear % clear all variables
function z = f(x,y) % Two parameters
  z = x + y;
end
f(2,3)
clear % clear all variables
function y = f(x) % Use of internal variable
  a = x + 1;
  y = a * 2;
end
f(3)
