fun f(x):
  x / 3
where:
  f(9) is 3
  f(10) is 3
end

data Silly:
  | silly(n)
end

check:
  f(silly(3).n) is 1 because 3/3
  f(silly(3).n) is 0
end

f(5)
