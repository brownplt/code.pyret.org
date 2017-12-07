provide *

import global as G
import base as B
import image-structs as I
import image as IM
include lists
import sets as S
import plot-lib-list as P
import either as E
import string-dict as SD
import valueskeleton as VS

################################################################################
# HELPERS
################################################################################

fun sprintf-maker():
  generic-sprintf = lam(arr :: RawArray<Any>):
    raw-array-fold(lam(str, elt, _): str + tostring(elt) end, "", arr, 0)
  end
  {
    make5: {(a, b, c, d, e): generic-sprintf([raw-array: a, b, c, d, e])},
    make4: {(a, b, c, d): generic-sprintf([raw-array: a, b, c, d])},
    make3: {(a, b, c): generic-sprintf([raw-array: a, b, c])},
    make2: {(a, b): generic-sprintf([raw-array: a, b])},
    make1: tostring,
    make0: {(): ''},
    make: generic-sprintf
  }
end

sprintf = sprintf-maker()
unsafe-equal = {(x :: Number, y :: Number): (x <= y) and (y <= x)}

################################################################################
# DATA DEFINITIONS
################################################################################

type PlottableFunction = (Number -> Number)

type SeriesOptions = {
  color :: I.Color
}

default-series-options = {color: I.blue}

data Series:
  | line-plot-series(xs :: List<Number>, ys :: List<Number>, options :: SeriesOptions) with:
    method color(self, color :: I.Color) -> Series:
      line-plot-series(self.xs, self.ys, self.options.{color: color})
    end,
    typ: 'line-plot'
  | function-plot-series(f :: PlottableFunction, options :: SeriesOptions) with:
    method color(self, color :: I.Color) -> Series:
      function-plot-series(self.f, self.options.{color: color})
    end,
    typ: 'function-plot'
  | scatter-plot-series(xs :: List<Number>, ys :: List<Number>, options :: SeriesOptions) with:
    method color(self, color :: I.Color) -> Series:
      scatter-plot-series(self.xs, self.ys, self.options.{color: color})
    end,
    typ: 'scatter-plot'
  | pie-chart-series(labels :: List<String>, values :: List<Number>, radiuses :: List<Number>) with:
    typ: 'pie-chart'
  | bar-chart-series(labels :: List<String>, value-lists :: List<List<Number>>, maybe-legends :: Option<List<String>>) with:
    typ: 'bar-chart'
  | histogram-series(values :: List<Number>, n :: Number) with:
    typ: 'histogram'
sharing:
  method _output(self :: Series) -> VS.ValueSkeleton:
    VS.vs-constr(self.typ + "-like-series", [list: VS.vs-str("...")])
  end
end

type Posn = RawArray<Number>
type TableInt = RawArray<Posn>

data PlotInternal:
  | line-plot-int(points :: TableInt, options :: SeriesOptions)
  | scatter-plot-int(points :: TableInt, options :: SeriesOptions)
  | function-plot-int(f :: PlottableFunction, options :: SeriesOptions)
end

type PlotObject = {
  _title :: String,
  _extend-x :: Number,
  _extend-y :: Number,
  #_x-axis :: String,
  #_y-axis :: String,
  #_x-min :: Number,
  #_x-max :: Number,
  #_y-min :: Number,
  #_y-max :: Number,
  #_num-samples :: Number,
  #_infer-bounds :: Boolean,

  # methods (use Any as type synonyms don't allow recursive types)
  x-axis :: (String -> Any),
  y-axis :: (String -> Any),
  x-min :: (Number -> Any),
  x-max :: (Number -> Any),
  y-min :: (Number -> Any),
  y-max :: (Number -> Any),
  num-samples :: (Number -> Any),
  infer-bounds :: (Boolean -> Any),

  _render :: ( -> IM.Image),

  display :: ( -> IM.Image),
  get-image :: ( -> IM.Image),

  _output :: ( -> VS.ValueSkeleton)
}

fun check-plot-object(p :: PlotObject) -> Nothing block:
  when (p._extend-x < 0) or (p._extend-x > 1):
    raise('plot: extend-x must be between 0 and 1')
  end
  when (p._extend-y < 0) or (p._extend-y > 1):
    raise('plot: extend-y must be between 0 and 1')
  end
  nothing
end

plot-object-base :: PlotObject = {
  _series: empty,
  _title: '',
  _extend-x: 0,
  _extend-y: 0,
  method title(self, title :: String):
    self.{_title: title}
  end,
  method extend-x(self, extend-x :: Number):
    self.{_extend-x: extend-x}
  end,
  method extend-y(self, extend-y :: Number):
    self.{_extend-y: extend-y}
  end,

  # OPERATION NOT SUPPORTED (UNLESS OVERRIDDEN)

  method x-axis(self, x-axis :: String):
    raise("x-axis: operation not supported")
  end,
  method y-axis(self, y-axis :: String):
    raise("y-axis: operation not supported")
  end,
  method x-min(self, x-min :: Number):
    raise("x-min: operation not supported")
  end,
  method x-max(self, x-max :: Number):
    raise("x-max: operation not supported")
  end,
  method y-min(self, y-min :: Number):
    raise("y-min: operation not supported")
  end,
  method y-max(self, y-max :: Number):
    raise("y-max: operation not supported")
  end,
  method num-samples(self, num-samples :: Number):
    raise("num-samples: operation not supported")
  end,
  method infer-bounds(self, infer-bounds :: Boolean):
    raise("infer-bounds: operation not supported")
  end,

  method display(self):
    _ = check-plot-object(self)
    self.{_interact: true}._render()
  end,
  method get-image(self):
    _ = check-plot-object(self)
    self.{_interact: false}._render()
  end,
  method _output(self) -> VS.ValueSkeleton:
    VS.vs-constr("plot-object", [list: VS.vs-str("...")])
  end,

  method _render(self):
    raise("render: this should not happen")
  end
}

plot-object-axis :: PlotObject = plot-object-base.{
  _x-axis: '',
  _y-axis: '',
  method x-axis(self, x-axis :: String):
    self.{_x-axis: x-axis}
  end,
  method y-axis(self, y-axis :: String):
    self.{_y-axis: y-axis}
  end,
}

plot-object-xy :: PlotObject = plot-object-axis.{
  _x-min: -10,
  _x-max: 10,
  _y-min: -10,
  _y-max: 10,
  _num-samples: 1000,
  _infer-bounds: true,

  method x-min(self, x-min :: Number):
    self.{_x-min: x-min, _infer-bounds: false}
  end,
  method x-max(self, x-max :: Number):
    self.{_x-max: x-max, _infer-bounds: false}
  end,
  method y-min(self, y-min :: Number):
    self.{_y-min: y-min, _infer-bounds: false}
  end,
  method y-max(self, y-max :: Number):
    self.{_y-max: y-max, _infer-bounds: false}
  end,
  method num-samples(self, num-samples :: Number) block:
    when (num-samples <= 0) or (num-samples > 100000):
      raise("num-samples: value must be between 1 and 100000")
    end
    self.{_num-samples: num-samples}
  end,
  method infer-bounds(self, infer-bounds :: Boolean):
    self.{_infer-bounds: infer-bounds}
  end
}

################################################################################
# CONSTANTS
################################################################################

# these are series that can only be singly plotted
SINGLE-SERIES = [list: is-pie-chart-series, is-bar-chart-series, is-histogram-series]

################################################################################
# FUNCTIONS
################################################################################

fun line-plot(xs :: List<Number>, ys :: List<Number>) -> Series block:
  when xs.length() <> ys.length():
    raise('line-plot: xs and ys should have the same length')
  end
  line-plot-series(xs, ys, default-series-options)
end

function-plot = function-plot-series(_, default-series-options)

fun scatter-plot(xs :: List<Number>, ys :: List<Number>) -> Series block:
  when xs.length() <> ys.length():
    raise('scatter-plot: xs and ys should have the same length')
  end
  scatter-plot-series(xs, ys, default-series-options)
end

fun adjustable-pie-chart(labels :: List<String>, values :: List<Number>, radiuses :: List<Number>) -> Series block:
  label-length = labels.length()
  value-length = values.length()
  when label-length <> value-length:
    raise('adjustable-pie-chart: labels and values should have the same length')
  end
  radius-length = radiuses.length()
  when label-length <> radius-length:
    raise('adjustable-pie-chart: labels and radiuses should have the same length')
  end
  when label-length == 0:
    raise('adjustable-pie-chart: need at least one data')
  end
  pie-chart-series(labels, values, radiuses)
end

fun pie-chart(labels :: List<String>, values :: List<Number>) -> Series block:
  doc: ```
       Consume labels, a list of string, and values, a list of numbers
       and construct a pie chart
       ```
  label-length = labels.length()
  value-length = values.length()
  when label-length <> value-length:
    raise('pie-chart: labels and values should have the same length')
  end
  when label-length == 0:
    raise('pie-chart: need at least one data')
  end
  pie-chart-series(labels, values, repeat(labels.length(), 1))
end

fun bar-chart(labels :: List<String>, values :: List<Number>) -> Series block:
  doc: ```
       Consume labels, a list of string, and values, a list of numbers
       and construct a bar chart
       ```
  label-length = labels.length()
  value-length = values.length()
  when label-length <> value-length:
    raise('bar-chart: labels and values should have the same length')
  end
  bar-chart-series(labels, values.map({(v): [list: v]}), none)
end

fun grouped-bar-chart(labels :: List<String>, value-lists :: List<Number>, legends :: List<String>) -> Series block:
  label-length = labels.length()
  value-length = value-lists.length()
  when label-length == 0:
    raise("grouped-bar-chart: can't have empty data")
  end
  when label-length <> value-length:
    raise('grouped-bar-chart: labels and values should have the same length')
  end
  when legends.length() <> value-lists.first.length():
    raise('grouped-bar-chart: labels and legends should have the same length')
  end
  bar-chart-series(labels, value-lists, some(legends))
end

fun freq-bar-chart(label :: List<String>) -> Series block:
  dict = for fold(prev from [SD.string-dict: ], e from label):
    prev.set(e, prev.get(e).or-else(0) + 1)
  end
  {ls; vs; _} = for fold({ls; vs; seen} from {empty; empty; S.empty-tree-set},
      e from label):
    if seen.member(e):
      {ls; vs; seen}
    else:
      {link(e, ls); link(dict.get-value(e), vs); seen.add(e)}
    end
  end
  bar-chart(ls.reverse(), vs.reverse())
end

fun histogram(values :: List<Number>, n :: Number) -> Series block:
  doc: ```
       Consume a list of numbers, and a number of bins,
       and construct a histogram
       ```
  when (n < 1) or (n > 100) or not(num-is-integer(n)):
    raise('histogram: expect `n` to be an integer between 1 and 100 (inclusive)')
  end
  when is-empty(values):
    raise('histogram: expect the list to have at least one element')
  end
  histogram-series(values, n)
end

#|
   fun dot-chart(
    tab :: Table,
    options-generator :: WrappedDotChartWindowOptions) -> IM.Image block:
  # UNFINISHED
  when not(tab._header-raw-array =~ [raw-array: 'label', 'value']):
    raise('expect a table with two columns: label and values')
  end
  extend tab using value:
    _dummy: block:
      when (value < 0) or (value > 40):
        raise(
          [sprintf:
            "a value in dot-chart ",
            value,
            " is not in the range"])
      end
    end
  end
  options = options-generator(dot-chart-window-options)
  _ = check-base-window-options(options)
  P.dot-chart(options, tab._rows-raw-array)
   end

   fun box-chart(
    tab :: Table,
    options-generator :: WrappedBoxChartWindowOptions) -> IM.Image block:
  # UNFINISHED
  when not(tab._header-raw-array =~ [raw-array: 'label', 'values']):
    raise('expect a table with two columns: label and values')
  end
  options = options-generator(dot-chart-window-options)
  _ = check-base-window-options(options)
  P.box-chart(options, tab._rows-raw-array)
   end
|#

fun plot(s :: Series) -> PlotObject:
  cases (Series) s:
    | line-plot-series(_, _, _) => plots([list: s])
    | function-plot-series(_, _) => plots([list: s])
    | scatter-plot-series(_, _, _) => plots([list: s])
    | pie-chart-series(labels, values, radiuses) =>
      plot-object-base.{
        method _render(self):
          P.pie-chart(self, map3(
              {(l :: String, v :: Number, r :: Number): [raw-array: l, v, r]},
              labels,
              values,
              radiuses) ^ builtins.raw-array-from-list)
        end
      }
    | bar-chart-series(labels, value-lists, maybe-legends) =>
      plot-object-axis.{
        method _render(self):
          legends = cases (Option) maybe-legends:
            | none => [list: '']
            | some(shadow legends) => legends
          end
          P.bar-chart(self, map2(
              {(l :: String, vs :: List<Number>): [raw-array: l, vs]},
              labels,
              value-lists) ^ builtins.raw-array-from-list, legends, is-some(maybe-legends))
        end
      }
    | histogram-series(values, n) =>
      plot-object-axis.{
        method _render(self):
          shadow values = values.map({(x): [raw-array: x]})
          P.histogram(self, builtins.raw-array-from-list(values), n)
        end
      }
  end
where:
  plot-now = {(x): plot(x).get-image()}

  plot-now(adjustable-pie-chart(
      [list: 'asd', 'dsa', 'qwe'],
      [list: 1, 2, 3],
      [list: 1, 2, 3])) does-not-raise
  plot-now(pie-chart([list: 'asd', 'dsa', 'qwe'], [list: 1, 2, 3])) does-not-raise
  plot-now(histogram([list: 1, 1.2, 2, 3, 10, 3, 6, -1], 4)) does-not-raise
  plot-now(grouped-bar-chart(
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
        '65 Years and Over'])) does-not-raise
  plot-now(function-plot(num-sin)) does-not-raise
  plot-now(scatter-plot(
      [list: 1, 1, 4, 7, 4, 2],
      [list: 2, 3.1, 1, 3, 6, 5])) does-not-raise
  plot-now(line-plot(
      [list: 1, 1, 4, 7, 4, 2],
      [list: 2, 3.1, 1, 3, 6, 5])) does-not-raise
end

fun generate-xy(
    p :: PlotInternal,
    obj :: PlotObject) -> PlotInternal:
  doc: 'Generate a scatter-plot from an function-plot'
  fraction = (obj._x-max - obj._x-min) / (obj._num-samples - 1)
  cases (PlotInternal) p:
    | function-plot-int(f, options) =>
      for filter-map(i from range(0, obj._num-samples)):
        x = obj._x-min + (fraction * i)
        cases (E.Either) run-task({(): f(x)}):
          | left(y) => some([raw-array: x, y])
          | right(v) => none
        end
      end
        ^ builtins.raw-array-from-list
        ^ scatter-plot-int(_, options)
    | else => raise('int-plot: expect function-plot, got other')
  end
where:
  obj = plot(function-plot(_ + 1))
    .x-min(0)
    .x-max(100)
    .y-min(0)
    .y-max(100)
    .num-samples(6)
  fun posn(x :: Number, y :: Number) -> Posn:
    [raw-array: x, y]
  end
  generate-xy(function-plot-int(_ + 1, default-series-options), obj)
    is=~ scatter-plot-int([raw-array:
      posn(0, 1),
      posn(20, 21),
      posn(40, 41),
      posn(60, 61),
      posn(80, 81),
      posn(100, 101) # out of bound, will be filtered later
    ], default-series-options)
end

fun plots(lst :: List<Series>) -> PlotObject block:
  doc: "plot 'em all"
  len = lst.length()
  maybe-single-series = find(
    lam(series :: Series):
      any({(is-series :: (Series -> Boolean)): is-series(series)}, SINGLE-SERIES)
    end,
    lst)
  ask block:
    | len == 0 then: raise('plots: need at least one series to plot')
    | (len == 1) and is-some(maybe-single-series) then: plot(lst.first)
    | otherwise:
      when is-some(maybe-single-series):
        raise([sprintf: "plots: can't plot ", maybe-single-series.value,
            " along with other plots"])
      end
      plot-object-xy.{
        method _render(self) block:
          when (self._x-min >= self._x-max) or (self._y-min >= self._y-max):
            raise(
              [sprintf:
                'render: x-min and y-min must be strictly less than x-max and y-max ',
                'respectively'])
          end
          shadow lst = lst.map(
            lam(s :: Series) -> PlotInternal:
              cases (Series) s block:
                | scatter-plot-series(xs, ys, options) =>
                  scatter-plot-int(
                    builtins.raw-array-from-list(
                      map2({(x, y): [raw-array: x, y]}, xs, ys)),
                    options.{opacity: 80,  size: 4, tip: true})
                | line-plot-series(xs, ys, options) =>
                  line-plot-int(
                    builtins.raw-array-from-list(
                      map2({(x, y): [raw-array: x, y]}, xs, ys)),
                    options.{opacity: 100, size: 1, tip: false})
                | function-plot-series(f, options) =>
                  function-plot-int(f, options.{opacity: 100, size: 1, tip: false})
              end
            end)

          partitioned = partition(is-function-plot-int, lst)
          function-plots = partitioned.is-true
          line-and-scatter = partitioned.is-false

          options = if self._infer-bounds:
            points = line-and-scatter.map(
              lam(p :: PlotInternal):
                cases (PlotInternal) p:
                  | function-plot-int(_, _) =>
                    raise('int-plot: function-plot not filtered')
                  | line-plot-int(points, _) => raw-array-to-list(points)
                  | scatter-plot-int(points, _) => raw-array-to-list(points)
                end
              end).foldl(_ + _, empty)

            cases (List) points:
              | empty => self
              | link(f, r) =>

                fun bound(ps :: List<Posn>,
                    base :: Posn,
                    op :: (Number, Number -> Number),
                    accessor :: (Posn -> Number)) -> Number:
                  for fold(acc from accessor(base), p from points):
                    op(accessor(p), acc)
                  end
                end

                x-min = bound(r, f, num-min, raw-array-get(_, 0))
                x-max = bound(r, f, num-max, raw-array-get(_, 0))
                y-min = bound(r, f, num-min, raw-array-get(_, 1))
                y-max = bound(r, f, num-max, raw-array-get(_, 1))
                x-offset = num-min((x-max - x-min) / 40, 1)
                y-offset = num-min((y-max - y-min) / 40, 1)
                shadow x-offset = if unsafe-equal(x-offset, 0): 1 else: x-offset end
                shadow y-offset = if unsafe-equal(y-offset, 0): 1 else: y-offset end
                self
                  .x-min(x-min - x-offset)
                  .x-max(x-max + x-offset)
                  .y-min(y-min - y-offset)
                  .y-max(y-max + y-offset)
            end
          else:
            self
          end

          shadow partitioned = partition(is-line-plot-int, line-and-scatter)
          line-plots = partitioned.is-true
          scatter-plots = partitioned.is-false

          fun helper(shadow options) -> IM.Image:
            shadow function-plots = function-plots.map(generate-xy(_, options))
            ret = P.plot-multi(
              options,
              function-plots + scatter-plots,
              line-plots)
            cases (E.Either<Any, IM.Image>) ret:
              | left(new-options) => helper(new-options)
              | right(image) => image
            end
          end
          helper(options)
        end
      }
  end
where:
  p1 = function-plot(lam(x): x * x end).color(I.red)
  p2 = line-plot([list: 1, 2, 3, 4], [list: 1, 4, 9, 16]).color(I.green)
  p3 = histogram([list: 1, 2, 3, 4], 2)
  plots([list: p1, p2, p3]) raises ""
  plots([list: p1, p2])
    .title('quadratic function and a scatter plot')
    .x-min(0)
    .x-max(20)
    .y-min(0)
    .y-max(20)
    .get-image() does-not-raise
end

fun draw-plot(title :: String, series :: Series):
  plot(series).title(title).display()
end

fun image-plot(title :: String, series :: Series):
  plot(series).title(title).get-image()
end

fun draw-plots(title :: String, serieses :: List<Series>):
  plots(serieses).title(title).display()
end

fun image-plots(title :: String, serieses :: List<Series>):
  plots(serieses).title(title).get-image()
end

#|

   # will restore this later

   default-plot-color-list =
  [list: I.green, I.red, I.orange, I.yellow, I.blue, I.purple, I.brown]

   fun render-plots(
    title :: String,
    infer-bounds :: Boolean,
    plots :: List<Plot>) -> IM.Image:
  len = default-plot-color-list.length()
  new-plots = for map_n(n from 0, p from plots):
    c = {(x): {color: default-plot-color-list.get(num-modulo(n, len))}}
    cases(Plot) p:
      | function-plot(f , _) => function-plot(f, c)
      | line-plot(points, _) => line-plot(points, c)
      | scatter-plot(points, _) => scatter-plot(points, c)
    end
  end
  options = _.{title: title}
  shadow options = if infer-bounds:
    {(config): options(config).{infer-bounds: true}}
  else:
    options
  end
  render-multi-plot(new-plots, options)
   end
|#
