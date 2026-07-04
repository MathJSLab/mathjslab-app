clear
A.x = [2,3,4]
A.y = 2
A.z = 3
A
A(1,5).x=999
A(1,1).x(1,2)
B=[true,false,false,true,true]
C=A(B)
struct('test', 3, 'boo', 99)
A.x % returns a cs-list
ans

clear

% metadados
nargin("struct")
nargout("struct")

% struct vazio
s0 = struct()
class(s0)
isstruct(s0)

% struct com pares campo/valor
s = struct("a", 1, "b", [2, 3], "name", "mathjslab")
s.a
s.b
s.name

% copia de struct
t = struct(s)
t.a
t.b
t.name

% struct usado em funcao
function y = readstructfield(s)
  y = s.a + s.b(2);
end

readstructfield(s)

% struct como retorno
function s = makestruct(x)
  s = struct("value", x, "doubleValue", 2*x);
end

r = makestruct(5)
r.value
r.doubleValue

struct(1, 2) % error
struct("a", 1, 2, 3) % error
