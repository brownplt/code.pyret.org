use namespace empty-namespace

# Translated from compile-structs.arr, standard-imports

import lists as lists
import sets as sets
import arrays as arrays
import error as error
import option as option
import constants as C
import global as G 

# This line provides these as module bindings (e.g. all code can write
# lists.map as if it had written import lists as lists)
provide: module lists, module sets, module option, module arrays, module error end

provide from arrays:
  array,
  build-array,
  array-from-list,
  is-array,
  array-of,
  array-set-now,
  array-get-now,
  array-length,
  array-to-list-now,

  type Array
end

provide from option:
  is-Option,
  some,
  none,
  is-some,
  is-none,

  type Option
end

provide from lists:
  list,
  is-List,
  is-empty,
  is-link,
  empty,
  link,
  range,
  range-by,
  repeat,
  filter,
  partition,
  split-at,
  any,
  find,
  map,
  map2,
  map3,
  map4,
  map_n,
  map2_n,
  map3_n,
  map4_n,
  each,
  each2,
  each3,
  each4,
  each_n,
  each2_n,
  each3_n,
  each4_n,
  fold,
  fold2,
  fold3,
  fold4,
  
  type List
end

provide from sets:
  set,
  tree-set,
  list-set,
  empty-set,
  empty-list-set,
  empty-tree-set,
  list-to-set,
  list-to-list-set,
  list-to-tree-set,

  type Set
end