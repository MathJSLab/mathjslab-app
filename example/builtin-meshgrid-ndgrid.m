clear

% aridade e metadados
nargin("meshgrid")
nargout("meshgrid")
nargin("ndgrid")
nargout("ndgrid")

% meshgrid 2-D basico
[X, Y] = meshgrid(1:3, 4:5)
X
Y

% meshgrid com um unico vetor
[A, B] = meshgrid(1:3)
A
B

% meshgrid 3-D
[X3, Y3, Z3] = meshgrid(1:2, 3:4, 5:6)
size(X3)
size(Y3)
size(Z3)

% ndgrid 2-D
[N1, N2] = ndgrid(1:2, 3:4)
N1
N2

% ndgrid com um unico vetor e duas saidas
[U, V] = ndgrid(1:3)
U
V

% ndgrid 3-D
[A3, B3, C3] = ndgrid(1:2, 3:4, 5:6)
size(A3)
size(B3)
size(C3)

meshgrid() % error
meshgrid(1, 2, 3, 4) % error
ndgrid() % error
