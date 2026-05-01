clear % clear all variables
% Forward reference
A = 1
B = 2
C = D + 1
D = 3
A
C
C == 4

clear % clear all variables
% Forward reference
A = 1 % Previous definition
X = A + B + 1 % error - definition with undefined reference
B = 5 % definition of previous undefined reference
X % now it's defined
X == 7

clear % clear all variables
% Double undefined
X = A + B + 1 % error - definition with undefined reference
B = 5 % definition of previous undefined reference
X
A = 4
X
X == 10

% clear % clear all variables
% configure('allowForwardReference', false)
% C = D + 1   % erro imediato: 'D' undefined
% D = 3
% C

clear % clear all variables
% circular dependecy
A = B + 1
B = A + 1
