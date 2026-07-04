clear

func2str(@sin)
func2str(@(x) x + 1)
func2str("sin")              % erro: argumento deve ser function_handle

str2func("sin")
f = str2func("@(x) x + 1")
f(4)
str2func(1)                  % erro: argumento deve ser char

functions(@sin)
functions(@(x) x + 1)
functions("sin")             % erro: argumento deve ser function_handle

isa(1, "double")
isa("abc", "char")
isa(1, 2)                    % erro: segundo argumento deve ser char

which("sin")
which(@sin)
which(@(x) x + 1)
feval("which", 1)            % erro: argumento de which deve ser char ou function_handle

exist("sin")
exist("sin", "builtin")
exist(1)                     % erro: primeiro argumento deve ser char

eval("x = 10")
x
eval(1)                      % erro: primeiro argumento deve ser char
eval("1", 2)                 % erro: catchCode deve ser char

evalin("base", "y = 20")
y
evalin(1, "y = 30")          % erro: workspace deve ser char
evalin("base", 1)            % erro: código deve ser char

assignin("base", "z", 30)
z
assignin("base", 1, 40)      % erro: nome da variável deve ser char

inputname(1)                 % erro: fora de função: deve retornar string vazia ou comportamento já esperado
inputname("1")               % erro: argumento deve ser double

nargin("sin")
nargout("sin")
nargin(@sin)
nargout(@sin)
nargin(3)                    % erro: alvo deve ser char ou function_handle
nargout(3)                   % erro: alvo deve ser char ou function_handle

feval(@sin, 0)
feval("sin", 0)
feval("@(x) x + 1", 4)
feval(123, 1)                % erro: primeiro argumento deve ser char ou function_handle

narginchk(0, 2)
nargoutchk(0, 2)
narginchk("0", 2)            % erro: min deve ser double
nargoutchk(0, "2")           % erro: max deve ser double


% Teste sugerido: builtin_signature_validators
clear

% Casos válidos no workspace/base
narginchk(0, 2)
narginchk(0, Inf)
nargoutchk(0, 2)
nargoutchk(0, Inf)

% Casos válidos dentro de funções
function y = chkinputsig(a, varargin)
  narginchk(1, 3)
  y = nargin;
end

chkinputsig(10)
chkinputsig(10, 20)
chkinputsig(10, 20, 30)
chkinputsig(10, 20, 30, 40)     % erro: número de argumentos de entrada inválido

function y = chkinputinf(a, varargin)
  narginchk(1, Inf)
  y = nargin;
end

chkinputinf(1)
chkinputinf(1, 2, 3, 4)

function [a, b] = chkoutputsig(x)
  nargoutchk(1, 2)
  a = nargout;
  b = x + 1;
end

r = chkoutputsig(10)
[r, s] = chkoutputsig(10)
[r, s, t] = chkoutputsig(10)    % erro: saída demais

function varargout = chkoutputinf(x)
  nargoutchk(0, Inf)
  varargout{1} = nargout;
  varargout{2} = x + 1;
  varargout{3} = x + 2;
end

chkoutputinf(5)
[a, b, c] = chkoutputinf(5)

% inputname continua válido somente dentro de função
function name = chkinputname(x)
  name = inputname(1);
end

sourceValue = 42
chkinputname(sourceValue)
chkinputname(42)
inputname(1)                    % erro: inputname fora de função

% Validação declarativa dos argumentos de narginchk/nargoutchk
narginchk(-1, 2)                % erro: min deve ser inteiro não-negativo
narginchk(0.5, 2)               % erro: min deve ser inteiro
narginchk(0, -1)                % erro: max deve ser inteiro não-negativo
narginchk(0, 1.5)               % erro: max deve ser inteiro
narginchk(0, "2")               % erro: max deve ser double

nargoutchk(-1, 2)               % erro: min deve ser inteiro não-negativo
nargoutchk(0.5, 2)              % erro: min deve ser inteiro
nargoutchk(0, -1)               % erro: max deve ser inteiro não-negativo
nargoutchk(0, 1.5)              % erro: max deve ser inteiro
nargoutchk("0", 2)              % erro: min deve ser double

% Validação declarativa de inputname
function y = badinputname(n)
  y = inputname(n);
end

badinputname(1)
badinputname(0)                 % erro: argumento deve ser inteiro positivo
badinputname(1.5)               % erro: argumento deve ser inteiro positivo
badinputname(Inf)               % erro: argumento deve ser finito
badinputname("1")               % erro: argumento deve ser double


% Teste sugerido: builtin_signature_string_identifier_alternatives
clear

% mfilename: opções declarativas permitidas
mfilename()
mfilename("fullpath")
mfilename("class")
mfilename("bad")                 % erro: opção inválida

function y = sig_mfilename_name()
  y = mfilename();
end

function y = sig_mfilename_fullpath()
  y = mfilename("fullpath");
end

function y = sig_mfilename_class()
  y = mfilename("class");
end

sig_mfilename_name()
sig_mfilename_fullpath()
sig_mfilename_class()

% dbstack: aceita contagem inteira não-negativa ou opção "-completenames"
function [current, caller] = sig_stack_caller()
  [current, caller] = sig_stack_leaf();
end

function [current, caller] = sig_stack_leaf()
  s = dbstack();
  current = s(1).name;
  caller = s(2).name;
end

[current, caller] = sig_stack_caller()

function caller = sig_stack_skip()
  caller = sig_stack_skip_leaf();
end

function caller = sig_stack_skip_leaf()
  s = dbstack(1);
  caller = s(1).name;
end

sig_stack_skip()

function current = sig_stack_option()
  s = dbstack("-completenames");
  current = s(1).name;
end

sig_stack_option()

dbstack(-1)                      % erro: contagem inválida
dbstack(1.5)                     % erro: contagem inválida
dbstack("bad")                   % erro: opção inválida
dbstack(1, "-completenames", 2)  % erro: argumentos demais

% evalin: workspace agora é validado declarativamente
x = 10
evalin("base", "y = x + 5")
y

function z = sig_evalin_caller()
  localx = 7;
  z = sig_evalin_reader();
end

function z = sig_evalin_reader()
  z = evalin("caller", "localx + 1");
end

sig_evalin_caller()

evalin("unknown", "1")           % erro: workspace inválido
evalin("base", 1)                % erro: código deve ser char
evalin("base")                   % erro: faltam argumentos

% assignin: workspace e nome de variável agora são validados declarativamente
assignin("base", "createdByAssignin", 123)
createdByAssignin

function y = sig_assignin_caller()
  sig_assignin_writer();
  y = localCreated;
end

function sig_assignin_writer()
  assignin("caller", "localCreated", 77)
end

sig_assignin_caller()

assignin("unknown", "x", 1)      % erro: workspace inválido
assignin("base", "bad-name", 1)  % erro: nome inválido
assignin("base", "x")            % erro: faltam argumentos
assignin("base", 1, 2)           % erro: nome deve ser char
