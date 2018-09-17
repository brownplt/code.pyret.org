fun c(t):
  cases (List) t:
    | empty => 0
    | link(f, r) => f + c(r)
  end
where:
  c(empty) is 0
  c([list: 1, 2]) is 3
end

fun cc(t):
  cases (List) t:
    |empty => 0
    | link(f, r) => c(f) + cc(r)
  end
end

cc([list:
    [list: 2, 3],
    [list: -5, 7]])

check:
  c([list: -1, 1]) is 0
end

check "something":
  3 + 5 is 9
end
