clear
% Tests unparse functions in MathML format.
10^2 % Tests whether to remove unnecessary parentheses in the power or not.
(10)^2
10^(2)
(-10)^2
10^-2
10^(2)
2^(1/2)
abs(-3)
abs(1+i)
conj(2)
conj(3+2*i)
sqrt(2)
sqrt((2))
sqrt(5+4)
log2(16)
log2(16+16+32)
logb(2,8)
logb(2,8+8+16)
logb(2,4+4)
logb(2,-1)
logb(0,8)
root(64,3)
root(16+16+32,3)
root(64,2+1)
root(64,1+1+1)
exp(i*pi)
e^(i*pi)
gamma(5)
gamma(4+i)
factorial(5)
factorial(22 + 3)
factorial(5.4) % error
factorial(999999999999999)
