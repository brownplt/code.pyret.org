provide *
provide-types *

data File:
  | file(name :: String, content :: String)
end

data Recommendation:
  | recommendation(count :: Number, names :: List<String>)
end

f1=file("alist.txt","1984\nAnimal Farm\nHigurashi\nLife of Pi")
f2=file("blist.txt","Animal Farm\nHigurashi\nLife of Pi")
f3=file("clist.txt","1984\nHeart of Darkness")
f4=file("dlist.txt","Higurashi\nLife of Pi\nAnimal Farm")

r1 = recommendation(1,[list: "Animal Farm","Higurashi","Life of Pi","Heart of Darkness"])
r2 = recommendation(2,[list:"Higurashi","Life of Pi"])
r3 = recommendation(1,[list: "1984"])


fun recommend(title :: String, book-records :: List<File>) -> Recommendation:
  doc = "consumes the title of a book and a list of files and returns a list of recommended books based on which books the title is most frequently paired with, and that frequency is returned too."
  rec-books = check-files(title, book-records)
  best-c = best-count(rec-books, 0, [list: title], string-equal)
  recommendation(best-c, best-books(rec-books, best-c, [list: title], string-equal))
where:
  recommend("1925",[list: f1,f2,f3]) is
  recommendation(0,[list: ])
  # include below if you want it to crash. really, problem is with above test
  recommend("1984",[list: f1,f2,f3]) is
  recommendation(1,[list: "Animal Farm","Higurashi","Life of Pi","Heart of Darkness"])
  
end

fun popular-pairs(records :: List<File>) -> Recommendation:
  doc: "Make a general recommendation of pairs of books that are most often paired together and returns the number of times the pair appears"
  rec-pairs = get-pairs(records)
  best-c = best-count(rec-pairs, 0, [list:], pairs-equal)
  recommendation(best-c, best-books(rec-pairs, best-c, [list:], pairs-equal))

end

fun string-split-char(original-string :: String, value :: Number) -> List<String>:
  doc: "emulates string-split-all, but only for a specific char value"
  fun remove-new-line(original-code :: List<Number>, cur-string :: String) -> List<Number>:
    cases(List) original-code:
      | empty => 
        if cur-string == "":
          empty
        else:
          link(cur-string, empty)
        end
      | link(f,r) => 
        if (f == value):
          if cur-string == "":
            remove-new-line(r, "")
          else:
            link(cur-string, remove-new-line(r, ""))
          end
        else:
          remove-new-line(r, cur-string + string-from-code-point(f))
        end
    end
  end
  remove-new-line(string-to-code-points(original-string), "")

end


fun best-count(books :: List<String>, b-count :: Number, checked-books :: List<String>, equality-tester :: Function<Boolean>) -> Number:
  doc: "consumes a List of books or pairs of books and returns the maximum number of times an element recurs within the list"
  cases(List) books:
    | empty => b-count
    | link(f,r) =>
      if in-list(f, checked-books, equality-tester):
        best-count(r, b-count, checked-books, equality-tester)
      else:
        cnt = get-count(f, r, equality-tester) + 1
        if cnt >= b-count:
          best-count(r, cnt, link(f, checked-books), equality-tester)
        else:
          best-count(r, b-count, link(f, checked-books), equality-tester)
        end
      end
  end
 
end


fun best-books(books :: List<String>, b-count :: Number, checked-books :: List<String>, equality-tester :: Function<Boolean>):
  doc: "consumes a List of books or pairs of books and a number representing recurrance and returns all elements that appear that number of times"
  cases(List) books:
    | empty => empty
    | link(f,r) =>
      if in-list(f, checked-books, equality-tester):
        best-books(r, b-count, checked-books, equality-tester)
      else:
        cnt = 1 + get-count(f, r, equality-tester)
        if cnt == b-count:
          link(f, best-books(r, b-count, link(f, checked-books), equality-tester))
        else:
          best-books(r, b-count, link(f, checked-books), equality-tester)
        end
      end
  end
 
end
fun get-count(book :: String, books :: List<String>, equality-tester :: Function<Boolean>):
  doc: "consumes a book or pair of books and returns how many time it occurs within a list of books or pairs of books"
  cases(List) books:
    | empty => 0
    | link(f,r) =>
      if equality-tester(f, book):
        1 + get-count(book, r, equality-tester)
      else:
        get-count(book, r, equality-tester)
      end
  end

end

fun in-list(item :: String, lst :: List<String>, equality-tester :: Function<Boolean>):
  doc: "checks whether a book or pair of books is inside a List of Strings"
  cases(List) lst:
    | empty => false
    | link(f,r) => 
      if equality-tester(f, item):
        true
      else:
        in-list(item, r, equality-tester)
      end
  end

end

fun check-files(the-title:: String, book-files :: List<File>) -> List<String>:
  doc: "takes a title and combines all of the books in files where it appears into one list of books"
  cases(List) book-files:
    | empty => empty
    | link(f,r) => 
      books = string-split-char(f.content, 10)
      if (in-list(the-title, books, string-equal)):
        books + check-files(the-title,r)
      else:
        check-files(the-title,r)
      end
  end

end


fun pairs-equal(pair1 :: String, pair2 :: String) -> Boolean:
  doc: "takes two pairs of books in string format and determines whether the same elements appear in each"
  books1 = string-split-char(pair1, 43)
  books2 = string-split-char(pair2, 43)
  (pair1 == pair2) or
  ((books1.first == books2.rest.first) and (books2.first == books1.rest.first))

end


fun get-pairs(book-files :: List<File>) -> List<String>:
  doc: "consumes a list of files and creates a list of all the pairs that appear"
  cases(List) book-files:
    | empty => empty
    | link(f,r) => make-pairs(string-split-char(f.content, 10)) +
      get-pairs(r)
  end

end

fun make-pairs(books :: List<String>) -> List<String>:
  doc: "consumes a list of unique books and creates a list of all the unique pairs"
  cases(List) books:
    | empty => empty
    | link(f,r) => match-book(f,r) + make-pairs(r)
  end

end

fun match-book(book :: String, other-books :: List<String>) -> List<String>:
  doc: "consumes a book title and creates a list of pairs with all of the elements in given List of Strings"
  cases(List) other-books:
    | empty => empty
    | link(f,r) => 
      link((book + "+" + f), match-book(book, r))
  end

end
