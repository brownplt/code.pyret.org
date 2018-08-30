provide *

# DO NOT CHANGE ANYTHING ABOVE THIS LINE

import lists as L

fun overlap(doc1 :: List<String>, doc2 :: List<String>) -> Number:
  doc: ```this diffs docs```
  doc1-upper :: List<String> = doc1.map(string-to-upper)
  doc2-upper :: List<String> = doc2.map(string-to-upper)
  
  master-word-list = 
    L.distinct(doc1-upper + doc2-upper)
  
  doc1-scores :: List<Number> = 
    master-word-list.map(lam(w): word-count(w, doc1-upper)end) 
  doc2-scores :: List<Number> = 
    master-word-list.map(lam(w): word-count(w, doc2-upper)end)
  
  numerator :: Number = dot-prod(doc1-scores, doc2-scores)
  denominator :: Number = num-max(
    num-sqr(mag(doc1-scores)),
    num-sqr(mag(doc2-scores)))
  
  numerator / denominator
  
where:
  overlap([list: "1", "2", "3"], [list: "1", "2", "3"]) is-roughly 1
  overlap([list: "1", "2", "3"], [list: "1", "3", "2"]) is-roughly 1
  
  overlap([list: "a", "b"],[list: "a", "A", "b", "b"]) is-roughly 0.5
  
  overlap([list: "a"], [list: "A"]) is-roughly 1
  overlap([list: "I", "bless", "the", "rains", "down", "in", "Africa"],
    [list: "I", "BLESS", "THE", "RAINS", "DOWN", "IN", "AFRICA"]) is-roughly 1 
end

check "do 2 entirely different docs return 0?":
  overlap([list: "a"], [list: "b"]) is-roughly 0
  overlap([list: "I", "bless", "the", "rains", "down", "in", "Africa"],
    [list: "It's", "gonna", "take", "a", "lot", "to",
      "drag", "me", "away", "from", "you"]) is-roughly 0
end

check "overlap sensitivity test on similar but not identical docs":
  overlap([list: "It's", "gonna", "take", "a", 
      "lot", "to", "drag", "me", "away"],
    [list: "Its", "gonna", "take", "a", "lot",
      "to", "drag", "me", "away"]) is-roughly 8/9 
end

check "overlap sensitivity test on different but slightly similar docs":
  overlap([list: "A", "A", "A", "a", "A", "A", "A", "A", "A"],
    [list: "B", "B", "B", "B", "B", "B", "B", "B", "A"]) is-roughly 1/9 
end

fun word-count(word :: String, doc :: List<String>) -> Number:
  doc: ```given a word and a doc, 
       returns how many times the word is in the doc```
  doc.foldl(
    lam(w, n):
      if (w == word):
        n + 1 
      else: 
        n 
      end 
    end,
    0)
  
where:
  word-count("", empty) is 0
  word-count("1", [list: "1", "2"]) is 1
  word-count("3", [list: "1", "2"]) is 0
  word-count("1", [list: "1","1","1","1","1","1","1", "2", "1"]) is 8
end

fun dot-prod(num-list-1 :: List<Number>, num-list-2 :: List<Number>) -> Number:
  doc: ```finds the dot product of two vectors represented as Lists of Numbers
       the list must be the same size```
  
  products :: List<Number> = 
    map2(lam(num1, num2): num1 * num2 end, num-list-1, num-list-2)
  
  products.foldl(lam(n, sum): n + sum end, 0)
  
where:
  dot-prod(empty, empty) is 0
  dot-prod([list: 1, 2, 3], [list: 3, 2, 1]) is 10
  dot-prod([list: 0, 3], [list: 1, 0]) is 0   
end

fun mag(vector :: List<Number>) -> Number:
  doc: ``` finds the magnitude of the given vector```
  num-sqrt(dot-prod(vector, vector))
where:
  mag(empty) is 0
  mag([list: 1]) is 1
  mag([list: 1, 2, 3]) is-roughly num-sqrt(14)
end
