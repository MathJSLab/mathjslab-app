clear % clear all variables

% Test indexing function.
[A,B,C,D]=ind2sub([4, 3], [1, 2; 3, 4; 5, 6])
[a,b,c,d,E,f]=ind2sub([4, 3], 1)
[a,b,c,d,E,f]=ind2sub([4, 3], 2)
[a,b,c,d,E,f]=ind2sub([4, 3], 3)
[a,b,c,d,E,f]=ind2sub([4, 3], 4)
[a,b,c,d,E,f]=ind2sub([4, 3], 5)
[a,b,c,d,E,f]=ind2sub([4, 3], 6)
[a,b,c,d,E,f]=ind2sub([4, 3], 7)
[a,b,c,d,E,f]=ind2sub([4, 3], 8)
[a,b,c,d,E,f]=ind2sub([4, 3], 9)
[a,b,c,d,E,f]=ind2sub([4, 3], 10)
[a,b,c,d,E,f]=ind2sub([4, 3], 11)
[a,b,c,d,E,f]=ind2sub([4, 3], 12)
[a,b,c,d,E,f]=ind2sub([4, 3], 13)
[a,b,c,d,E,f]=ind2sub([4, 3], 14)
[a,b,c,d,E,f]=ind2sub([4, 3], 15)
%
[a]=ind2sub([4, 3], 96)
[a,b]=ind2sub([4, 3], 96)
[a,b,c]=ind2sub([4, 3], 96)
[a,b,c,d]=ind2sub([4, 3], 96)
[a,b,c,d,E]=ind2sub([4, 3], 96)
[a,b,c,d,E,f]=ind2sub([4, 3], 96)
%
[a,b,c]=ind2sub([4, 3], 94)
[a,b,c]=ind2sub([4, 3], 95)
[a,b,c]=ind2sub([4, 3], 96)
[a,b,c]=ind2sub([4, 3], 97)
[a,b,c]=ind2sub([4, 3], 98)
[a,b,c]=ind2sub([4, 3], 99)
%
sub2ind([4,3], 1, 1)
sub2ind([4,3], 2, 1)
sub2ind([4,3], 3, 1)
sub2ind([4,3], 4, 1)
sub2ind([4,3], 1, 2)
sub2ind([4,3], 2, 2)
sub2ind([4,3], 3, 2)
sub2ind([4,3], 4, 2)
sub2ind([4,3], 1, 3)
sub2ind([4,3], 2, 3)
sub2ind([4,3], 3, 3)
sub2ind([4,3], 4, 3)
sub2ind([4,3], 1, 4) % error
sub2ind([4,3], 5, 1) % error
sub2ind([4,3], 1, 1, 1)
sub2ind([4,3], 1, 1, 2) % error
%
A = [1,2,3;4,5,6;7,8,9;10,11,12]
A(:,:,2) = A + 12
size(A)
size(A, 1)
size(A, 2)
size(A, 3)
size(A, 4)
size(A, [1, 2, 3, 4]) % test linearization
size(A, [1, 2; 3, 4]) % test linearization
size(A, 1, 2, 3)
size(A, 1, [2, 3, 1], 3)
size(A, 1, 2, 3, 4, 5, 6)
%
A = ones(4,3)
numel(A)
numel(A,[99,23],2)
numel(A,[99,23],[4,5,6,7],[90,91,92])
numel(1,[99,23],[4,5,6,7],[90,91,92])
numel(A,2,":")
numel(A,":",2)
