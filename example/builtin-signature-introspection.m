% Built-in Signature Introspection

clear

nargin("sin")
nargout("sin")

nargin("plus")
nargout("plus")

nargin("uminus")
nargout("uminus")

nargin("feval")
nargout("feval")

nargin("eval")
nargout("eval")

nargin("evalin")
nargout("evalin")

nargin("assignin")
nargout("assignin")

nargin("dbstack")
nargout("dbstack")

nargin("exist")
nargout("exist")

nargin("which")
nargout("which")

nargin("class")
nargout("class")

nargin("isa")
nargout("isa")

nargin("func2str")
nargout("func2str")

nargin("str2func")
nargout("str2func")

nargin("functions")
nargout("functions")

nargin("localfunctions")
nargout("localfunctions")

nargin("nargin")
nargout("nargin")

nargin("nargout")
nargout("nargout")

nargin("inputname")
nargout("inputname")

nargin("narginchk")
nargout("narginchk")

nargin("nargoutchk")
nargout("nargoutchk")

function y = builtinmetauser(x, varargin)
  y = nargin("feval") + nargout("feval") + nargin("evalin");
end

builtinmetauser(1, 2, 3)

nargin("missingBuiltinSignature")  % erro esperado: função inexistente
