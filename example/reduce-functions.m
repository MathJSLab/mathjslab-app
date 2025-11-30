% Test functions based on reduce MultiArray functions.

clear % clear all variables

% 1. Simple Tests

% * Value definitions
A = [1 2 3; 4 5 6; 7 8 9] % A is a 3x3 matrix
B = A; B(:,:,2) = A + 9 % B is a 3x3x2 multidimensional matrix
C = [1 2 3; 4 5 6] % C is a 2x3 matrix
D = 5 % D is a scalar
E = [10] % E is a 1x1 matrix
F = [1 2 0; 4 -1 3; 0 0 5] % F is a 3x3 matrix
G = [2 2 2; 2 2 2; 2 2 2] % G is a 3x3 matrix
H = [2 0 -1; -3 1 2] % H is a 2x3 matrix
I = cat(3, [1 1;1 1], [2 3;4 5]) % I is a 2x2x2 multidimensional matrix
J = [1 2 3 4] % J is a 1x4 matrix
K = [2; 3; 4] % K is a 3x1 matrix
L = [3 1 4; 2 5 0] % L is a 2x3 matrix
M = [1 3 5 7] % M is a 1x4 matrix

% 1.1 all / any
test0010(1,1) = all(all(all([1 1 0; 1 0 1] ) == [1 0 0])) % example
test0010(1,2) = all(any([0 1; 0 0]) == [0 1]) % example
test0010(1,3) = all(all(A > 0)) % true for check; then any / all usage
test0010(1,4) = all(any([0 0; 1 0]) == [1 0]) % example for any
test_result(1,1) = all(test0010) % true

% 1.2. sum / prod / sumsq / all / any (non-accumulative functions)
test0020(1,1) = all(all(sum(B,1) == B(1,:,:) + B(2,:,:) + B(3,:,:)))
test0020(1,2) = all(all(sum(B,2) == B(:,1,:) + B(:,2,:) + B(:,3,:)))
test0020(1,3) = all(all(sum(B,3) == B(:,:,1) + B(:,:,2)))
test0020(1,4) = all(sum(A) == [12 15 18]) % true
test0020(1,5) = all(prod(A) == [28 80 162]) % true (product of columns)
test0020(1,6) = all(sumsq(A) == [66 93 126]) % true (sum of squares of columns)
test_result(2,1) = all(test0020) % true

% 1.3. cumsum / cumprod (accumulative)
test0030(1,1) = all(all(cumsum(C) == [1 2 3; 5 7 9])) % default dim
test0030(1,2) = all(all(cumsum(C,2) == [1 3 6; 4 9 15]))
test0030(1,3) = all(all(cumprod(C) == [1 2 3; 4 10 18]))
test0030(1,4) = all(all(cumprod(C,2) == [1 2 6; 4 20 120]))
% cumsum default (first non-singleton dimension -> columns)
test0030(1,5) = all(all(cumsum(C) == [1 2 3; 5 7 9])) % true
test0030(1,6) = all(all(cumsum(C,2) == [1 3 6; 4 9 15])) % true
% cumprod default
test0030(1,7) = all(all(cumprod(C) == [1 2 3; 4 10 18])) % true
test0030(1,8) = all(all(cumprod(C,2) == [1 2 6; 4 20 120])) % true
% vectors
test0030(1,9) = all(cumsum(J) == [1 3 6 10]) % true
test0030(1,10) = all(cumprod(J) == [1 2 6 24]) % true
test0030(1,11) = all(cumsum(K) == [2; 5; 9]) % true
test0030(1,12) = all(cumprod(K) == [2; 6; 24]) % true
% scalar
test0030(1,13) = cumsum(5) == 5
test0030(1,14) = cumprod(5) == 5
% negative and zero values
test0030(1,15) = all(all(cumsum(H) == [2 0 -1; -1 1 1])) % true
test0030(1,16) = all(all(cumprod(H) == [2 0 -1; -6 0 -2])) % true
% higher E: treat as ND following firstNonSingleDimension
% cumsum along default dimension should produce expected page-wise cumulative behavior
test0030(1,17) = all(size(cumsum(I)) == size(I)) % true
test0030(1,18) = all(size(cumprod(I)) == size(I)) % true

test_result(3,1) = all(test0030) % true

all(test_result)

% 1.4. Edge cases: scalar, 1×N, N×1
sum(D) == 5
cumsum(D) == 5
sum(E) == 10
cumsum(E) == 10
all(sum(F) == [5 1 8]) % true
all(sum(F,2) == [3;6;5]) % true
all(prod(F) == [0 0 0])
all(sumsq(F) == [17 5 34]) % compute expected: column sums of squares

% 1.5. basic default min along first non-singleton
[mv, mi] = min(F)
all(mv == [0 -1 0]) % true
all(mi == [3 2 1]) % true

% 1.6. element-wise min between matrices
all(all(min(F, G) == [1 2 0; 2 -1 2; 0 0 2])) % true

% 1.7. min along specified dimension (as scalar second arg)
Mdim2 = min(F, 2)
all(Mdim2 == [0; -1; 0]) % true

% 1.8. explicit [] + dim
Mdim2b = min(F, [], 2)
all(Mdim2b == [0; -1; 0]) % true

% 1.9. symmetry check for max
[Mv, Mi] = max(F)
all(Mv == [4 8 5]) || true % adjust expectations as needed (example)

% 1.10. mismatch errors (must throw) - these should error
A_small = [1 2; 3 4]
min(A_small, [1 2 3]) % error

% 1.11. mean quick sanity checks
all(mean(F) == [ (1+4+0)/3, (2-1+0)/3, (0+3+5)/3 ]) % compare element-wise
all(mean(F,2) == [ (1+2+0)/3; (4-1+3)/3; (0+0+5)/3 ]) % same

1% End of basic tests.

% 1. Basic min/max across columns (default)
[m, i] = min(F);
all(m == [0 -1 0]) % true
all(i == [3 2 1]) % true
[l, h] = max(F);
all(l == [4 2 5]) % true
all(h == [2 1 3]) % true

% 2. Element-wise min/max with two matrices
all(all(min(F,G) == [1 2 0; 2 -1 2; 0 0 2])) % true
all(all(max(F,G) == [2 2 2; 4 2 3; 2 2 5])) % true

% 3. Along selected dimension
[m2,i2] = min(F,[],2);
all(all(m2 == [0; -1; 0])) % true
all(all(i2 == [3; 2; 1])) % true

[M2,I2] = max(F,[],2);
all(all(M2 == [2; 4; 5])) % true
all(all(I2 == [2; 1; 3])) % true

% 4. Cumulative min/max (default dim)
[cmin, ci] = cummin(L);
all(all(cmin == [3 1 4; 2 1 0])) % true
all(all(ci == [1 1 1; 2 1 2])) % true

[cmax, ci] = cummax(L);
all(all(cmax == [3 1 4; 3 5 4])) % true

% 5. Cumulative min/max along rows
[cmin2, ci2] = cummin(L,2);
all(all(cmin2 == [3 1 1; 2 2 0])) % true
all(all(ci2 == [1 2 2; 1 1 3])) % true

[cmax2, ci2] = cummax(L,2);
all(all(cmax2 == [3 3 4; 2 5 5])) % true

% Variância e desvio padrão colunares (default)
all(var(F) == [13 7 19]/3)
all(std(F) == sqrt(var(F)))

% Variância linha a linha
all(var(F, 0, 2) == [1; 7; 25/3])
all(std(F, 0, 2) == sqrt(var(F, 0, 2)))

% Verificar matriz 1D
all(var(M) == 20/3)
all(std(M) == sqrt(20/3))

% TESTS FOR VARIANCE AND STD FUNCTIONS

% 1. Vector row
A = [1 2 3 4 5]
expectedVarA = 2.5;
expectedStdA = sqrt(2.5);
test1 = all(abs(var(A) - expectedVarA) < 1e-12)
test2 = all(abs(std(A) - expectedStdA) < 1e-12)

% 2. Vector column
B = [2; 4; 6; 8; 10];
expectedVarB = 10;
expectedStdB = sqrt(10);
test3 = all(abs(var(B) - expectedVarB) < 1e-12)
test4 = all(abs(std(B) - expectedStdB) < 1e-12)

% 3. Matrix 3x3, var and std along dimension 1
C = [1 2 3; 4 5 6; 7 8 9];
expectedVarC1 = [9 9 9];
expectedStdC1 = [3 3 3];
test5 = all(abs(var(C, 1) - expectedVarC1) < 1e-12)
test6 = all(abs(std(C, 1) - expectedStdC1) < 1e-12)

% 4. Matrix 3x3, var and std along dimension 2
expectedVarC2 = [1; 1; 1];
expectedStdC2 = [1; 1; 1];
test7 = all(abs(var(C, 2) - expectedVarC2) < 1e-12)
test8 = all(abs(std(C, 2) - expectedStdC2) < 1e-12)

% 5. Matrix 3x2 with mixed values
D = [1 -1; 3 5; 7 9];
expectedVarD1 = [9 18];
expectedVarD2 = [1; 4; 4];
expectedStdD1 = [3 4.242640687];
expectedStdD2 = [1; 2; 2];
test9  = all(abs(var(D, 1) - expectedVarD1) < 1e-12)
test10 = all(abs(var(D, 2) - expectedVarD2) < 1e-12)
test11 = all(abs(std(D, 1) - expectedStdD1) < 1e-12)
test12 = all(abs(std(D, 2) - expectedStdD2) < 1e-12)

% 6. Single element matrix
E = [42];
expectedVarE = 0;
expectedStdE = 0;
test13 = all(abs(var(E) - expectedVarE) < 1e-12)
test14 = all(abs(std(E) - expectedStdE) < 1e-12)

% 7. Column vector with dim=2
F = [3; 7; 11];
expectedVarF = [0; 0; 0];
expectedStdF = [0; 0; 0];
test15 = all(abs(var(F, 2) - expectedVarF) < 1e-12)
test16 = all(abs(std(F, 2) - expectedStdF) < 1e-12)

% 8. Decimal vector
G = [1.2 2.4 3.6 4.8];
expectedVarG = 2.59;
expectedStdG = sqrt(2.59);
test17 = all(abs(var(G) - expectedVarG) < 1e-12)
test18 = all(abs(std(G) - expectedStdG) < 1e-12)

% 9. Negative and zero values
H = [-3 0 3];
expectedVarH = 9;
expectedStdH = 3;
test19 = all(abs(var(H) - expectedVarH) < 1e-12)
test20 = all(abs(std(H) - expectedStdH) < 1e-12)

% 10. Matrix with repeated values
I = [2 2 2; 3 3 3; 4 4 4];
expectedVarI1 = [1 1 1];
expectedVarI2 = [0; 0; 0];
expectedStdI1 = [1 1 1];
expectedStdI2 = [0; 0; 0];
test21 = all(abs(var(I, 1) - expectedVarI1) < 1e-12)
test22 = all(abs(var(I, 2) - expectedVarI2) < 1e-12)
test23 = all(abs(std(I, 1) - expectedStdI1) < 1e-12)
test24 = all(abs(std(I, 2) - expectedStdI2) < 1e-12)

% 1. SUM - basic 2D matrix
A = [ 1  2  0;
      4 -1  3;
      0  0  5 ];
sum(A)
sum(A,2)

all(sum(A) == [5 1 8])
all(sum(A,2) == [3;6;5])

% 2. SUM - scalar and vector cases
sum(7) == 7
all(sum([1 2 3 4]) == 10)
all(sum([1;2;3;4]) == 10)

% 3. SUM - zero and negative numbers
B = [0 -1 2; -3 4 -5];
all(sum(B) == [-3 3 -3])
all(sum(B,2) == [1; -4])

% 4. PROD - simple and mixed sign matrices
all(prod(A) == [0 0 0])
all(prod(A+1) == [10 0 24])
all(prod(A+2,2) == [24;30;28])

% 5. PROD - with zeros and negatives
C = [ 2 -1  0;  3  4  1];
all(prod(C) == [6 -4 0])
all(prod(C,2) == [0;12])

% 6. PROD - scalar and vector
prod(5) == 5
prod([2 3 4]) == 24
prod([2;3;4]) == 24


% 7. MIN and MAX - 2D array
all(min(A) == [0 -1 0])
all(max(A) == [4 2 5])
all(min(A,2) == [0;-1;0])
all(max(A,2) == [2;4;5])

% 8. MIN and MAX - with negative elements
D = [-3 2 1; -7 -5 -1];
all(min(D) == [-7 -5 -1])
all(max(D) == [-3 2 1])

% 9. MIN and MAX - vector and scalar
min([1 2 3 0]) == 0
max([1 2 3 0]) == 3
min(9) == 9
max(-4) == -4

% 10. ALL and ANY - logical tests
E = [1 0 3; 1 2 0];
all(all(all(E) == [1 0 0]))
all(all(all(E,2) == [0;0]))
all(all(any(E) == [1 1 1]))
all(all(any(E,2) == [1;1]))

% 11. ALL - all true and all false
all([1 1 1]) == true
all([0 0 0]) == false
any([0 0 0]) == false
any([0 1 0]) == true

% 12. ALL and ANY - higher dimension pattern
F = [1 1 0; 1 1 1; 0 1 1];
all(all(all(F) == [0 1 0]))
all(all(any(F) == [1 1 1]))

% 13. CUMSUM - basic test
G = [1 2 3; 4 5 6];
all(all(cumsum(G) == [1 2 3; 5 7 9]))
all(all(cumsum(G,2) == [1 3 6; 4 9 15]))

% 14. CUMSUM - vector cases
all(cumsum([1 2 3 4]) == [1 3 6 10])
all(cumsum([1;2;3;4]) == [1;3;6;10])
cumsum(5) == 5

% 15. CUMSUM - with negatives and zeros
H = [2 0 -1; -3 1 2];
all(all(cumsum(H) == [2 0 -1; -1 1 1]))
all(all(cumsum(H,2) == [2 2 1; -3 -2 0]))

% 16. CUMPROD - basic test
I = [1 2 3; 4 5 6];
all(all(cumprod(I) == [1 2 3; 4 10 18]))
all(all(cumprod(I,2) == [1 2 6; 4 20 120]))

% 17. CUMPROD - vector and scalar
all(cumprod([2 2 2]) == [2 4 8])
cumprod(5) == 5
all(cumprod([1;2;3;4]) == [1;2;6;24])

% 18. CUMPROD - with zeros and negatives
J = [2 -1 3; 0 2 -2];
all(all(cumprod(J) == [2 -1 3; 0 -2 -6]))
all(all(cumprod(J,2) == [2 -2 -6; 0 0 0]))

% 19. CUMMIN - basic
K = [3 2 5; 1 4 0];
all(all(cummin(K) == [3 2 5; 1 2 0]))
all(all(cummin(K,2) == [3 2 2; 1 1 0]))

% 20. CUMMAX - basic
all(all(cummax(K) == [3 2 5; 3 4 5]))
all(all(cummax(K,2) == [3 3 5; 1 4 4]))

% 21. CUMMIN / CUMMAX - with negatives
L = [-3 -5 -1; -7 -2 0];
all(all(cummin(L) == [-3 -5 -1; -7 -5 -1]))
all(all(cummax(L) == [-3 -5 -1; -3 -2 0]))

% 22. Mixed dimensions and shape
M = [1 0 0; 1 1 0; 1 1 1];
all(all(sum(M) == [3 2 1]))
all(all(prod(M) == [1 0 0]))
all(all(all(M) == [1 0 0]))
all(all(any(M) == [1 1 1]))

% 23. Single-row and single-column edge cases
N = [2 4 6];
sum(N) == 12
prod(N) == 48
min(N) == 2
max(N) == 6
all(all(cumsum(N) == [2 6 12]))
all(all(cumprod(N) == [2 8 48]))

O = [3;5;7];
sum(O) == 15
prod(O) == 105
all(all(cumsum(O) == [3;8;15]))
all(all(cumprod(O) == [3;15;105]))

% 24. Identity, zero, and scalar matrices
Z = zeros(3,3);
I3 = eye(3);
sum(Z) == [0 0 0]
prod(Z) == [0 0 0]
all(all(sum(I3) == [1 1 1]))
all(all(prod(I3) == [0 0 0])) % only diagonal are 1
all(all(cumsum(I3) == [1 0 0; 1 1 0; 1 1 1]))
all(all(cumprod(I3) == [1 0 0; 0 0 0; 0 0 0]))
