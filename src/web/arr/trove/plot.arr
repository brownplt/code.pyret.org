provide  {
  line-plot: line-plot,
  is-line-plot: is-line-plot,

  scatter-plot: scatter-plot,
  is-scatter-plot: is-scatter-plot,

  function-plot: function-plot,
  is-function-plot: is-function-plot,

  plot-function: plot-function,
  plot-scatter: plot-scatter,
  plot-line: plot-line,

  plot-multi: plot-multi,
  default-options: default-options,

  histogram: histogram,
  pie-chart: pie-chart
} end

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

type Table = Any # for now

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

default-options = {<A>(x :: A): x}

data Pair<a, b>:
  | pair(first :: a, second :: b)
end

fun posn(x :: Number, y :: Number) -> Posn:
  [raw-array: x, y]
end

fun histogram(tab :: Table, n :: Number) -> Table block:
  doc: "Consume a table with one column: `value`, and a number of bins, and show a histogram"
  when not(tab._header-raw-array =~ [raw-array: "value"]):
    raise("histogram: expect a table with a column named `value`")
  end
  when (n < 1) or (n > 100) or not(num-is-integer(n)):
    raise("histogram: expect `n` to be an integer between 1 and 100 (inclusive)")
  end
  when raw-array-length(tab._rows-raw-array) == 0:
    raise("histogram: expect the table to have at least one row")
  end
  P.histogram(tab._rows-raw-array, n)
  tab
end

fun pie-chart(tab :: Table) -> Table block:
  doc: "Consume a table with two columns: `label` and `value`, and show a pie-chart"
  when not(tab._header-raw-array =~ [raw-array: "label", "value"]):
    raise("pie-chart: expect a table with columns named `label` and `value`")
  end
  when raw-array-length(tab._rows-raw-array) == 0:
    raise("pie-chart: expect the table to have at least one row")
  end
  P.pie-chart(tab._rows-raw-array)
  tab
end

fun generate-xy(plot :: PlotInternal, win-opt :: PlotWindowOptions) -> PlotInternal:
  doc: "Generate a scatter-plot from an function-plot"
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
    | else => raise("plot: expect function-plot, got other")
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

fun plot-function(f :: PlottableFunction) -> PlottableFunction block:
  plot-multi([list: function-plot(f, default-options)], default-options)
  f
end

fun plot-scatter(tab :: Table) -> Table block:
  plot-multi([list: scatter-plot(tab, default-options)], default-options)
  tab
end

fun plot-line(tab :: Table) -> Table block:
  plot-multi([list: line-plot(tab, default-options)], default-options)
  tab
end

fun plot-multi(plots :: List<Plot>, options-generator :: WrappedPlotWindowOptions) -> List<Plot> block:
  options = options-generator(plot-window-options)
  when (options.x-min >= options.x-max) or (options.y-min >= options.y-max):
    raise("plot: x-min and y-min must be strictly less than x-max and y-max respectively")
  end
  when (options.num-samples > MAX-SAMPLES) or
       (options.num-samples <= 1) or
       not(num-is-integer(options.num-samples)):
    raise("plot: num-samples must be an an integer greater than 1 and do not exceed " + num-to-string(MAX-SAMPLES))
  end

  original-plots = plots
  shadow plots = plots.map(
    lam(plot :: Plot) -> PlotInternal:
      cases (Plot) plot block:
        | scatter-plot(points, opt-gen) =>
          when not(points._header-raw-array =~ [raw-array: "x", "y"]):
            raise("plot: expect the table for scatter-plot to have two columns: `x` and `y`")
          end
          scatter-plot-int(
            points._rows-raw-array,
            opt-gen(plot-options).{opacity: 80,  size: 4, tip: true})
        | line-plot(points, opt-gen) =>
          when not(points._header-raw-array =~ [raw-array: "x", "y"]):
            raise("plot: expect the table for line-plot to have two columns: `x` and `y`")
          end
          line-plot-int(
            if raw-array-length(points._rows-raw-array) <> 1:
              points._rows-raw-array
            else:
              row = raw-array-get(points._rows-raw-array, 0)
              [raw-array: row, row]
            end,
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
          | function-plot-int(_, _) => raise("plot: function-plot not filtered")
          | line-plot-int(points, _) => raw-array-to-list(points)
          | scatter-plot-int(points, _) => raw-array-to-list(points)
        end
      end).foldl(_ + _, empty)

    cases (List) points:
      | empty => options.{num-samples: options.num-samples}
      | link(f, r) =>

        fun bound(ps :: List<Posn>,
            base :: Posn,
            op :: (Number, Number -> Number),
            accessor :: (Posn -> Number)) -> Number:
          for fold(acc from accessor(base), p from points):
            op(accessor(p), acc)
          end
        end

        win-opt-ret :: PlotWindowOptions = {
          x-min: bound(r, f, num-min, raw-array-get(_, 0)) - OFFSET,
          x-max: bound(r, f, num-max, raw-array-get(_, 0)) + OFFSET,
          y-min: bound(r, f, num-min, raw-array-get(_, 1)) - OFFSET,
          y-max: bound(r, f, num-max, raw-array-get(_, 1)) + OFFSET,
          num-samples: options.num-samples,
          infer-bounds: false
        }
        win-opt-ret
    end
  else:
    options
  end

  shadow partitioned = partition(is-line-plot-int, line-and-scatter)
  line-plots = partitioned.is-true
  scatter-plots = partitioned.is-false

  fun helper(shadow options :: PlotWindowOptions) -> List<Plot>:
    shadow function-plots = function-plots.map(generate-xy(_, options))
    maybe-new-options = P.plot-multi(function-plots + scatter-plots, line-plots, options)
    cases (Option<PlotWindowOptions>) maybe-new-options:
      | none => original-plots
      | some(new-options) => helper(new-options)
    end
  end

  helper(options)
end
