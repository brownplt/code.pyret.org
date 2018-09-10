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
  recommend("1984",[list: f1,f2,f3]) is
  recommendation(1,[list: "Animal Farm","Higurashi","Life of Pi","Heart of Darkness"])
  recommend("1984",[list: f1,f3,f4]) is
  recommendation(1,[list: "Animal Farm","Higurashi","Life of Pi","Heart of Darkness"])
  recommend("1984",[list: f1,f3]) is
  recommendation(1,[list: "Animal Farm","Higurashi","Life of Pi","Heart of Darkness"])
  recommend("Animal Farm",[list: f1,f2,f3]) is
  recommendation(2,[list:"Higurashi","Life of Pi"])
  recommend("Animal Farm",[list: f1]) is
  recommendation(1,[list:"1984","Higurashi","Life of Pi"])
  recommend("Heart of Darkness",[list: f1,f2,f3]) is
  recommendation(1,[list: "1984"])
  recommend("Animal Farm",[list:]) is
  recommendation(0,[list:])
end

fun popular-pairs(records :: List<File>) -> Recommendation:
  doc: "Make a general recommendation of pairs of books that are most often paired together and returns the number of times the pair appears"
  rec-pairs = get-pairs(records)
  best-c = best-count(rec-pairs, 0, [list:], pairs-equal)
  recommendation(best-c, best-books(rec-pairs, best-c, [list:], pairs-equal))
where:
  popular-pairs([list: f1,f2,f3]) is
  recommendation(2, [list: "Animal Farm+Higurashi", "Animal Farm+Life of Pi", "Higurashi+Life of Pi"])
  popular-pairs([list: f1,f2]) is
  recommendation(2, [list: "Animal Farm+Higurashi", "Animal Farm+Life of Pi", "Higurashi+Life of Pi"])
  popular-pairs([list: f1, f3]) is
  recommendation(1, [list: "1984+Animal Farm", "1984+Higurashi", "1984+Life of Pi", 
      "Animal Farm+Higurashi", "Animal Farm+Life of Pi", "Higurashi+Life of Pi", 
      "1984+Heart of Darkness"])
  popular-pairs([list: f1]) is
  recommendation(1, [list: "1984+Animal Farm", "1984+Higurashi", "1984+Life of Pi", 
      "Animal Farm+Higurashi", "Animal Farm+Life of Pi", "Higurashi+Life of Pi"])
  popular-pairs([list: ]) is
  recommendation(0, [list:])
  popular-pairs([list: f3]) is
  recommendation(1,[list: "1984+Heart of Darkness"])
  popular-pairs([list: f3, f3]) is
  recommendation(2,[list: "1984+Heart of Darkness"])
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
where:
  string-split-char("", 10) is [list:]
  string-split-char("c", 10) is [list:"c"]
  string-split-char("cat dog", 10) is [list:"cat dog"]
  string-split-char("cat\ndog", 10) is [list: "cat", "dog"]
  string-split-char("\ncat\ndog\ncow\n", 10) is [list: "cat", "dog","cow"]
  string-split-char("\ncat\ndog", 10) is [list: "cat", "dog"]
  string-split-char("cat dog\n", 10) is [list: "cat dog"]
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
where:
  best-count([list: "1984", "Animal Farm", 
      "Higurashi", "Life of Pi", "Animal Farm", 
      "Higurashi", "Life of Pi"], 0, [list: "1984"], string-equal) is 2
  best-count([list: "1984", "Animal Farm", 
      "Higurashi", "Life of Pi", "Animal Farm", 
      "Baaa"], 0, [list: "1984"], string-equal) is 2
  best-count([list: "Animal Farm", "Animal Farm"], 0, [list: "1984"], string-equal) is 2
  best-count([list: "Animal Farm"], 0, [list: "1984"], string-equal) is 1
  best-count([list: ], 0, [list: "1984"], string-equal) is 0
  best-count([list: "1984"], 0, [list: "1984"], string-equal) is 0
  best-count([list: "Animal Farm+1984", "Higurashi+1984", "Life of Pi+1984", "Higurashi+Animal Farm",
      "Life of Pi+Animal Farm", "Life of Pi+Higurashi", "Higurashi+Animal Farm", 
      "Life of Pi+Animal Farm", "Life of Pi+Higurashi", "Heart of Darkness+1984"],
    0, [list:], pairs-equal) is 2
  best-count([list: "Animal Farm+1984", "Higurashi+1984", "Life of Pi+1984", "Higurashi+Animal Farm",
      "Life of Pi+Animal Farm", "Life of Pi+Higurashi", "Heart of Darkness+1984"],
    0, [list:], pairs-equal) is 1
  best-count([list: "Animal Farm+1984"], 0, [list:], pairs-equal) is 1 
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
where:
  best-books([list:], 0, [list:"1925"], string-equal) is [list:]
  best-books([list: "1984", "Animal Farm", 
      "Higurashi", "Life of Pi", "Animal Farm", 
      "Life of Pi"], 2, [list: "1984"], string-equal) is 
  [list: "Animal Farm", "Life of Pi"]
  best-books([list: "1984", "Animal Farm", 
      "Higurashi", "Life of Pi", "Animal Farm", 
      "Baaa", "Animal Farm"], 3, [list: "1984"], string-equal) is 
  [list: "Animal Farm"]
  best-books([list: "Animal Farm"], 1, [list: "1984"], string-equal) is 
  [list: "Animal Farm"]
  best-books([list: "Animal Farm","Animal Farm","Animal Farm"], 3, [list: "1984"], string-equal) is 
  [list: "Animal Farm"]
  best-books([list: "Animal Farm+1984", "Higurashi+1984", "Life of Pi+1984", "Higurashi+Animal Farm",
      "Life of Pi+Animal Farm", "Life of Pi+Higurashi", "Animal Farm+Higurashi", 
      "Life of Pi+Animal Farm", "Higurashi+Life of Pi", "Heart of Darkness+1984"],
    2, [list:], pairs-equal) is [list: "Higurashi+Animal Farm", "Life of Pi+Animal Farm", 
    "Life of Pi+Higurashi"]
  best-books([list: "Animal Farm+1984", "Higurashi+1984", "Life of Pi+1984", "Higurashi+Animal Farm",
      "Life of Pi+Animal Farm", "Higurashi+Life of Pi", "Heart of Darkness+1984"],
    1, [list:], pairs-equal) is [list: "Animal Farm+1984", "Higurashi+1984", "Life of Pi+1984",
    "Higurashi+Animal Farm", "Life of Pi+Animal Farm", "Higurashi+Life of Pi", 
    "Heart of Darkness+1984"]
  best-books([list: "Animal Farm+1984"], 1, [list:], pairs-equal) is [list: "Animal Farm+1984"] 
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
where:
  get-count("Animal Farm", [list: "1984", "Animal Farm", 
      "Higurashi", "Life of Pi", "Animal Farm", 
      "Higurashi", "Life of Pi"], string-equal) is 2
  get-count("Animal Farm", [list: "1984", "Animal Farm", 
      "Higurashi", "Life of Pi",
      "Higurashi", "Life of Pi"], string-equal) is 1
  get-count("Animal Farm", [list: "1984",
      "Higurashi", "Life of Pi",
      "Higurashi", "Life of Pi", "Animal Farm"], string-equal) is 1
  get-count("Animal Farm", [list: "1984",
      "Higurashi", "Life of Pi",
      "Higurashi", "Life of Pi"], string-equal) is 0
  get-count("1984", [list: "1984"], string-equal) is 1
  get-count("1984", [list: ], string-equal) is 0
  get-count("Higurashi+Animal Farm", [list: "Animal Farm+1984", "Higurashi+1984", "Life of Pi+1984",
      "Higurashi+Animal Farm", "Life of Pi+Animal Farm", "Life of Pi+Higurashi", 
      "Animal Farm+Higurashi", "Life of Pi+Animal Farm", "Higurashi+Life of Pi", 
      "Heart of Darkness+1984"], pairs-equal) is 2
  get-count("Higurashi+Animal Farms", [list: "Animal Farm+1984", "Higurashi+1984", "Life of Pi+1984",
      "Higurashi+Animal Farm", "Life of Pi+Animal Farm", "Life of Pi+Higurashi", 
      "Animal Farm+Higurashi", "Life of Pi+Animal Farm", "Higurashi+Life of Pi", 
      "Heart of Darkness+1984"], pairs-equal) is 0
  get-count("1984+Heart of Darkness", [list: "Animal Farm+1984", "Higurashi+1984", "Life of Pi+1984",
      "Higurashi+Animal Farm", "Life of Pi+Animal Farm", "Life of Pi+Higurashi", 
      "Animal Farm+Higurashi", "Life of Pi+Animal Farm", "Higurashi+Life of Pi", 
      "Heart of Darkness+1984"], pairs-equal) is 1
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
where:
  in-list("Animal Farm", [list: "1984", "Animal Farm", 
      "Higurashi", "Life of Pi", "Animal Farm", 
      "Higurashi", "Life of Pi"], string-equal) is true
  in-list("Animal Farm", [list: "Animal Farm", 
      "Higurashi", "Life of Pi", "Life of Pi", 
      "Higurashi", "Life of Pi"], string-equal) is true
  in-list("Animal Farm", [list: "Higurashi", "Life of Pi", 
      "Life of Pi", "Higurashi", "Life of Pi", 
      "Animal Farm"], string-equal) is true
  in-list("Animals", [list: "1984", "Animal Farm", 
      "Higurashi", "Life of Pi", "Animal Farm", 
      "Higurashi", "Life of Pi"], string-equal) is false
  in-list("Animal Farm", [list: "Animal Farm"], string-equal) is true
  in-list("Animal Farm", [list: ], string-equal) is false
  in-list("Animal Farm+Higurashi", [list: "Higurashi+Animal Farm"], pairs-equal) is true
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
where:
  check-files("1984", [list:f1,f2,f3]) is [list: "1984", "Animal Farm", "Higurashi", "Life of Pi", "1984", "Heart of Darkness"]
  check-files("1984", [list:f1,f3]) is [list: "1984", "Animal Farm", "Higurashi", "Life of Pi", "1984", "Heart of Darkness"]
  check-files("1984", [list:f1]) is [list: "1984", "Animal Farm", "Higurashi", "Life of Pi"]
  check-files("1984", [list:f2]) is [list:]
  check-files("1984", [list:]) is [list:]
end


fun pairs-equal(pair1 :: String, pair2 :: String) -> Boolean:
  doc: "takes two pairs of books in string format and determines whether the same elements appear in each"
  books1 = string-split-char(pair1, 43)
  books2 = string-split-char(pair2, 43)
  (pair1 == pair2) or
  ((books1.first == books2.rest.first) and (books2.first == books1.rest.first))
where:
  pairs-equal("cat+dog", "cat+dog") is true
  pairs-equal("cat+dog", "dog+cat") is true
  pairs-equal("my cat+the dog", "the dog+my cat") is true
  pairs-equal("cat+dog", "dogg+cat") is false
  pairs-equal("catt+dog", "dog+cat") is false
  pairs-equal("cat+dog", "cat+dogg") is false
end


fun get-pairs(book-files :: List<File>) -> List<String>:
  doc: "consumes a list of files and creates a list of all the pairs that appear"
  cases(List) book-files:
    | empty => empty
    | link(f,r) => make-pairs(string-split-char(f.content, 10)) +
      get-pairs(r)
  end
where:
  get-pairs([list:f1,f2,f3]) is [list: "1984+Animal Farm", "1984+Higurashi", "1984+Life of Pi", 
    "Animal Farm+Higurashi", "Animal Farm+Life of Pi", "Higurashi+Life of Pi", 
    "Animal Farm+Higurashi", "Animal Farm+Life of Pi", "Higurashi+Life of Pi", 
    "1984+Heart of Darkness"]
  get-pairs([list:f1]) is
  [list: "1984+Animal Farm", "1984+Higurashi", "1984+Life of Pi", "Animal Farm+Higurashi", "Animal Farm+Life of Pi", "Higurashi+Life of Pi"]
  get-pairs([list:f3]) is
  [list: "1984+Heart of Darkness"]
  get-pairs([list:]) is [list:]
end

fun make-pairs(books :: List<String>) -> List<String>:
  doc: "consumes a list of unique books and creates a list of all the unique pairs"
  cases(List) books:
    | empty => empty
    | link(f,r) => match-book(f,r) + make-pairs(r)
  end
where:
  make-pairs([list:]) is [list: ]
  make-pairs([list: "cat", "dog"]) is [list: "cat+dog"]
  make-pairs(string-split-char(f1.content, 10)) is
  [list: "1984+Animal Farm", "1984+Higurashi", "1984+Life of Pi", "Animal Farm+Higurashi", 
    "Animal Farm+Life of Pi", "Higurashi+Life of Pi"]
  make-pairs(string-split-char(f2.content, 10)) is
  [list: "Animal Farm+Higurashi", "Animal Farm+Life of Pi", "Higurashi+Life of Pi"]
end

fun match-book(book :: String, other-books :: List<String>) -> List<String>:
  doc: "consumes a book title and creates a list of pairs with all of the elements in given List of Strings"
  cases(List) other-books:
    | empty => empty
    | link(f,r) => 
      link((book + "+" + f), match-book(book, r))
  end
where:
  match-book("1984", [list: "Animal Farm","Higurashi","Life of Pi","Heart of Darkness"]) is
  [list: "1984+Animal Farm","1984+Higurashi","1984+Life of Pi","1984+Heart of Darkness"]
  match-book("1984", [list: "Animal Farm"]) is [list: "1984+Animal Farm"]
  match-book("1984", [list: ]) is [list:]
end
