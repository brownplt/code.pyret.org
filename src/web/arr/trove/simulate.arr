provide *
provide-types *

import global as _
import lists as lists
import option as O
include reactors

type List = lists.List
List = lists.is-List
empty = lists.empty
link = lists.link
is-empty = lists.is-empty
is-link = lists.is-link
fold = lists.fold

type Option = O.Option
none = O.none
is-none = O.is-none
some = O.some
is-some = O.is-some




fun difference():
  var last-val = nothing
  {
    one: lam(w) block:
        last-val := w
        w
      end,
    reduce: lam(_, w2) block:
        ans = w2 - last-val
        last-val := w2
        ans
      end
  }
end

fun running-mean():
  var sum = 0
  var count = 1
  {
    one: lam(w) block:
        sum := sum + w
        w
      end,
    reduce: lam(w1, w2) block:
        count := count + 1
        sum := sum + w2
        sum / count
      end
  }
end

fun running-max():
  {
    one: lam(w): w end,
    reduce: lam(w1, w2): num-max(w1, w2) end
  }
end

fun running-min():
  {
    one: lam(w): w end,
    reduce: lam(w1, w2): num-min(w1, w2) end
  }
end

fun running-sum():
  {
    one: lam(w): w end,
    reduce: lam(w1, w2): w1 + w2 end
  }
end

fun simulate-with-trace<A>(r :: Reactor<A>) -> List<A>:
  r.start-trace().interact().get-trace()
end

fun simulate-with-trace-as-table<A>(r :: Reactor<A>) -> Any:
  r.start-trace().interact().get-trace-as-table()
end

#|
fun run-with-trace<A>(r :: Reactor<A>, limit :: Number) -> List<A>:
  fun help(shadow r, i):
    if i <= 0: r.get-trace()
    else if r.is-stopped(): r.get-trace()
    else: help(r.react(time-tick), i - 1)
    end
  end
  help(r, limit)
end
|#

fun get-last-two<A>(t :: List<A>) -> {A;A} block:
  l = t.length()
  when l < 2:
    raise("Trace had fewer than two elements (" + tostring(l) + "), cannot get-last-two")
  end
  fun help(shadow t):
    ask:
      | is-empty(t) or (is-link(t) and is-empty(t.rest)) then:
        raise("Trace had fewer than two elements, cannot get-last-two")
      | is-link(t) and is-empty(t.rest.rest) then:
        {t.first; t.rest.first}
      | otherwise:
        get-last-two(t.rest)
    end
  end
  help(t)
end

fun in-range(val :: Number, {min :: Number; max :: Number}) -> Boolean:
  (val >= min) and (val <= max)
end


#Length
fun list-length(l :: List) -> Number:
  l.length()
end

#Sum
fun list-sum(l :: List<Number>) -> Number:
  cases (List<Number>) l:
    |empty => 0
    |link(first, rest) => first + list-sum(rest)
  end
end

#Average
fun list-avg(l :: List<Number>) -> Number:
  doc: "Find the average of a list of numbers"
  if list-length(l) == 0:
    raise("You can't take the average of an empty list")
  else:
    list-sum(l) / list-length(l)
  end
end

#Min
fun list-min(l :: List):
  doc: "Find the minimum element of a list according to the built in ordering of elements"
  cases (List) l:
    |empty => raise("The list is empty")
    |link(first, rest) => min-helper(first, rest)
  end
end

fun min-helper(curr-min, l :: List):
  cases (List) l:
    |empty => curr-min
    |link(first, rest) =>
      if first < curr-min:
        min-helper(first, rest)
      else:
        min-helper(curr-min, rest)
      end
  end
end

#Max
fun list-max(l :: List):
  doc: "Find the maximum element of a list according to the built in ordering of elements"
  cases (List) l:
    |empty => raise("The list is empty")
    |link(first, rest) => max-helper(first, rest)
  end
end

fun max-helper(curr-max, l :: List):
  cases (List) l:
    |empty => curr-max
    |link(first, rest) =>
      if first > curr-max:
        max-helper(first, rest)
      else if first <= curr-max:
        max-helper(curr-max, rest)
      end
  end
end


#Median
fun list-median(l :: List):
  doc: "returns the median element of the list"
  sorted = l.sort()
  index = list-length(sorted)
  cases (List) sorted:
    |empty => raise("The list is empty")
    |link(first, rest) => sorted.get(num-floor(index / 2))
  end
end

# Standard Deviation
fun list-stdev(l :: List) -> Number:
  doc: "returns the standard deviation of the list of numbers"
  mean = list-avg(l)
  sq-diff = l.map(lam(k): num-expt((k - mean), 2) end)
  sq-mean = list-avg(sq-diff)
  num-sqrt(sq-mean)
end

#Contains:
fun list-contains(e, l :: List) -> Boolean:
  doc: "returns true if element e is in the list l and false otherwise"
  cases (List) l:
    |empty => false
    |link(first, rest) =>
      if first == e:
        true
      else:
        list-contains(e, rest)
      end
  end
end

#Distinct
fun list-distinct(l :: List) -> List:
  doc: "returns a list with exactly the distinct elements of the original list removing the first instance"
  cases (List) l:
    |empty => empty
    |link(first, rest) =>
      if list-contains(first, rest):
        list-distinct(rest)
      else:
        link(first, list-distinct(rest))
      end
  end
end



