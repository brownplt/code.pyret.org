data T:
  | mt
  | nd(v, l, r)
end

fun c(t):
  cases (T) t:
    | mt => 0
    | nd(v, l, r) => 1 + c(l) + c(r)
  end
where:
  c(mt) is 0
end

check:
  c(nd(3, nd(2, nd(1, mt, mt), mt), nd(4, mt, nd(5, mt, mt)))) is 5
end

check "something":
  3 + 5 is 9
end
