fun f(l):
  cases (List) l:
    | empty => 0
    | link(h, r) => h * f(r)
  end
end
f([list: ])
