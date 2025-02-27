% Solution of the quadratic equation: x^2-10*x+21=0
clear
% definition of coefficients
a = 1
b = -10
c = 21
% solution by Bhaskara's formula
Delta = b^2-4*a*c
x1 = (-b + sqrt(Delta))/(2*a)
x2 = (-b - sqrt(Delta))/(2*a)
% definition of the quadratic function
f = @(x) a*x^2+b*x+c
% shows plot of the roots of f(x)
plot2d(f(X),X,min([x1,x2,0])-1,max([x1,x2,0])+1)
