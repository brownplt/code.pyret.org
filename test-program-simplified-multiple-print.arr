fun run-thru-indices(coins, denominations) -> List<Number> block:
  doc: "Go through each amount of change to make and update"
  print("hello, am i twice, once for run-thru, and the other for get?")
  # just coins prints x3, denominations x2
  coins
end
fun num-coins-for(n :: Number) -> Number:
  run-thru-indices([list: 3, 4, 5], [list: 1, 5, 10]).get(n)
where:
  num-coins-for(10) is 1
end
