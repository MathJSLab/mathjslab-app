clear % clear all variables

function y = counter()
  persistent c = 0;
  c = c + 1;
  y = c;
end

counter() % 1
counter() % 2
counter() % 3

c % error: it does not leak into the global scope.

function y = counter()
  persistent c = 0;
  c = c + 1;
  y = c;
end

counter() % After resetting the function, it restarts and returns 1.

function y = acc(x)
  persistent total = 0;
  total = total + x;
  y = total;
end

acc(5)
acc(3)
acc(-2)

persistent c % error: persistent declaration is only valid inside a function.
