clear

function y = clearuser()
  y = 10;
end

clearuser()
exist("clearuser")
which("clearuser")

clear clearuser

exist("clearuser")
which("clearuser")
clearuser()  % erro: funcao indefinida

function y = clearone()
  y = 1;
end

function y = cleartwo()
  y = 2;
end

clearone()
cleartwo()
exist("clearone")
exist("cleartwo")
exist("sin")

clear functions

exist("clearone")
exist("cleartwo")
exist("sin")
which("sin")

function y = clearshadow()
  y = 5;
end

clearshadow = 3
clearshadow

clear clearshadow

exist("clearshadow")
clearshadow()  % erro: funcao indefinida

function y = clearcounter()
  persistent c = 0;
  c = c + 1;
  y = c;
end

clearcounter()
clearcounter()

clear clearcounter

function y = clearcounter()
  persistent c = 0;
  c = c + 1;
  y = c;
end

clearcounter()

function y = clearcounter2()
  persistent c = 0;
  c = c + 1;
  y = c;
end

clearcounter2()
clearcounter2()

clear functions

exist("clearcounter2")
clearcounter2()  % erro: funcao indefinida

function y = afterclear()
  y = 99;
end

afterclear()

clear

exist("afterclear")
exist("sin")


clear

global g h
g = 10
h = 20
exist("g", "var")
exist("h", "var")

clear global
exist("g", "var")
exist("h", "var")

localValue = 30
global g
g = 5
clear global
localValue
exist("g", "var")

global g
g = 3
g

function y = readclearedglobal()
  global g
  y = exist("g", "var");
end

readclearedglobal()

global g
g = 11
readclearedglobal()

clear global
readclearedglobal()

function y = clearandreadglobal()
  global g
  g = 99;
  clear global
  y = exist("g", "var");
end

clearandreadglobal()
exist("g", "var")

global a b c
a = 1
b = 2
c = 3
clear global
exist("a", "var")
exist("b", "var")
exist("c", "var")

global a
a = 42
a
