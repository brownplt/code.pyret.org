data N:
  | num(n)
end

fun f(n):
  if n < 2:
    num(1)
  else:
    ((f(n - 1)).n + (f(n - 2)).n)  ## note: missing num constructor here
  end
end

f(5)

check:
  f(1) is num(1)
end
