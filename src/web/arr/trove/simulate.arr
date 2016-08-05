provide *

import global as _
import lists as lists
include reactors
include plot
include image-structs

type Lst = lists.List

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

fun interact-trace<A>(r :: Reactor<A>) -> Any:
  r.start-trace().interact().get-trace-as-table()
end

fun simulate-trace<A>(r :: Reactor<A>, limit :: Number) -> Any:
  fun help(shadow r, i):
    if i <= 0: r.get-trace()
    else if r.is-stopped(): r.get-trace-as-table()
    else: help(r.react(time-tick), i - 1)
    end
  end
  help(r.start-trace(), limit)
end

fun replay(t, to-show, seconds-per-tick) block:
  states = extract state from t end
  when is-empty(states):
    raise("No trace to replay")
  end
  initial = {0; states; to-show(states.first)}
  reactor:
    init: initial,
    on-tick: lam({x; shadow states; i}):
        { x + 1; states.rest; to-show(states.first) }
      end,
    to-draw: lam({x;_;i}):
        i
      end,
    stop-when: lam({x;shadow states;i}):
        is-empty(states)
      end,
    seconds-per-tick: seconds-per-tick
  end.interact()
end



fun get-last-two<A>(t :: Lst<A>) -> {A;A} block:
  l = t.length()
  when l < 2:
    raise("Trace had fewer than two elements (" + tostring(l) + "), cannot get-last-two")
  end
  fun help(shadow t):
    ask:
      | lists.is-empty(t) or (lists.is-link(t) and lists.is-empty(t.rest)) then:
        raise("Trace had fewer than two elements, cannot get-last-two")
      | lists.is-link(t) and lists.is-empty(t.rest.rest) then:
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
fun list-length(l :: Lst) -> Number:
  l.length()
end

#Sum
fun list-sum(l :: Lst<Number>) -> Number:
  cases (Lst<Number>) l:
    |empty => 0
    |link(first, rest) => first + list-sum(rest)
  end
end

#Average
fun list-avg(l :: Lst<Number>) -> Number:
  doc: "Find the average of a list of numbers"
  if list-length(l) == 0:
    raise("You can't take the average of an empty list")
  else:
    list-sum(l) / list-length(l)
  end
end

#Min
fun list-min(l :: Lst):
  doc: "Find the minimum element of a list according to the built in ordering of elements"
  cases (Lst) l:
    |empty => raise("The list is empty")
    |link(first, rest) => min-helper(first, rest)
  end
end

fun min-helper(curr-min, l :: Lst):
  cases (Lst) l:
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
fun list-max(l :: Lst):
  doc: "Find the maximum element of a list according to the built in ordering of elements"
  cases (Lst) l:
    |empty => raise("The list is empty")
    |link(first, rest) => max-helper(first, rest)
  end
end

fun max-helper(curr-max, l :: Lst):
  cases (Lst) l:
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
fun list-median(l :: Lst):
  doc: "returns the median element of the list"
  sorted = l.sort()
  index = list-length(sorted)
  cases (Lst) sorted:
    |empty => raise("The list is empty")
    |link(first, rest) => sorted.get(num-floor(index / 2))
  end
end

# Standard Deviation
fun list-stdev(l :: Lst) -> Number:
  doc: "returns the standard deviation of the list of numbers"
  mean = list-avg(l)
  sq-diff = l.map(lam(k): num-expt((k - mean), 2) end)
  sq-mean = list-avg(sq-diff)
  num-sqrt(sq-mean)
end

#Contains:
fun list-contains(e, l :: Lst) -> Boolean:
  doc: "returns true if element e is in the list l and false otherwise"
  cases (Lst) l:
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
fun list-distinct(l :: Lst) -> Lst:
  doc: "returns a list with exactly the distinct elements of the original list removing the first instance"
  cases (Lst) l:
    |empty => lists.empty
    |link(first, rest) =>
      if list-contains(first, rest):
        list-distinct(rest)
      else:
        lists.link(first, list-distinct(rest))
      end
  end
end

colors = [lists.list: blue, green, red, orange, yellow, blue, purple, brown]

fun display-plots(title, infer-bounds, plots):
  new-plots = for lists.map_n(n from 0, p from plots):
    c = lam(x): {color: colors.get(num-modulo(n, colors.length())) } end
    cases(Plot) p:
      | function-plot(f , _) => function-plot(f, c)
      | line-plot(points, _) => line-plot(points, c)
      | scatter-plot(points, _) => scatter-plot(points, c)
    end
  end
  options = if infer-bounds:
    _.{infer-bounds: true}
  else:
    lam(x): x end
  end
  display-multi-plot(title, new-plots, options)
end

make-function-plot = lam(f):
  function-plot(f, _.{color: blue})
end
make-line-plot = lam(t):
  line-plot(t, _.{color: blue})
end
make-scatter-plot = lam(t):
  scatter-plot(t, _.{color: blue})
end


