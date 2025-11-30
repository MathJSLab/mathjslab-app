clear
% Broadcasting rules for 2D arrays.
A = [1,2;3,4;5,6;7,8] % A matrix.
B = [1,2] % A row vector.
C = [1;2;3;4] % A column vector.
D = A+1 % One input is a scalar. Result is a matrix.
A+D % Two inputs which are exactly the same size.
A+B % One input is a matrix, and the other is a row vector.
A+C % One input is a matrix, and the other is a column vector.
B+C % One input is a row vector, and the other is a column vector.
E = [A,C] % A 4x3 matrix.
E+A % error: Incompatible sizes.
E+B % error: Incompatible sizes.
E+C % Compatible sizes. Two inputs which are exactly the same size.
% Broadcasting rules for multidimensional arrays.
A = [1,2,3;4,5,6;7,8,9;10,11,12]
A(:,:,2) = A(:,:,1) + 3
A(:,:,3) = A(:,:,1) + 5
A(:,:,4) = A(:,:,1) + 7
A(:,:,5) = A(:,:,1) + 9
A(:,:,:,2) = A(:,:,:,1) * 4
A
B = A(:,:,3:end,1)
A+B % error
B = A(:,:,1,1)
A+B
B = A(:,2,1,1)
A+B
B = A(2,:,1,1)
A+B
B = A(2,:,:,:)
A+B
B = A(:,2,:,:)
A+B
B = A(:,:,2,:)
A+B
B = A(:,:,:,2)
A+B
% multidimensional broadcasting
A = [1,2,3,4;5,6,7,8;9,10,11,12;13,14,15,16;17,18,19,20]
B = A + 20
B(:,:,2) = A + 40
A + B
A + B(1,:,:)
A + B(:,1,:)
A + B(:,:,1)
A + B(1,1,:)
A + B(1,:,1)
A + B(1,1,1)
C = B + 40
C(:,:,:,2) = B + 80
C(:,:,:,3) = B + 120
C = C - 60
size(C)
D = C + C(1,:,:,:)
E = C + C(:,1,:,:)
F = C + C(:,:,1,:)
G = C + C(:,:,:,1)
H = C(1,:,:,:) + C(1,:,:,:)
K = C(1,:,:,:) + C(:,1,:,:)
L = C(1,:,:,:) + C(:,:,1,:)
M = C(1,:,:,:) + C(:,:,:,1)
N = C(:,1,:,:) + C(1,:,:,:)
O = C(:,1,:,:) + C(:,1,:,:)
P = C(:,1,:,:) + C(:,:,1,:)
Q = C(:,1,:,:) + C(:,:,:,1)
R = C(:,:,1,:) + C(1,:,:,:)
S = C(:,:,1,:) + C(:,1,:,:)
T = C(:,:,1,:) + C(:,:,1,:)
U = C(:,:,1,:) + C(:,:,:,1)
V = C(:,:,:,1) + C(1,:,:,:)
W = C(:,:,:,1) + C(:,1,:,:)
X = C(:,:,:,1) + C(:,:,1,:)
Y = C(:,:,:,1) + C(:,:,:,1)
C(1,:,1,:) + C(:,1:2,2,2) % error
C + C(:,1,1,1:2) % error

% 1. Basic tests - 1d vectors of the same size.

A = [4 -1 2];
B = [2 -2 -1];

R1 = A + B
R1 == [6 -3 1]

R2 = A - B
R2 == [2 1 3]

R3 = A .* B
R3 == [8 2 -2]

R4 = A ./ B
R4 == [2 0.5 -2]


% 2. Complex numbers.

A = [1+i, 2-3i, -4+i];
B = [2-i, 0+4i, -3-2i];

R = A .* B
[(1+i)*(2-i), (2-3i)*(4i), (-4+i)*(-3-2i)]
R == [(1+i)*(2-i), (2-3i)*(4i), (-4+i)*(-3-2i)]

R = A + B
R == [(1+i)+(2-i), (2-3i)+(4i), (-4+i)+(-3-2i)]


% 3. 2D matrices - without broadcasting.

A = [1 2; 3 4];
B = [5 6; 7 8];

R = A + B
R == [6 8; 10 12]

R = A .* B
R == [5 12; 21 32]


% 4. Line broadcasting (dimension 1).

A = [1; 2; 3];      % 3x1
B = [10 20 30];     % 1x3

R = A + B
R == [11 21 31; 12 22 32; 13 23 33]

R = A .* B
R == [10 20 30; 20 40 60; 30 60 90]

R = B ./ A
R == [10 20 30; 5 10 15; 10/3 20/3 10]


% 5. Broadcasting between scalar and array.

A = [1 2; 3 4];
B = 10;

R = A + B
R == [11 12; 13 14]

R = B .* A
R == [10 20; 30 40]


% 6. Broadcasting between scalar and array.

A = cat(3, [1 2; 3 4], [5 6; 7 8]);
B = [10 20; 30 40];

R = A + B
expected = cat(3, [11 22; 33 44], [15 26; 37 48]);
R == expected

R = A .* 2
expected = cat(3, [2 4; 6 8], [10 12; 14 16]);
R == expected


% 7. Broadcasting between scalar and array.

A = rand(2,3,4);
B = [1 10 100];   % 1x3x1 (broadcast in dimensions 1 and 3)

R = A .* B;
% Result must be equal to manual multiplication
expected = zeros(2,3,4);
expected(:,1,:) = A(:,1,:) * 1;
expected(:,2,:) = A(:,2,:) * 10;
expected(:,3,:) = A(:,3,:) * 100;

R == expected


% 8. Line/Column and complex vectors.

A = [1+i; 2+2i; 3+3i];   % 3x1
B = [1-i, 2-i, 3-i];     % 1x3

R = A .* B               % 3x3
expected = (A * ones(1,3)) .* (ones(3,1) * B);
R == expected


% 9. Broadcasting with 3D and line vector.

A = cat(3, [1 2;3 4], [5 6;7 8]);   % 2x2x2
B = [10 20];                        % 1x2

R = A + B;
expected = cat(3, [11 22;13 24], [15 26;17 28]);
R == expected

R = A .* B;
expected = cat(3, [10 40;30 80], [50 120;70 160]);
R == expected


% 10. Broadcasting with 3D and column vector.

A = cat(3, [1 2 3;4 5 6], [7 8 9;10 11 12]); % 2x3x2
B = [10;100];  % 2x1

R = A + B;
expected = cat(3, [11 12 13;104 105 106], [17 18 19;110 111 112]);
R == expected

R = A .* B;
expected = cat(3, [10 20 30;400 500 600], [70 80 90;1000 1100 1200]);
R == expected


% 11. Broadcasting between scalar and 3D.

A = cat(3, [1 2;3 4], [5 6;7 8]);
B = 10;

R = A + B;
expected = cat(3, [11 12;13 14], [15 16;17 18]);
R == expected

R = B .* A;
expected = cat(3, [10 20;30 40], [50 60;70 80]);
R == expected


% 12. Broadcasting between 2D and 3D with partial coincidence.

A = [1 2;3 4];                 % 2x2
B = cat(3, [10 20;30 40], [50 60;70 80]);  % 2x2x2

R = A + B;
expected = cat(3, [11 22;33 44], [51 62;73 84]);
R == expected

R = A .* B;
expected = cat(3, [10 40;90 160], [50 120;210 320]);
R == expected


% 13. Broadcasting between 1x1x3 and 2x2x3.

A = cat(3, 1, 2, 3);   % 1x1x3
B = cat(3, [10 20;30 40], [50 60;70 80], [90 100;110 120]);  % 2x2x3

R = A .* B;
expected = cat(3, [10 20;30 40], [100 120;140 160], [270 300;330 360]);
R == expected

R = A + B;
expected = cat(3, [11 21;31 41], [52 62;72 82], [93 103;113 123]);
R == expected


% 14. Broadcasting 4D with line vector.

A = rand(2,3,2,2);
B = [10 100 1000];   % 1x3x1x1

R = A .* B;
expected = zeros(2,3,2,2);
expected(:,1,:,:) = A(:,1,:,:) * 10;
expected(:,2,:,:) = A(:,2,:,:) * 100;
expected(:,3,:,:) = A(:,3,:,:) * 1000;
R == expected


% 15. Broadcasting 4D with column vector.

A = rand(3,2,2,2);
B = [10;100;1000];  % 3x1

R = A .* B;
expected = zeros(3,2,2,2);
expected(1,:,:,:) = A(1,:,:,:) * 10;
expected(2,:,:,:) = A(2,:,:,:) * 100;
expected(3,:,:,:) = A(3,:,:,:) * 1000;
R == expected


% 16. Broadcasting 4D and complex scalar.

A = rand(2,2,2,2) + i*rand(2,2,2,2);
B = 2 - 3i;

R = A .* B;
expected = (2 - 3i) * A;
R == expected


% 17. Broadcasting 4D with 2D mixing.

A = rand(2,3,2,2);
B = [1 2 3;4 5 6];   % 2x3

R = A + B;
expected = zeros(2,3,2,2);
expected(:,:,1,1) = A(:,:,1,1) + B;
expected(:,:,2,1) = A(:,:,2,1) + B;
expected(:,:,1,2) = A(:,:,1,2) + B;
expected(:,:,2,2) = A(:,:,2,2) + B;
R == expected


% 18. Broadcasting with vectors and complex conjugates.

A = [1+i; 2-2i; 3+3i];     % 3x1
B = [4-4i, 5+5i];          % 1x2

R = A .* conj(B);
expected = (A * ones(1,2)) .* conj(ones(3,1) * B);
R == expected


% 19. Chaining of operations.

A = [1 2;3 4];
B = [5 6;7 8];
C = [9 10;11 12];

R = (A + B) .* C - A;
expected = ([6 8;10 12] .* [9 10;11 12]) - [1 2;3 4];
R == expected


% % % 20. Broadcasting with 4D of non-trivial sizes.
%
% A = rand(2,1,3,1);
% B = rand(1,4,1,2);

% R = A + B;
% expected = zeros(2,4,3,2);
% for i = 1:2
%   for j = 1:4
%     for k = 1:3
%       for l = 1:2
%         expected(i,j,k,l) = A(i,1,k,1) + B(1,j,1,l);
%       end
%     end
%   end
% end
% R == expected


% % % 21. Broadcasting between 1x3x2 and 3x1x1 vector.
%
% A = rand(1,3,2);
% B = rand(3,1,1);

% R = A + B;
% expected = zeros(3,3,2);
% for i = 1:3
%   for j = 1:3
%     for k = 1:2
%       expected(i,j,k) = A(1,j,k) + B(i,1,1);
%     end
%   end
% end
% R == expected


% % % 22. Large 4D + scalar broadcasting.
%
% A = rand(3,2,2,2);
% R = A + 100;
% expected = A + 100;
% R == expected


% % % 23. Broadcasting 4D (multiple dimension verification 1).
%
% A = rand(1,2,1,3);
% B = rand(4,1,5,1);

% R = A .* B;
% expected = zeros(4,2,5,3);
% for i = 1:4
%   for j = 1:2
%     for k = 1:5
%       for l = 1:3
%         expected(i,j,k,l) = A(1,j,1,l) * B(i,1,k,1);
%       end
%     end
%   end
% end
% R == expected
