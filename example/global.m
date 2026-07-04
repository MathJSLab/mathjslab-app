clear % clear all variables

global a b c

global g
g = 10

function y = readg()
  global g
  y = g
end

readg()

function setg(x)
  global g
  g = x
end

setg(7)
g
