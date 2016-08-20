# provide  {
#   line-plot: line-plot,
#   is-line-plot: is-line-plot,
#
#   scatter-plot: scatter-plot,
#   is-scatter-plot: is-scatter-plot,
#
#   function-plot: function-plot,
#   is-function-plot: is-function-plot,
#
#   display-function: display-function,
#   display-scatter: display-scatter,
#   display-line: display-line,
#
#   display-multi-plot: display-multi-plot,
#   default-options: default-options,
#   default-window-options: default-window-options,
#
#   histogram: histogram,
#   pie-chart: pie-chart,
#   bar-chart: bar-chart,
#   grouped-bar-chart: grouped-bar-chart
# } end

provide *

provide-types {
  Plot :: Plot,
  PlotOptions :: WrappedPlotOptions,
  PlotWindowOptions :: WrappedPlotWindowOptions
}

import global as G
import base as B
import image-structs as I
include lists
import plot-lib as P
import either as E
import string-dict as SD

OFFSET = 1
MAX-SAMPLES = 100000

type PlotOptions = {
  color :: I.Color
}

plot-options :: PlotOptions = {
  color: I.blue
}

type PlotWindowOptions = {
  x-min :: Number,
  x-max :: Number,
  y-min :: Number,
  y-max :: Number,
  num-samples :: Number,
  infer-bounds :: Boolean
}

plot-window-options :: PlotWindowOptions = {
  x-min: -10,
  x-max: 10,
  y-min: -10,
  y-max: 10,
  num-samples: 1000,
  infer-bounds: false
}

type WrappedPlotOptions = (PlotOptions -> PlotOptions)
type WrappedPlotWindowOptions = (PlotWindowOptions -> PlotWindowOptions)
type PlottableFunction = (Number -> Number)
type Posn = RawArray<Number>
type TableInt = RawArray<Posn>

data Plot:
  | line-plot(points :: Table, options :: WrappedPlotOptions)
  | scatter-plot(points :: Table, options :: WrappedPlotOptions)
  | function-plot(f :: PlottableFunction, options :: WrappedPlotOptions)
end

data PlotInternal:
  | line-plot-int(points :: TableInt, options :: PlotOptions)
  | scatter-plot-int(points :: TableInt, options :: PlotOptions)
  | function-plot-int(f :: PlottableFunction, options :: PlotOptions)
end


id = {<A>(x :: A): x}
default-options = id
default-window-options = id

fun posn(x :: Number, y :: Number) -> Posn:
  [raw-array: x, y]
end

fun histogram(title :: String, tab :: Table, n :: Number) -> Table block:
  doc: 'Consume a table with one column: `value`, and a number of bins, and show a histogram'
  when not(tab._header-raw-array =~ [raw-array: 'value']):
    raise('histogram: expect a table with a column named `value`')
  end
  when (n < 1) or (n > 100) or not(num-is-integer(n)):
    raise('histogram: expect `n` to be an integer between 1 and 100 (inclusive)')
  end
  when raw-array-length(tab._rows-raw-array) == 0:
    raise('histogram: expect the table to have at least one row')
  end
  P.histogram(tab._rows-raw-array, n, title)
  tab
where:
  histogram(
    'My histogram',
    table: value :: Number
      row: 1
      row: 1.2
      row: 2
      row: 3
      row: 10
      row: 3
      row: 6
      row: -1
    end,
    4) does-not-raise
end

fun pie-chart(title :: String, tab :: Table) -> Table block:
  doc: 'Consume a table with two columns: `label` and `value`, and show a pie-chart'
  when not(tab._header-raw-array =~ [raw-array: 'label', 'value']):
    raise('pie-chart: expect a table with columns named `label` and `value`')
  end
  when raw-array-length(tab._rows-raw-array) == 0:
    raise('pie-chart: expect the table to have at least one row')
  end
  P.pie-chart(tab._rows-raw-array, title)
  tab
where:
  pie-chart('My pie chart', table: label, value
    row: 'asd', 1
    row: 'dsa', 2
    row: 'qwe', 3
  end) does-not-raise
end

fun bar-chart(title :: String, tab :: Table, legend :: String) -> Table block:
  when not(tab._header-raw-array =~ [raw-array: 'label', 'value']):
    raise('expect a table with two columns: label and value')
  end
  shadow tab = transform tab using value:
    value: [list: value]
  end
  _ = P.bar-chart(tab._rows-raw-array, [list: ''], title, false)
  tab
end

fun grouped-bar-chart(
  title :: String,
  tab :: Table,
  legend :: List<String>
) -> Table block:
  when not(tab._header-raw-array =~ [raw-array: 'label', 'values']):
    raise('expect a table with two columns: label and values')
  end
  P.bar-chart(tab._rows-raw-array, legend, title, true)
  tab
where:
  grouped-bar-chart(
    'My bar chart',
    table: label, values
      row: 'CA', [list: 2704659,4499890,2159981,3853788,10604510,8819342,4114496]
      row: 'TX', [list: 2027307,3277946,1420518,2454721,7017731,5656528,2472223]
      row: 'NY', [list: 1208495,2141490,1058031,1999120,5355235,5120254,2607672]
      row: 'FL', [list: 1140516,1938695,925060,1607297,4782119,4746856,3187797]
      row: 'IL', [list: 894368,1558919,725973,1311479,3596343,3239173,1575308]
      row: 'PA', [list: 737462,1345341,679201,1203944,3157759,3414001,1910571]
    end, [list:
      'Under 5 Years',
      '5 to 13 Years',
      '14 to 17 Years',
      '18 to 24 Years',
      '25 to 44 Years',
      '45 to 64 Years',
      '65 Years and Over']) does-not-raise
end

fun generate-xy(
  plot :: PlotInternal,
  win-opt :: PlotWindowOptions
) -> PlotInternal:
  doc: 'Generate a scatter-plot from an function-plot'
  fraction = (win-opt.x-max - win-opt.x-min) / (win-opt.num-samples - 1)
  cases (PlotInternal) plot:
    | function-plot-int(f, options) =>
      for filter-map(i from range(0, win-opt.num-samples)):
        x = win-opt.x-min + (fraction * i)
        cases (E.Either) run-task({(): f(x)}):
          | left(y) => some([raw-array: x, y])
          | right(v) => none
        end
      end
        ^ builtins.list-to-raw-array
        ^ scatter-plot-int(_, options)
    | else => raise('internal-plot: expect function-plot, got other')
  end
where:
  win-options = {
    x-min: 0,
    x-max: 100,
    y-min: 0,
    y-max: 100,
    num-samples: 6,
    infer-bounds: false
  }
  generate-xy(function-plot-int(_ + 1, plot-options), win-options)
    is scatter-plot-int([raw-array:
      posn(0, 1),
      posn(20, 21),
      posn(40, 41),
      posn(60, 61),
      posn(80, 81),
      posn(100, 101) # out of bound, will be filtered later
    ], plot-options)
end

fun display-function(title :: String, f :: PlottableFunction) -> PlottableFunction:
  _ = display-multi-plot(
    title,
    [list: function-plot(f, default-options)],
    default-window-options)
  f
where:
  plot-function('My function', num-sin)
end

fun display-scatter(title :: String, tab :: Table) -> Table:
  _ = display-multi-plot(
    title,
    [list: scatter-plot(tab, default-options)],
    default-window-options)
  tab
where:
  plot-scatter('My scatter', table: x, y
    row: 1, 2
    row: 1, 3.1
    row: 4, 1
    row: 7, 3
    row: 4, 6
    row: 2, 5
  end)
end

fun display-line(title :: String, tab :: Table) -> Table:
  _ = display-multi-plot(
    title,
    [list: line-plot(tab, default-options)],
    default-window-options)
  tab
where:
  plot-line('My line', table: x, y
    row: 1, 2
    row: 1, 3.1
    row: 4, 1
    row: 7, 3
    row: 4, 6
    row: 2, 5
  end)
end

fun display-multi-plot(
  title :: String,
  plots :: List<Plot>,
  options-generator :: WrappedPlotWindowOptions
) -> List<Plot> block:
  options = options-generator(plot-window-options)
  when (options.x-min >= options.x-max) or (options.y-min >= options.y-max):
    raise('plot: x-min and y-min must be strictly less than x-max and y-max respectively')
  end
  when (options.num-samples > MAX-SAMPLES) or
       (options.num-samples <= 1) or
       not(num-is-integer(options.num-samples)):
    raise('plot: num-samples must be an an integer greater than 1 and do not exceed ' + num-to-string(MAX-SAMPLES))
  end

  original-plots = plots
  shadow plots = plots.map(
    lam(plot :: Plot) -> PlotInternal:
      cases (Plot) plot block:
        | scatter-plot(points, opt-gen) =>
          when not(points._header-raw-array =~ [raw-array: 'x', 'y']):
            raise('plot: expect the table for scatter-plot to have two columns: `x` and `y`')
          end
          scatter-plot-int(
            points._rows-raw-array,
            opt-gen(plot-options).{opacity: 80,  size: 4, tip: true})
        | line-plot(points, opt-gen) =>
          when not(points._header-raw-array =~ [raw-array: 'x', 'y']):
            raise('plot: expect the table for line-plot to have two columns: `x` and `y`')
          end
          line-plot-int(
            points._rows-raw-array,
            opt-gen(plot-options).{opacity: 100, size: 1, tip: false})
        | function-plot(f, opt-gen) =>
          function-plot-int(
            f,
            opt-gen(plot-options).{opacity: 100, size: 1, tip: false})
      end
    end)

  partitioned = partition(is-function-plot-int, plots)
  function-plots = partitioned.is-true
  line-and-scatter = partitioned.is-false

  shadow options = if options.infer-bounds:
    points = line-and-scatter.map(
      lam(plot :: PlotInternal):
        cases (PlotInternal) plot:
          | function-plot-int(_, _) => raise('internal-plot: function-plot not filtered')
          | line-plot-int(points, _) => raw-array-to-list(points)
          | scatter-plot-int(points, _) => raw-array-to-list(points)
        end
      end).foldl(_ + _, empty)

    cases (List) points:
      | empty => options
      | link(f, r) =>

        fun bound(ps :: List<Posn>,
            base :: Posn,
            op :: (Number, Number -> Number),
            accessor :: (Posn -> Number)) -> Number:
          for fold(acc from accessor(base), p from points):
            op(accessor(p), acc)
          end
        end

        options.{
          x-min: bound(r, f, num-min, raw-array-get(_, 0)) - OFFSET,
          x-max: bound(r, f, num-max, raw-array-get(_, 0)) + OFFSET,
          y-min: bound(r, f, num-min, raw-array-get(_, 1)) - OFFSET,
          y-max: bound(r, f, num-max, raw-array-get(_, 1)) + OFFSET,
          infer-bounds: false
        }
    end
  else:
    options
  end

  shadow partitioned = partition(is-line-plot-int, line-and-scatter)
  line-plots = partitioned.is-true
  scatter-plots = partitioned.is-false

  fun helper(shadow options :: PlotWindowOptions) -> List<Plot>:
    shadow function-plots = function-plots.map(generate-xy(_, options))
    maybe-new-options = P.plot-multi(
      function-plots + scatter-plots,
      line-plots,
      options,
      title)
    cases (Option<PlotWindowOptions>) maybe-new-options:
      | none => original-plots
      | some(new-options) => helper(new-options)
    end
  end

  helper(options)
end

default-plot-color-list = [list: I.green, I.red, I.orange, I.yellow, I.blue, I.purple, I.brown]

fun display-plots(title, infer-bounds, plots):
  len = default-plot-color-list.length()
  new-plots = for map_n(n from 0, p from plots):
    c = lam(x): {color: default-plot-color-list.get(num-modulo(n, len)) } end
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
  function-plot(f, _.{color: I.blue})
end
make-line-plot = lam(t):
  line-plot(t, _.{color: I.blue})
end
make-scatter-plot = lam(t):
  scatter-plot(t, _.{color: I.blue})
end


