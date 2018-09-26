fun sort(l):
  cases (List) l:
    | empty => empty
    | link(f, r) =>
      insert(f, sort(r))
  end
end

fun insert(e, l):
  cases (List) l:
    | empty => [list: l]
    | link(f, r) =>
      if e < f:
        link(e, l)
      else:
        link(f, insert(e, r))
      end
  end
end

sort([list: 1, 2, 3, 4])
