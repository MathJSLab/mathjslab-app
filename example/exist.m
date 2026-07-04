clear % clear all variables

clear

exist("missing_name")

x = 1
exist("x")
exist("x", "var")
exist("x", "builtin")
exist("x", "file")

function y = existuser(x)
  y = x;
end

exist("existuser")
exist("existuser", "file")
exist("existuser", "function")
exist("existuser", "var")
exist("existuser", "builtin")

exist("sin")
exist("sin", "builtin")
exist("sin", "file")
exist("sin", "function")
exist("sin", "var")

exist("double", "class")
exist("single", "class")
exist("char", "class")
exist("cell", "class")
exist("struct", "class")
exist("function_handle", "class")
exist("unknown_class", "class")

function y = outerexist()
  y = exist("inner");
  function z = inner()
    z = 1;
  end
end

outerexist()
exist("inner")

function y = outerexistvar()
  a = 10;
  y = exist("a", "var");
end

outerexistvar()
exist("a", "var")

global gexist
exist("gexist")
exist("gexist", "var")

gexist = 5
exist("gexist")
exist("gexist", "var")
