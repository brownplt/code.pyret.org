include color
include chart
include image

################################################################################
# CONSTANTS
################################################################################

#####################
# SINGLE BAR CHARTS 
#####################

single-bars = from-list.bar-chart(
  [list: "Pyret", "OCaml", "C", "C++", "Python", "Racket", "Smalltalk"],
  [list: 10,       6,       1,   3,     5,       8,        9])

single-bars-neg = from-list.bar-chart(
  [list: "Pyret", "OCaml", "C", "C++", "Python", "Racket", "Smalltalk"],
  [list: -10,       -6,       1,   3,     -5,       -8,        -9])

single-bars-rep = from-list.bar-chart(
  [list: "Pyret", "OCaml", "C", "C++", "Python", "Racket", "Pyret"],
  [list: 10,       6,       1,   3,     5,       8,        9])

######################
# GROUPED BAR CHARTS 
######################

grouped-bars = from-list.grouped-bar-chart(
  [list: 'CA', 'TX', 'NY', 'FL', 'IL', 'PA'],
  [list:
    [list: 2704659,4499890,2159981,3853788,10604510,8819342,4114496],
    [list: 2027307,3277946,1420518,2454721,7017731,5656528,2472223],
    [list: 1208495,2141490,1058031,1999120,5355235,5120254,2607672],
    [list: 1140516,1938695,925060,1607297,4782119,4746856,3187797],
    [list: 894368,1558919,725973,1311479,3596343,3239173,1575308],
    [list: 737462,1345341,679201,1203944,3157759,3414001,1910571]],
  [list:
    'Under 5 Years',
    '5 to 13 Years',
    '14 to 17 Years',
    '18 to 24 Years',
    '25 to 44 Years',
    '45 to 64 Years',
    '65 Years and Over'])

grouped-bars-neg = from-list.grouped-bar-chart(
    [list: '2010', '2011', '2012', '2013', '2014', 
   '2015', '2016', '2017', '2018', '2019'],
  [list: 
    [list: -3.78, -1.14, -1.06, -3.54, -1.74, -1.23, 0.42],
    [list: -3.81, -1.18, -1.05, -3.56, -1.77, -1.25, 0.35],
    [list: -3.83, -1.21, -1.04, -3.58, -1.81, -1.27, 0.27],
    [list: -3.84, -1.24, -1.05, -3.60, -1.86, -1.29, 0.18],
    [list: -3.86, -1.27, -1.06, -3.61, -1.91, -1.31, 0.09],
    [list: -3.87, -1.29, -1.06, -3.63, -1.97, -1.33, 0],
    [list: -3.88, -1.31, -1.07, -3.64, -2.03, -1.35, -0.08],
    [list: -3.89, -1.32, -1.07, -3.66, -2.09, -1.36, -0.17],
    [list: -3.90, -1.33, -1.07, -3.67, -2.15, -1.38, -0.25],
    [list: -3.91, -1.34, -1.07, -3.68, -2.21, -1.39, -0.33]],
  [list: 'Asia', 'North America', 'Europe', 
     'South America', 'Africa', 'Oceania', 'Angola'])

grouped-bars-rep = from-list.grouped-bar-chart(
    [list: 'Liam', 'Elijah', 'Ava', 'Sophia', 'Ava', 'Emma'],
    [list: 
      [list: 10, 8, 10, 4, 8, 9, 7],
    [list: 9, 7, 8, 9, 5, 5, 8], 
      [list: 8, 10, 9, 4, 5, 10, 7],
      [list: 10, 6, 7, 4, 10, 6, 5], 
      [list: 8, 8, 9, 8, 4, 4, 5], 
      [list: 6, 9, 8, 6, 9, 10, 7]], 
    [list: 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
   'Friday', 'Saturday', 'Sunday'])

grouped-bars-repgroups = from-list.grouped-bar-chart(
    [list: 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
   'Friday', 'Saturday', 'Sunday'], 
    [list: 
      [list: 10, 9, 8, 10, 8, 6], 
      [list: 8, 7, 10, 6, 8, 9],
      [list: 10, 9, 9, 7, 9, 8], 
    [list: 4, 9, 4, 4, 8, 6], 
    [list: 8, 5, 5, 10, 4, 9], 
    [list: 9, 5, 10, 6, 4, 10], 
    [list: 7, 8, 7, 5, 5, 7]],
    [list: 'Liam', 'Elijah', 'Ava', 'Sophia', 'Ava', 'Emma'])

######################
# STACKED BAR CHARTS 
######################

stacked-bars = from-list.stacked-bar-chart(
  [list: 'CA', 'TX', 'NY', 'FL', 'IL', 'PA'],
  [list:
    [list: 2704659,4499890,2159981,3853788,10604510,8819342,4114496],
    [list: 2027307,3277946,1420518,2454721,7017731,5656528,2472223],
    [list: 1208495,2141490,1058031,1999120,5355235,5120254,2607672],
    [list: 1140516,1938695,925060,1607297,4782119,4746856,3187797],
    [list: 894368,1558919,725973,1311479,3596343,3239173,1575308],
    [list: 737462,1345341,679201,1203944,3157759,3414001,1910571]],
  [list:
    'Under 5 Years',
    '5 to 13 Years',
    '14 to 17 Years',
    '18 to 24 Years',
    '25 to 44 Years',
    '45 to 64 Years',
    '65 Years and Over'])

stacked-bars-neg = from-list.stacked-bar-chart(
    [list: '2010', '2011', '2012', '2013', '2014', 
   '2015', '2016', '2017', '2018', '2019'],
  [list: 
    [list: -3.78, -1.14, -1.06, -3.54, -1.74, -1.23, 0.42],
    [list: -3.81, -1.18, -1.05, -3.56, -1.77, -1.25, 0.35],
    [list: -3.83, -1.21, -1.04, -3.58, -1.81, -1.27, 0.27],
    [list: -3.84, -1.24, -1.05, -3.60, -1.86, -1.29, 0.18],
    [list: -3.86, -1.27, -1.06, -3.61, -1.91, -1.31, 0.09],
    [list: -3.87, -1.29, -1.06, -3.63, -1.97, -1.33, 0],
    [list: -3.88, -1.31, -1.07, -3.64, -2.03, -1.35, -0.08],
    [list: -3.89, -1.32, -1.07, -3.66, -2.09, -1.36, -0.17],
    [list: -3.90, -1.33, -1.07, -3.67, -2.15, -1.38, -0.25],
    [list: -3.91, -1.34, -1.07, -3.68, -2.21, -1.39, -0.33]],
  [list: 'Asia', 'North America', 'Europe', 
     'South America', 'Africa', 'Oceania', 'Angola'])

stacked-bars-rep = from-list.stacked-bar-chart(
    [list: 'Liam', 'Elijah', 'Ava', 'Sophia', 'Ava', 'Emma'],
    [list: 
      [list: 10, 8, 10, 4, 8, 9, 7],
    [list: 9, 7, 8, 9, 5, 5, 8], 
      [list: 8, 10, 9, 4, 5, 10, 7],
      [list: 10, 6, 7, 4, 10, 6, 5], 
      [list: 8, 8, 9, 8, 4, 4, 5], 
      [list: 6, 9, 8, 6, 9, 10, 7]], 
    [list: 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
   'Friday', 'Saturday', 'Sunday'])

stacked-bars-repstacks = from-list.stacked-bar-chart(
    [list: 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
   'Friday', 'Saturday', 'Sunday'], 
    [list: 
      [list: 10, 9, 8, 10, 8, 6], 
      [list: 8, 7, 10, 6, 8, 9],
      [list: 10, 9, 9, 7, 9, 8], 
    [list: 4, 9, 4, 4, 8, 6], 
    [list: 8, 5, 5, 10, 4, 9], 
    [list: 9, 5, 10, 6, 4, 10], 
    [list: 7, 8, 7, 5, 5, 7]],
    [list: 'Liam', 'Elijah', 'Ava', 'Sophia', 'Ava', 'Emma'])

################################################################################
# Helper Functions -- Testing 
################################################################################

fun render-image(series):
  render-chart(series).get-image()
end

fun count-vowels(s): 
  fold(
    {(acc, elm): 
      if string-explode('aeiouAEIOU').member(elm): acc + 1
      else: acc
      end
    }, 0, string-explode(s))
end

################################################################################
# Actual Testing -- Check
################################################################################

#####################
# RENDERING TESTS 
#####################

check "Rendering: Single Bars":
  render-image(single-bars) satisfies is-image
  render-image(single-bars-neg) satisfies is-image
  render-image(single-bars-rep) satisfies is-image

  from-list.bar-chart(empty, empty)
  raises "can't have empty data"

  from-list.bar-chart([list: "label1", "label2"], [list: 1]) 
  raises "labels and values should have the same length"

  from-list.bar-chart([list: "label"], [list: 1, 2]) 
  raises "labels and values should have the same length"
end

check "Rendering: Grouped Bars": 
  render-image(grouped-bars) satisfies is-image
  render-image(grouped-bars-neg) satisfies is-image
  render-image(grouped-bars-rep) satisfies is-image
  render-image(grouped-bars-repgroups) satisfies is-image

  from-list.grouped-bar-chart(empty, empty, empty)
  raises "can't have empty data"

  from-list.grouped-bar-chart(
        [list: 'There', 'are', 'no', 'stacks'],
        [list: empty, empty, empty, empty], 
        empty) 
  raises "can't have empty legends"

  from-list.grouped-bar-chart(
        [list: 'Bar 1', 'Bar 2', 'Bar 3', 'Bar 4'],
        [list: [list: 1, 3], [list: 2, 2], [list: 0, -3]], 
        [list: 'Component 1', 'Component 2'])
  raises "labels and values should have the same length"
  
  from-list.grouped-bar-chart(
        [list: 'Bar 1', 'Bar 2'],
        [list: [list: 1, 3], [list: 2, 2], [list: 0, -3]], 
        [list: 'Component 1', 'Component 2']) 
  raises "labels and values should have the same length"
  
  from-list.grouped-bar-chart(
        [list: 'Bar 1', 'Bar 2', 'Bar 3', 'Bar 4'],
        [list: [list: 1, 3], [list: 2, 2], [list: 0, -3], [list: 1, 2]], 
        [list: 'Component 1', 'Component 2', 'Component 3'])
  raises "labels and legends should have the same length"

  from-list.grouped-bar-chart(
        [list: 'Bar 1', 'Bar 2', 'Bar 3', 'Bar 4'],
        [list: [list: 1, 3], [list: 2, 2], [list: 0, -3], [list: 1]], 
        [list: 'Component 1', 'Component 2'])
  raises "labels and legends should have the same length"
end

check "Rendering: Stacked Bars": 
  render-image(stacked-bars) satisfies is-image
  render-image(stacked-bars-neg) satisfies is-image
  render-image(stacked-bars-rep) satisfies is-image
  render-image(stacked-bars-repstacks) satisfies is-image

  from-list.stacked-bar-chart(empty, empty, empty)
  raises "can't have empty data"

  from-list.stacked-bar-chart(
        [list: 'There', 'are', 'no', 'stacks'],
        [list: empty, empty, empty, empty], 
        empty) 
  raises "can't have empty legends"

  from-list.stacked-bar-chart(
        [list: 'Bar 1', 'Bar 2', 'Bar 3', 'Bar 4'],
        [list: [list: 1, 3], [list: 2, 2], [list: 0, -3]], 
        [list: 'Component 1', 'Component 2'])
  raises "labels and values should have the same length"
  
  from-list.stacked-bar-chart(
        [list: 'Bar 1', 'Bar 2'],
        [list: [list: 1, 3], [list: 2, 2], [list: 0, -3]], 
        [list: 'Component 1', 'Component 2']) 
  raises "labels and values should have the same length"
  
  from-list.stacked-bar-chart(
        [list: 'Bar 1', 'Bar 2', 'Bar 3', 'Bar 4'],
        [list: [list: 1, 3], [list: 2, 2], [list: 0, -3], [list: 1, 2]], 
        [list: 'Component 1', 'Component 2', 'Component 3'])
  raises "labels and legends should have the same length"

  from-list.stacked-bar-chart(
        [list: 'Bar 1', 'Bar 2', 'Bar 3', 'Bar 4'],
        [list: [list: 1, 3], [list: 2, 2], [list: 0, -3], [list: 1]], 
        [list: 'Component 1', 'Component 2'])
  raises "labels and legends should have the same length"
end

######################
# COLOR METHOD TESTS 
######################

single-color = [list: red]
rainbow-colors = [list: red, orange, yellow, green, blue, indigo, violet]
manual-colors = 
  [list: 
    color(51, 72, 252, 0.57), color(195, 180, 104, 0.87), 
    color(115, 23, 159, 0.24), color(144, 12, 138, 0.13), 
    color(31, 132, 224, 0.83), color(166, 16, 72, 0.59), 
    color(58, 193, 241, 0.98)]
less-colors = [list: red, green, blue, orange, purple]
more-colors = [list: red, green, blue, orange, purple, yellow, indigo, violet]

check "Color Methods: Single Bars":
  render-image(single-bars.default-color(red)) satisfies is-image

  render-image(single-bars.colors(empty)) satisfies is-image
  render-image(single-bars.colors(single-color)) satisfies is-image
  render-image(single-bars.colors(rainbow-colors)) satisfies is-image
  render-image(single-bars.colors(manual-colors)) satisfies is-image
  render-image(single-bars.colors(less-colors)) satisfies is-image
  render-image(single-bars.colors(more-colors)) satisfies is-image
end

check "Color Methods: Grouped Bars":
  render-image(grouped-bars.colors(empty)) satisfies is-image
  render-image(grouped-bars.colors(single-color)) satisfies is-image
  render-image(grouped-bars.colors(rainbow-colors)) satisfies is-image
  render-image(grouped-bars.colors(manual-colors)) satisfies is-image
  render-image(grouped-bars.colors(less-colors)) satisfies is-image
  render-image(grouped-bars.colors(more-colors)) satisfies is-image
end

check "Color Methods: Stacked Bars":
  render-image(stacked-bars.colors(empty)) satisfies is-image
  render-image(stacked-bars.colors(single-color)) satisfies is-image
  render-image(stacked-bars.colors(rainbow-colors)) satisfies is-image
  render-image(stacked-bars.colors(manual-colors)) satisfies is-image
  render-image(stacked-bars.colors(less-colors)) satisfies is-image
  render-image(stacked-bars.colors(more-colors)) satisfies is-image
end

########################
# SORTING METHOD TESTS 
########################

#### CMP Functions ####
ascending-cmp = {(a, b): a < b}
descending-cmp = {(a, b): a > b}
descending-str-len = {(a, b): string-length(a) > string-length(b)}
ascending-even-priority = 
  {(a, b):
    ask: 
      | num-modulo(a, 2) == num-modulo(b, 2) then: a < b
      | num-modulo(a, 2) == 0 then: true 
      | num-modulo(b, 2) == 0 then: false
    end}
ascending-vowels = {(a, b): count-vowels(a) < count-vowels(b)}

#### EQ Functions ####
vanilla-eq = {(a, b): a == b}
str-len-eq = {(a, b): string-length(a) == string-length(b)}
vowel-eq = {(a, b): count-vowels(a) == count-vowels(b)}

#### Scoring Functions ####
  sum = {(l): fold({(acc, elm): acc + elm}, 0, l)}
  get-first = {(l): l.get(0)}
  pos-only-sum = {(l): sum(filter({(elm): elm > 0}, l))}
  priority-scoring = 
    {(coeff, l): fold2({(acc, e1, e2): acc + (e1 * e2)}, 0, coeff, l)}
  weekend-weekday-scoring = 
    {(l): priority-scoring([list: 1, 1, 1, 1, 1, -1, -1], l)}

check "Sorting Methods: Single Bars":
  render-image(single-bars.sort-by(ascending-cmp, vanilla-eq)) satisfies is-image
  render-image(single-bars.sort-by(descending-cmp, vanilla-eq)) satisfies is-image
  render-image(single-bars.sort-by(ascending-even-priority, vanilla-eq)) satisfies is-image

  render-image(single-bars.sort-by-label(ascending-cmp, vanilla-eq)) satisfies is-image
  render-image(single-bars.sort-by-label(descending-cmp, vanilla-eq)) satisfies is-image
  render-image(single-bars.sort-by-label(descending-str-len, str-len-eq)) satisfies is-image
  render-image(single-bars.sort-by-label(ascending-vowels, vowel-eq)) satisfies is-image
end

check "Sorting Methods: Stacked Bars":
  render-image(stacked-bars.sort-by(ascending-cmp, vanilla-eq)) satisfies is-image
  render-image(stacked-bars.sort-by(descending-cmp, vanilla-eq)) satisfies is-image
  render-image(stacked-bars.sort-by(ascending-even-priority, vanilla-eq)) satisfies is-image

  render-image(stacked-bars.sort-by-label(ascending-cmp, vanilla-eq)) satisfies is-image
  render-image(stacked-bars.sort-by-label(descending-cmp, vanilla-eq)) satisfies is-image
  render-image(stacked-bars.sort-by-label(ascending-vowels, vowel-eq)) satisfies is-image

  render-image(stacked-bars.sort-by-data(sum, ascending-cmp, vanilla-eq)) satisfies is-image
  render-image(stacked-bars.sort-by-data(sum, descending-cmp, vanilla-eq)) 
  satisfies is-image
  render-image(stacked-bars.sort-by-data(sum, ascending-even-priority, vanilla-eq)) 
  satisfies is-image
  render-image(stacked-bars.sort-by-data(get-first, descending-cmp, vanilla-eq)) 
  satisfies is-image
  render-image(stacked-bars-neg.sort-by-data(pos-only-sum, ascending-cmp, vanilla-eq)) 
  satisfies is-image
  render-image(
    stacked-bars-rep.sort-by-data(weekend-weekday-scoring, ascending-cmp, vanilla-eq)) 
  satisfies is-image
end