fun sort(l):
  cases (List) l:
    | empty => empty
    | link(f, r) => insert(f, sort(r))
  end
end

fun insert(element, l):
  cases (List) l:
    | empty => [list: element]
    | link(f, r) => if element < f:
        link(element, l)
      else:
        link(f, insert(element, r))
      end
  end
end

check:
  sort(empty) is empty
  
  sort([list: 1, 2, 3]) is [list: 1 , 2, 3]
  sort([list: 3, 0, -1]) is [list: -1, 0, 3]
end
