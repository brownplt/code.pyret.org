fun fib(n):
  if n < 2:
    1
  else:
    fib(n - 1) + fib(n - 2)
  end
end

check:
  fib(5) is 8 because fib(4) + fib(3)
end

fun f(l, a):
  l(a)
end
f(lam(x): x + 5 end, 8)
