 fID1 = fopen('myoutput1.txt','r');
 for n = 1:4
    b = fscanf(fID1,'%7u %7u %7u \r',3);
    btotal = b(1)+b(2)+b(3);
    fprintf('%7u + %7u + %7u = %7u \r', b(1), b(2), b(3), btotal)
 end