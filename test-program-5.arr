fun f(x):
  x / 3
where:
  f(9) is 3
  f(10) is 3
end

data Silly:
  | silly(n)
end

data N:
  | nooches(n, d)
end

fun prodN():
  nooches(3, 5)
end
prodN()

fun check-is-cause(a, b, c, d):
  a + b + c + d
end
check-is-cause(5, 4, 3, 6)

check:
  f(silly(3).n) is 1 because 3/3
  f(silly(3).n) is 0
end

f(5 / 2)
