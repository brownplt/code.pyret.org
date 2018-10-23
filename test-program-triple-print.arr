fun get-initial-list(l :: Number) -> List<Number>:
  repeat(l, 101).set(0, 0)
end

fun update-num-coins(coins :: List<Number>, index :: Number, denomination :: Number) -> List<Number>:
  doc: "Try to update number of coins at a particular index for a particular denomination"
  if (index - denomination) >= 0:
    coins.set(index, num-min(coins.get(index),
        coins.get(index - denomination) + 1))
  else:
    coins
  end
end

fun run-thru-denominations(coins, index, denominations :: List<Number>) -> List<Number>:
  doc: "For a given index, try to update number of coins with different denominations"
  op = lam(d, c): update-num-coins(c, index, d) end
  denominations.foldr(op, coins)
end

fun run-thru-indices(coins, denominations) -> List<Number> block:
  doc: "Go through each amount of change to make and update"
  print("hello, am i twice, once for run-thru, and the other for get?")
  range(1, coins.length()).foldl(lam(i, c): run-thru-denominations(c, i, denominations) end, coins)
end

fun num-coins-for(n :: Number) -> Number:
  run-thru-indices(get-initial-list(n + 1), [list: 1, 5, 10]).get(n)
where:
  num-coins-for(10) is 1
end

