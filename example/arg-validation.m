clear % clear all variables

function y = scalaronly(x)
  arguments
    x (1,1)
  end
  y = x;
end

scalaronly(5)

scalaronly([1,2]) % error: expected size 1x1, got 1x2

function y = rowonly(x)
  arguments
    x (1,2)
  end
  y = x;
end

rowonly([1,2])

rowonly([1;2]) % error: expected size 1x2, got 2x1

function y = columnonly(x)
  arguments
    x (2,1)
  end
  y = x;
end

columnonly([1;2])

columnonly([1,2]) % error: expected size 2x1, got 1x2

function y = defaultscalar(x)
  arguments
    x (1,1) = 4
  end
  y = x;
end

defaultscalar()

defaultscalar(9)

defaultscalar([1,2]) % error: expected size 1x1, got 1x2

function y = twoargs(x, z)
  arguments
    x (1,1)
    z (1,2) = [10,20]
  end
  y = x + z;
end

twoargs(5)

twoargs(5, [1,2])

twoargs([1,2]) % error: x expected size 1x1, got 1x2

twoargs(5, [1;2]) % error: z expected size 1x2, got 2x1

function y = symbolicshape(x)
  arguments
    x (n,1)
  end
  y = x;
end

clear

function y = doubleonly(x)
  arguments
    x double
  end
  y = x;
end

doubleonly(3)

doubleonly([1,2])

doubleonly('abc') % error: expected class double, got char

function y = charonly(x)
  arguments
    x char
  end
  y = x;
end

charonly('abc')

charonly(3) % error: expected class char, got double

function y = cellonly(x)
  arguments
    x cell
  end
  y = x;
end

cellonly({1,2})

cellonly([1,2]) % error: expected class cell, got double

function y = structonly(x)
  arguments
    x struct
  end
  y = x;
end

structonly(struct())

structonly(3) % error: expected class struct, got double

function y = handleonly(f)
  arguments
    f function_handle
  end
  y = f(3);
end

handleonly(@(x) x + 1)

handleonly(3) % error: expected class function_handle, got double

function y = typedrow(x)
  arguments
    x (1,2) double
  end
  y = x;
end

typedrow([1,2])

typedrow([1;2]) % error: expected size 1x2, got 2x1

typedrow({1,2}) % error: expected class double, got cell

function y = class(x)
  arguments
    x single
  end
  y = x;
end

clear

function y = numericonly(x)
  arguments
    x {mustBeNumeric}
  end
  y = x;
end

numericonly(3)

numericonly([1,2])

numericonly('abc') % error: mustBeNumeric

function y = textonly(x)
  arguments
    x {mustBeText}
  end
  y = x;
end

textonly('abc')

textonly(3) % error: mustBeText

function y = scalarvalidated(x)
  arguments
    x {mustBeScalar}
  end
  y = x;
end

scalarvalidated(3)

scalarvalidated([1,2]) % error: mustBeScalar

function y = vectorvalidated(x)
  arguments
    x {mustBeVector}
  end
  y = x;
end

vectorvalidated([1,2])

vectorvalidated([1;2])

vectorvalidated([1,2;3,4]) % error: mustBeVector

function y = scalarorempty(x)
  arguments
    x {mustBeScalarOrEmpty}
  end
  y = x;
end

scalarorempty(3)

scalarorempty([])

scalarorempty([1,2]) % error: mustBeScalarOrEmpty

function y = nonemptyvalidated(x)
  arguments
    x {mustBeNonempty}
  end
  y = x;
end

nonemptyvalidated(3)

nonemptyvalidated([1,2])

nonemptyvalidated([]) % error: mustBeNonempty

function y = positiveinteger(x)
  arguments
    x double {mustBePositive, mustBeInteger}
  end
  y = x;
end

positiveinteger(2)

positiveinteger(-1) % error: mustBePositive

positiveinteger(2.5) % error: mustBeInteger

positiveinteger(1+2i) % error: mustBePositive

function y = nonnegativevalidated(x)
  arguments
    x double {mustBeNonnegative}
  end
  y = x;
end

nonnegativevalidated(0)

nonnegativevalidated(3)

nonnegativevalidated(-1) % error: mustBeNonnegative

function y = finitevalidated(x)
  arguments
    x double {mustBeFinite}
  end
  y = x;
end

finitevalidated(3)

finitevalidated(1/0) % error: mustBeFinite

function y = realonly(x)
  arguments
    x double {mustBeReal}
  end
  y = x;
end

realonly(3)

realonly(1+2i) % error: mustBeReal

function y = combinedvalidation(x)
  arguments
    x (1,2) double {mustBePositive, mustBeInteger}
  end
  y = x;
end

combinedvalidation([1,2])

combinedvalidation([1;2]) % error: expected size 1x2, got 2x1

combinedvalidation({1,2}) % error: expected class double, got cell

combinedvalidation([1,2.5]) % error: mustBeInteger

combinedvalidation([1,-2]) % error: mustBePositive

function y = validator(x)
  arguments
    x {mustBeOdd}
  end
  y = x;
end

clear

function y = unitinterval(x)
  arguments
    x double {mustBeGreaterThanOrEqual(x, 0), mustBeLessThanOrEqual(x, 1)}
  end
  y = x;
end

unitinterval(0)

unitinterval(0.5)

unitinterval(1)

unitinterval([0,0.5,1])

unitinterval(-0.1) % error: mustBeGreaterThanOrEqual

unitinterval(1.1) % error: mustBeLessThanOrEqual

function y = strictpositivebelowten(x)
  arguments
    x double {mustBeGreaterThan(x, 0), mustBeLessThan(x, 10)}
  end
  y = x;
end

strictpositivebelowten(5)

strictpositivebelowten([1,5,9])

strictpositivebelowten(0) % error: mustBeGreaterThan

strictpositivebelowten(10) % error: mustBeLessThan

function y = greaterthanbase(base, x)
  arguments
    base double
    x double {mustBeGreaterThan(x, base)}
  end
  y = x;
end

greaterthanbase(3, 4)

greaterthanbase(3, [4,5,6])

greaterthanbase(3, 3) % error: mustBeGreaterThan

greaterthanbase(3, [4,3,5]) % error: mustBeGreaterThan

function y = boundedbyparams(lo, hi, x)
  arguments
    lo double
    hi double
    x double {mustBeGreaterThanOrEqual(x, lo), mustBeLessThanOrEqual(x, hi)}
  end
  y = x;
end

boundedbyparams(10, 20, 15)

boundedbyparams(10, 20, [10,15,20])

boundedbyparams(10, 20, 9) % error: mustBeGreaterThanOrEqual

boundedbyparams(10, 20, 21) % error: mustBeLessThanOrEqual

function y = comparisonform(x)
  arguments
    x {mustBeGreaterThan(0, x)}
  end
  y = x;
end


clear

function y = ranged(x)
  arguments
    x double {mustBeInRange(x, 0, 1)}
  end
  y = x;
end

ranged(0)

ranged(0.5)

ranged(1)

ranged([0,0.5,1])

ranged(-0.1) % error: mustBeInRange

ranged(1.1) % error: mustBeInRange

function y = rangedbyparams(lo, hi, x)
  arguments
    lo double
    hi double
    x double {mustBeInRange(x, lo, hi)}
  end
  y = x;
end

rangedbyparams(10, 20, 10)

rangedbyparams(10, 20, 15)

rangedbyparams(10, 20, 20)

rangedbyparams(10, 20, [10,15,20])

rangedbyparams(10, 20, 9) % error: mustBeInRange

rangedbyparams(10, 20, 21) % error: mustBeInRange

function y = combinedrange(x)
  arguments
    x (1,3) double {mustBeInteger, mustBeInRange(x, 1, 5)}
  end
  y = x;
end

combinedrange([1,3,5])

combinedrange([1;3;5]) % error: expected size 1x3, got 3x1

combinedrange([1,3,5.5]) % error: mustBeInteger

combinedrange([1,3,6]) % error: mustBeInRange

function y = rangeform(x)
  arguments
    x {mustBeInRange(0, x, 1)}
  end
  y = x;
end

function y = rangeoption(x)
  arguments
    x {mustBeInRange(x, 0, 1, 'exclude-upper')}
  end
  y = x;
end

clear

function y = choose(x)
  arguments
    x double {mustBeMember(x, [1,2,3])}
  end
  y = x;
end

choose(1)

choose(2)

choose(3)

choose([1,3])

choose(4) % error: mustBeMember

choose([1,4]) % error: mustBeMember

function y = choosefrom(allowed, x)
  arguments
    allowed double
    x double {mustBeMember(x, allowed)}
  end
  y = x;
end

choosefrom([10,20], 10)

choosefrom([10,20], 20)

choosefrom([10,20], [10,20])

choosefrom([10,20], 30) % error: mustBeMember

choosefrom([10,20], [10,30]) % error: mustBeMember

function y = combinedmember(x)
  arguments
    x (1,3) double {mustBeInteger, mustBeMember(x, [1,2,3,5,8])}
  end
  y = x;
end

combinedmember([1,3,8])

combinedmember([1;3;8]) % error: expected size 1x3, got 3x1

combinedmember([1,3.5,8]) % error: mustBeInteger

combinedmember([1,4,8]) % error: mustBeMember

function y = memberform(x)
  arguments
    x {mustBeMember([1,2,3], x)}
  end
  y = x;
end


function y = textmember(x)
  arguments
    x char {mustBeMember(x, {'a','b'})}
  end
  y = x;
end

textmember('a') % error: mustBeMember

clear

function [a, b] = checkedpair(x)
  arguments (Output)
    a (1,1) double {mustBePositive}
    b (1,2) double
  end
  a = x;
  b = [x, 3];
end

[a, b] = checkedpair(2)

checkedpair(-1) % erro: a falha em mustBePositive


function [a, b] = skippedoutput(x)
  arguments (Output)
    a double
    b double {mustBePositive}
  end
  a = x;
  b = -1;
end

a = skippedoutput(2)      % OK: somente a foi solicitada
[a, b] = skippedoutput(2) % erro: b foi solicitada e falha em mustBePositive


function [a, b] = missingsecond()
  arguments (Output)
    a double
    b double
  end
  a = 1;
end

a = missingsecond()       % OK: somente a foi solicitada
[a, b] = missingsecond()  % erro: b solicitada mas não atribuída


clear

function [a, b, c] = threeouts(x)
  arguments (Output)
    a (1,1) double
    b (1,2) double
    c (2,1) double
  end
  a = x;
  b = [x, (x + 1)];
  c = [x; (x + 2)];
end

a = threeouts(5)
[a, b] = threeouts(5)
[a, b, c] = threeouts(5)


function [a, b] = badsecondsize(x)
  arguments (Output)
    a double
    b (1,2) double
  end
  a = x;
  b = [x; (x + 1)];
end

a = badsecondsize(4)        % OK: b não foi validada, mas foi calculada sem erro
[a, b] = badsecondsize(4)   % erro esperado: b deveria ser 1x2

clear

function y = countpositive(x, varargin)
  arguments
    x double
  end
  arguments (Repeating)
    value double {mustBePositive}
  end
  y = nargin;
end

countpositive(1)
countpositive(1, 2)
countpositive(1, 2, 3)

countpositive(1, -2)       % erro: value{1} falha em mustBePositive
countpositive(1, 2, -3)    % erro: value{2} falha em mustBePositive
countpositive(1, 'abc')    % erro: value{1} deveria ser double


function y = countrows(varargin)
  arguments (Repeating)
    row (1,2) double
  end
  y = nargin;
end

countrows()
countrows([1,2])
countrows([1,2], [3,4])

countrows([1;2])           % erro: row{1} deveria ser 1x2
countrows([1,2], [3;4])    % erro: row{2} deveria ser 1x2


function y = repeatintegers(varargin)
  arguments (Repeating)
    item double {mustBeInteger, mustBePositive}
  end
  y = nargin;
end

repeatintegers(1, 2, 3)
repeatintegers()
repeatintegers(1, 2.5)     % erro: item{2} falha em mustBeInteger
repeatintegers(1, -2)      % erro: item{2} falha em mustBePositive


function y = repeatwithoutvarargin(x) % erro esperado na definição: arguments (Repeating) requires a varargin parameter
  arguments (Repeating)
    value double
  end
  y = x;
end


function y = repeatmultiple(varargin) % erro esperado na definição: exatamente uma declaração é suportada por enquanto
  arguments (Repeating)
    a double
    b double
  end
  y = nargin;
end

clear

function y = repeatpairs(varargin)
  arguments (Repeating)
    left double {mustBePositive}
    right double {mustBeInteger}
  end
  y = nargin;
end

repeatpairs()
repeatpairs(1, 2)
repeatpairs(1, 2, 3, 4)

repeatpairs(1)             % erro: grupo incompleto
repeatpairs(1, 2, 3)       % erro: grupo incompleto
repeatpairs(-1, 2)         % erro: left{1} falha em mustBePositive
repeatpairs(1, 2, -3, 4)   % erro: left{2} falha em mustBePositive
repeatpairs(1, 2.5)        % erro: right{1} falha em mustBeInteger
repeatpairs(1, 2, 3, 4.5)  % erro: right{2} falha em mustBeInteger


function y = repeatmix(varargin)
  arguments (Repeating)
    name char
    value double {mustBeNonnegative}
  end
  y = nargin;
end

repeatmix()
repeatmix('a', 1)
repeatmix('a', 1, 'b', 2)

repeatmix('a')             % erro: grupo incompleto
repeatmix(1, 2)            % erro: name{1} deveria ser char
repeatmix('a', -1)         % erro: value{1} falha em mustBeNonnegative
repeatmix('a', 1, 'b', -2) % erro: value{2} falha em mustBeNonnegative


function y = repeatrows(varargin)
  arguments (Repeating)
    row (1,2) double
    scale (1,1) double {mustBePositive}
  end
  y = nargin;
end

repeatrows([1,2], 3)
repeatrows([1,2], 3, [4,5], 6)

repeatrows([1;2], 3)       % erro: row{1} deveria ser 1x2
repeatrows([1,2], -3)      % erro: scale{1} falha em mustBePositive
repeatrows([1,2], 3, [4;5], 6) % erro: row{2} deveria ser 1x2

clear

function y = scaleoffset(x, options)
  arguments
    x double
    options.factor double = 1
    options.offset double = 0
  end
  y = x * options.factor + options.offset;
end

scaleoffset(10)
scaleoffset(10, factor=2)
scaleoffset(10, offset=3)
scaleoffset(10, factor=2, offset=3)

scaleoffset(10, unknown=1)          % erro: nome desconhecido
scaleoffset(10, factor=2, factor=3) % erro: nome duplicado
scaleoffset(10, factor=2, 3)        % erro: posicional depois de name-value


function y = bounded(x, options)
  arguments
    x double
    options.factor double {mustBePositive} = 1
  end
  y = x * options.factor;
end

bounded(5)
bounded(5, factor=3)

bounded(5, factor=-1)      % erro: options.factor falha em mustBePositive
bounded(5, factor='abc')   % erro: options.factor deveria ser double


function y = shaped(x, options)
  arguments
    x double
    options.row (1,2) double = [1,2]
    options.scale (1,1) double {mustBePositive} = 1
  end
  y = x * options.scale + options.row(1);
end

shaped(10)
shaped(10, scale=2)
shaped(10, row=[3,4])
shaped(10, row=[3,4], scale=2)

shaped(10, row=[3;4])      % erro: options.row deveria ser 1x2
shaped(10, scale=-2)       % erro: options.scale falha em mustBePositive


function y = textoption(x, options)
  arguments
    x double
    options.mode char = 'add'
  end
  if options.mode == 'add'
    y = x + 1;
  else
    y = x - 1;
  end
end

textoption(10)
textoption(10, mode='sub')

textoption(10, mode=3)     % erro: options.mode deveria ser char


function y = missingdefault(x, options) % erro esperado na definição: options.factor exige valor default
  arguments
    options.factor double
  end
  y = x;
end

clear

function y = scaleoffset(x, options)
  arguments
    x double
    options.factor double = 1
    options.offset double = 0
  end
  y = x * options.factor + options.offset;
end

scaleoffset(10)
scaleoffset(10, factor=2)
scaleoffset(10, offset=3)
scaleoffset(10, factor=2, offset=3)

scaleoffset(10, 'factor', 2)
scaleoffset(10, 'offset', 3)
scaleoffset(10, 'factor', 2, 'offset', 3)
scaleoffset(10, 'factor', 2, offset=3)

scaleoffset(10, 'factor')             % erro: valor faltante
scaleoffset(10, 'factor', 2, factor=3)% erro: nome duplicado
scaleoffset(10, factor=2, 'offset', 3)% erro: posicional depois de name-value
scaleoffset(10, 'unknown', 1)         % erro: nome desconhecido


function y = bounded(x, options)
  arguments
    x double
    options.factor double {mustBePositive} = 1
    options.offset double {mustBeNonnegative} = 0
  end
  y = x * options.factor + options.offset;
end

bounded(5)
bounded(5, 'factor', 3)
bounded(5, 'offset', 2)
bounded(5, 'factor', 3, 'offset', 2)

bounded(5, 'factor', -1)    % erro: options.factor falha em mustBePositive
bounded(5, 'offset', -2)    % erro: options.offset falha em mustBeNonnegative
bounded(5, 'factor', 'abc') % erro: options.factor deveria ser double


function y = shaped(x, options)
  arguments
    x double
    options.row (1,2) double = [1,2]
    options.scale (1,1) double {mustBePositive} = 1
  end
  y = x * options.scale + options.row(1);
end

shaped(10)
shaped(10, 'scale', 2)
shaped(10, 'row', [3,4])
shaped(10, 'row', [3,4], 'scale', 2)

shaped(10, 'row', [3;4])    % erro: options.row deveria ser 1x2
shaped(10, 'scale', -2)     % erro: options.scale falha em mustBePositive

clear

function y = scaleoffset(x, options)
  arguments
    x double
    options.factor double = 1
    options.offset double = 0
  end
  y = x * options.factor + options.offset;
end

scaleoffset(10)
scaleoffset(10, "factor", 2)
scaleoffset(10, "offset", 3)
scaleoffset(10, "factor", 2, "offset", 3)
scaleoffset(10, "factor", 2, offset=3)

scaleoffset(10, "factor")             % erro: valor faltante
scaleoffset(10, "unknown", 1)         % erro: nome desconhecido
scaleoffset(10, "factor", 2, factor=3)% erro: nome duplicado
scaleoffset(10, "factor", 2, 3)       % erro: posicional depois de name-value


function y = bounded(x, options)
  arguments
    x double
    options.factor double {mustBePositive} = 1
    options.offset double {mustBeNonnegative} = 0
  end
  y = x * options.factor + options.offset;
end

bounded(5)
bounded(5, "factor", 3)
bounded(5, "offset", 2)
bounded(5, "factor", 3, "offset", 2)

bounded(5, "factor", -1)    % erro: options.factor falha em mustBePositive
bounded(5, "offset", -2)    % erro: options.offset falha em mustBeNonnegative
bounded(5, "factor", "abc") % erro: options.factor deveria ser double


function y = shaped(x, options)
  arguments
    x double
    options.row (1,2) double = [1,2]
    options.scale (1,1) double {mustBePositive} = 1
  end
  y = x * options.scale + options.row(1);
end

shaped(10)
shaped(10, "scale", 2)
shaped(10, "row", [3,4])
shaped(10, "row", [3,4], "scale", 2)

shaped(10, "row", [3;4])    % erro: options.row deveria ser 1x2
shaped(10, "scale", -2)     % erro: options.scale falha em mustBePositive

clear

function y = scaleoffset(x, options)
  arguments
    x double
    options.factor double = 1
    options.offset double = 0
  end
  y = x * options.factor + options.offset;
end

scaleoffset(10)
scaleoffset(10, factor=2)
scaleoffset(10, fac=2)
scaleoffset(10, f=2)

scaleoffset(10, offset=3)
scaleoffset(10, off=3)
scaleoffset(10, o=3)

scaleoffset(10, fac=2, off=3)
scaleoffset(10, "fac", 2, "off", 3)
scaleoffset(10, 'fac', 2, 'off', 3)

scaleoffset(10, fac=2, factor=3)  % erro: factor duplicado
scaleoffset(10, "off", 3, offset=4) % erro: offset duplicado
scaleoffset(10, unknown=1)        % erro: nome desconhecido
scaleoffset(10, "unknown", 1)     % erro: nome desconhecido


function y = twofa(x, options)
  arguments
    x double
    options.factor double = 1
    options.fade double = 0
  end
  y = x * options.factor + options.fade;
end

twofa(10)
twofa(10, factor=2)
twofa(10, fact=2)
twofa(10, fade=3)
twofa(10, fad=3)

twofa(10, fa=2)       % erro: abreviação ambígua entre factor e fade
twofa(10, "fa", 2)    % erro: abreviação ambígua entre factor e fade
twofa(10, 'fa', 2)    % erro: abreviação ambígua entre factor e fade


function y = validateabbr(x, options)
  arguments
    x double
    options.scale double {mustBePositive} = 1
    options.shift double {mustBeNonnegative} = 0
  end
  y = x * options.scale + options.shift;
end

validateabbr(5)
validateabbr(5, sc=3)
validateabbr(5, sh=2)
validateabbr(5, sc=3, sh=2)

validateabbr(5, sc=-1)   % erro: options.scale falha em mustBePositive
validateabbr(5, sh=-2)   % erro: options.shift falha em mustBeNonnegative
validateabbr(5, s=2)     % erro: ambíguo entre scale e shift

clear

function y = scaleoffset(x, options)
  arguments
    x double
    options.factor double = 1
    options.offset double = 0
  end
  y = x * options.factor + options.offset;
end

scaleoffset(10)
scaleoffset(10, Factor=2)
scaleoffset(10, FACTOR=2)
scaleoffset(10, fac=2)
scaleoffset(10, FAC=2)

scaleoffset(10, Offset=3)
scaleoffset(10, OFFSET=3)
scaleoffset(10, off=3)
scaleoffset(10, OFF=3)

scaleoffset(10, Factor=2, Offset=3)
scaleoffset(10, "Factor", 2, "Offset", 3)
scaleoffset(10, "FAC", 2, "OFF", 3)
scaleoffset(10, 'Fac', 2, 'Off', 3)

scaleoffset(10, Factor=2, factor=3)  % OK: último valor vence
scaleoffset(10, fac=2, FACTOR=3)     % OK: último valor vence
scaleoffset(10, "FAC", 2, factor=3)  % OK: último valor vence


function y = twofa(x, options)
  arguments
    x double
    options.factor double = 1
    options.fade double = 0
  end
  y = x * options.factor + options.fade;
end

twofa(10)
twofa(10, Factor=2)
twofa(10, FACT=2)
twofa(10, Fade=3)
twofa(10, FAD=3)

twofa(10, fa=2)      % erro: ambíguo entre factor e fade
twofa(10, FA=2)      % erro: ambíguo entre factor e fade
twofa(10, "FA", 2)   % erro: ambíguo entre factor e fade
twofa(10, 'Fa', 2)   % erro: ambíguo entre factor e fade


function y = validatecase(x, options)
  arguments
    x double
    options.scale double {mustBePositive} = 1
    options.shift double {mustBeNonnegative} = 0
  end
  y = x * options.scale + options.shift;
end

validatecase(5)
validatecase(5, Scale=3)
validatecase(5, SHIFT=2)
validatecase(5, SC=3, SH=2)

validatecase(5, SCALE=-1)  % erro: options.scale falha em mustBePositive
validatecase(5, shift=-2)  % erro: options.shift falha em mustBeNonnegative
validatecase(5, S=2)       % erro: ambíguo entre scale e shift

clear

function y = scaleoffset(x, options)
  arguments
    x double
    options.factor double = 1
    options.offset double = 0
  end
  y = x * options.factor + options.offset;
end

scaleoffset(10)
scaleoffset(10, Factor=2)
scaleoffset(10, FACTOR=2)
scaleoffset(10, "OFF", 3)
scaleoffset(10, 'Fac', 2)
scaleoffset(10, Factor=2, offset=3)

scaleoffset(10, factor=2, factor=3)   % OK: último vence
scaleoffset(10, "Factor", 2, factor=3)% OK: último vence


function y = ambiguous(x, options)
  arguments
    x double
    options.factor double = 1
    options.fade double = 0
  end
  y = x * options.factor + options.fade;
end

ambiguous(10, fact=2)
ambiguous(10, FAD=3)

ambiguous(10, fa=2)       % erro: ambíguo
ambiguous(10, "FA", 2)    % erro: ambíguo


function y = validnv(x, options)
  arguments
    x double
    options.scale double {mustBePositive} = 1
    options.shift double {mustBeNonnegative} = 0
  end
  y = x * options.scale + options.shift;
end

validnv(5)
validnv(5, Scale=3)
validnv(5, "SHIFT", 2)
validnv(5, sc=3, sh=2)

validnv(5, SCALE=-1)      % erro: mustBePositive
validnv(5, shift=-2)      % erro: mustBeNonnegative
validnv(5, S=2)           % erro: ambíguo
