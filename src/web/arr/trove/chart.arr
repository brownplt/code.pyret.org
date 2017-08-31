provide {
  plot: plot,
  plots: plots,

  from-list: from-list,

  image-plot: image-plot,
  image-plots: image-plots,
  draw-plot: draw-plot,
  draw-plots: draw-plots,
} end

import global as G
import base as B
include lists
import image-structs as I
import image as IM
import sets as S
import chart-lib as P
import either as E
import string-dict as SD
import valueskeleton as VS


################################################################################
# CONSTANTS
################################################################################

SHOW-LENGTH = 3
FUNCTION-POINT-SIZE = 0.1
DEFAULT-RANGE = {-10; 10}

################################################################################
# TYPE SYNONYMS
################################################################################

type PlottableFunction = (Number -> Number)
type Posn = RawArray<Number>
type TableIntern = RawArray<RawArray<Any>>

################################################################################
# HELPERS
################################################################################

fst = raw-array-get(_, 0)
snd = raw-array-get(_, 1)
posn = {(x :: Number, y :: Number, z :: String): [raw-array: x, y, z]}

sprintf = (lam():
    generic-sprintf = lam(arr :: RawArray<Any>):
      raw-array-fold(lam(str, elt, _): str + tostring(elt) end, '', arr, 0)
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
  end)()

unsafe-equal = {(x :: Number, y :: Number): (x <= y) and (y <= x)}

fun to-table2(xs :: List<Any>, ys :: List<Any>) -> TableIntern:
  map2({(x, y): [raw-array: x, y]}, xs, ys) ^ builtins.list-to-raw-array
end

fun to-table3(xs :: List<Any>, ys :: List<Any>, zs :: List<Any>) -> TableIntern:
  map3({(x, y, z): [raw-array: x, y, z]}, xs, ys, zs) ^ builtins.list-to-raw-array
end

fun truncate<A>(lst :: List<A>) -> List<A>:
  take(num-min(SHOW-LENGTH, lst.length()), lst)
end

fun negate<A>(f :: (A -> Boolean)) -> (A -> Boolean): {(x :: A): not(f(x))} end

################################################################################
# BOUNDING BOX
################################################################################

type BoundingBox = {
  x-min :: Number,
  x-max :: Number,
  y-min :: Number,
  y-max :: Number,
  is-valid :: Boolean
}
default-bounding-box :: BoundingBox = {
  x-min: 0,
  x-max: 0,
  y-min: 0,
  y-max: 0,
  is-valid: false,
}

fun get-bounding-box(ps :: List<Posn>) -> BoundingBox:
  cases (List<Number>) ps:
    | empty => default-bounding-box.{is-valid: false}
    | link(f, r) =>
      fun compute(p :: (Number, Number -> Number), accessor :: (Posn -> Number)):
        for fold(prev from accessor(f), e from r): p(prev, accessor(e)) end
      end
      default-bounding-box.{
        x-min: compute(num-min, fst),
        x-max: compute(num-max, fst),
        y-min: compute(num-min, snd),
        y-max: compute(num-max, snd),
        is-valid: true,
      }
  end
end

################################################################################
# DEFAULT VALUES
################################################################################

default-series = {get-data: {(): nothing}}

type PieChartSeries = {
  # for decoration
  labels :: List<String>,
  values :: List<Number>,
  # end for decoration
  get-data :: ( -> Any)
}

default-pie-chart-series :: PieChartSeries  = default-series.{
  labels: empty,
  values: empty,
}

############

type BarChartSeries = {
  # for decoration
  labels :: List<String>,
  value-lists :: List<List<Number>>,
  # end for decoration
  get-data :: ( -> Any)
}

default-bar-chart-series :: BarChartSeries = default-series.{
  labels: empty,
  value-lists: empty,
}

############

type HistogramSeries = {
  # for decoration
  labels :: List<String>,
  values :: List<Number>,
  # end for decoration
  bin-width :: Number,
  max-num-bins :: Number,
  min-num-bins :: Number,
  value-name :: String,
  get-data :: ( -> Any)
}

default-histogram-series :: HistogramSeries  = default-series.{
  labels: empty,
  values: empty,
  bin-width: 0,
  max-num-bins: 0,
  min-num-bins: 0,
  value-name: 'Value',
}

############

type LinePlotSeries = {
  # for decoration
  xs :: List<Number>,
  ys :: List<Number>,
  # end for decoration
  color :: I.Color,
  legend :: String,
  get-data :: ( -> Any)
}

default-line-plot-series :: LinePlotSeries = default-series.{
  xs: empty,
  ys: empty,
  color: I.red,
  legend: '',
}

############

type ScatterPlotSeries = {
  # for decoration
  xs :: List<Number>,
  ys :: List<Number>,
  # end for decoration
  labels :: List<String>,
  color :: I.Color,
  legend :: String,
  point-size :: Number,
  get-data :: ( -> Any)
}

default-scatter-plot-series :: ScatterPlotSeries = default-series.{
  xs: empty,
  ys: empty,
  labels: empty,
  color: I.blue,
  legend: '',
  point-size: 7
}

############

type FunctionPlotSeries = {
  f :: PlottableFunction,
  color :: I.Color,
  legend :: String,
  get-data :: ( -> Any)
}

default-function-plot-series :: FunctionPlotSeries = default-series.{
  f: {(x): x},
  color: I.blue,
  legend: '',
}

###########

type WindowOptions = {
  x-min :: Number,
  x-max :: Number,
  y-min :: Number,
  y-max :: Number,
  num-samples :: Number
}

type ChartWindowObject = {
  interact :: Boolean,
  title :: String,
  width :: Number,
  height :: Number,
  x-axis :: String,
  y-axis :: String,
  x-min :: Number,
  x-max :: Number,
  y-min :: Number,
  y-max :: Number,
  num-samples :: Number,
  render :: ( -> IM.Image)
}

default-chart-window-object :: ChartWindowObject = {
  interact: true,
  title: '',
  width: 400,
  height: 300,
  x-axis: '',
  y-axis: '',
  x-min: 0,
  x-max: 0,
  y-min: 0,
  y-max: 0,
  num-samples: 1000,
  method render(self): raise('unimplemented') end,
}

################################################################################
# DATA DEFINITIONS
################################################################################

data DataSeries:
  | line-plot-series(obj :: LinePlotSeries) with:
    is-single: false,
    constr: {(): line-plot-series},
    method color(self, color :: I.Color):
      line-plot-series(self.obj.{color: color})
    end,
    method legend(self, legend :: String):
      line-plot-series(self.obj.{legend: legend})
    end,
  | scatter-plot-series(obj :: ScatterPlotSeries) with:
    is-single: false,
    constr: {(): scatter-plot-series},
    method color(self, color :: I.Color):
      scatter-plot-series(self.obj.{color: color})
    end,
    method legend(self, legend :: String):
      scatter-plot-series(self.obj.{legend: legend})
    end,
    method point-size(self, point-size :: Number):
      scatter-plot-series(self.obj.{point-size: point-size})
    end,
  | function-plot-series(obj :: FunctionPlotSeries) with:
    is-single: false,
    constr: {(): function-plot-series},
    method color(self, color :: I.Color):
      function-plot-series(self.obj.{color: color})
    end,
    method legend(self, legend :: String):
      function-plot-series(self.obj.{legend: legend})
    end,
  | pie-chart-series(obj :: PieChartSeries) with:
    is-single: true,
    constr: {(): pie-chart-series},
  | bar-chart-series(obj :: BarChartSeries) with:
    is-single: true,
    constr: {(): bar-chart-series},
  | histogram-series(obj :: HistogramSeries) with:
    is-single: true,
    constr: {(): histogram-series},
    method bin-width(self, bin-width :: Number):
      histogram-series(self.obj.{bin-width: bin-width})
    end,
    method max-num-bins(self, max-num-bins :: Number):
      histogram-series(self.obj.{max-num-bins: max-num-bins})
    end,
    method min-num-bins(self, min-num-bins :: Number):
      histogram-series(self.obj.{min-num-bins: min-num-bins})
    end,
    method num-bins(self, num-bins :: Number):
      histogram-series(self.obj.{min-num-bins: num-bins, max-num-bins: num-bins})
    end,
    method value-name(self, value-name :: String):
      histogram-series(self.obj.{value-name: value-name})
    end,
end

fun check-chart-window(p :: ChartWindowObject) -> Nothing block:
  when (p.width <= 0) or (p.height <= 0):
    raise('render: width and height must be positive')
  end
end

################################################################################
# METHODS
################################################################################

title-method = method(self, title :: String):
  self.constr()(self.obj.{title: title})
end

width-method = method(self, width :: Number):
  self.constr()(self.obj.{width: width})
end

height-method = method(self, height :: Number):
  self.constr()(self.obj.{height: height})
end

x-axis-method = method(self, x-axis :: String):
  self.constr()(self.obj.{x-axis: x-axis})
end

y-axis-method = method(self, y-axis :: String):
  self.constr()(self.obj.{y-axis: y-axis})
end

x-range-method = method(self, x-min :: Number, x-max :: Number) block:
  when (x-min >= x-max) and (not(unsafe-equal(x-min, 0)) or
      not(unsafe-equal(x-max, 0))):
    raise([sprintf: 'x-range: x-min must be strictly less than x-max, ',
        'except x-min, x-max both equal 0 which will infer ',
        'appropriate values'])
  end
  self.constr()(self.obj.{x-min: x-min, x-max: x-max})
end

y-range-method = method(self, y-min :: Number, y-max :: Number) block:
  when (y-min >= y-max) and (not(unsafe-equal(y-min, 0)) or
      not(unsafe-equal(y-max, 0))):
    raise([sprintf: 'y-range: y-min must be strictly less than y-max, ',
        'except y-min, y-max both equal 0 which will infer ',
        'appropriate values'])
  end
  self.constr()(self.obj.{y-min: y-min, y-max: y-max})
end


data ChartWindow:
  | pie-chart-window(obj :: ChartWindowObject) with:
    constr: {(): pie-chart-window},
    title: title-method,
    width: width-method,
    height: height-method,
  | bar-chart-window(obj :: ChartWindowObject) with:
    constr: {(): bar-chart-window},
    title: title-method,
    width: width-method,
    height: height-method,
    x-axis: x-axis-method,
    y-axis: y-axis-method,
    y-range: y-range-method,
  | histogram-chart-window(obj :: ChartWindowObject) with:
    constr: {(): histogram-chart-window},
    title: title-method,
    width: width-method,
    height: height-method,
    x-axis: x-axis-method,
    y-axis: y-axis-method,
    x-range: x-range-method,
    y-range: y-range-method,
  | plot-chart-window(obj :: ChartWindowObject) with:
    constr: {(): plot-chart-window},
    title: title-method,
    width: width-method,
    height: height-method,
    x-axis: x-axis-method,
    y-axis: y-axis-method,
    x-range: x-range-method,
    y-range: y-range-method,
    # TODO: minor feature
    #method show-legend(self, show-legend :: Boolean):
    #  plot-chart-window(self.obj.{show-legend: show-legend})
    #end,
    method num-samples(self, num-samples :: Number) block:
      when (num-samples <= 0) or (num-samples > 100000) or not(num-is-integer(num-samples)):
        raise('num-samples: value must be an ineger between 1 and 100000')
      end
      plot-chart-window(self.obj.{num-samples: num-samples})
    end,
sharing:
  method display(self):
    _ = check-chart-window(self.obj)
    self.obj.{interact: true}.render()
  end,
  method get-image(self):
    _ = check-chart-window(self.obj)
    self.obj.{interact: false}.render()
  end,
end

################################################################################
# FUNCTIONS
################################################################################

fun function-plot-from-list(f :: PlottableFunction) -> DataSeries:
  default-function-plot-series.{
    f: f,
    method get-data(self): self.{f: f} end,
  } ^ function-plot-series
end

fun line-plot-from-list(xs :: List<Number>, ys :: List<Number>) -> DataSeries block:
  when xs.length() <> ys.length():
    raise('line-plot: xs and ys should have the same length')
  end
  ps = map2({(x, y): [raw-array: x, y, '']}, xs, ys)
  default-line-plot-series.{
    xs: xs ^ truncate,
    ys: ys ^ truncate,
    method get-data(self): self.{ps: ps} end,
  } ^ line-plot-series
end

fun scatter-plot-from-list(xs :: List<Number>, ys :: List<Number>) -> DataSeries block:
  when xs.length() <> ys.length():
    raise('scatter-plot: xs and ys should have the same length')
  end
  labeled-scatter-plot-from-list(xs, ys, xs.map({(_): ''}))
end

fun labeled-scatter-plot-from-list(
  xs :: List<Number>,
  ys :: List<Number>,
  labels :: List<String>) -> DataSeries block:
  when xs.length() <> ys.length():
    raise('labeled-scatter-plot: xs and ys should have the same length')
  end
  when xs.length() <> labels.length():
    raise('labeled-scatter-plot: xs and labels should have the same length')
  end
  ps = map3({(x, y, z): [raw-array: x, y, z]}, xs, ys, labels)
  default-scatter-plot-series.{
    xs: xs ^ truncate,
    ys: ys ^ truncate,
    labels: labels ^ truncate,
    method get-data(self): self.{ps: ps} end,
  } ^ scatter-plot-series
end

fun exploding-pie-chart-from-list(
  labels :: List<String>,
  values :: List<Number>,
  offsets :: List<Number>
) -> DataSeries block:
  label-length = labels.length()
  value-length = values.length()
  when label-length <> value-length:
    raise('exploding-pie-chart: labels and values should have the same length')
  end
  offset-length = offsets.length()
  when label-length <> offset-length:
    raise('exploding-pie-chart: labels and offsets should have the same length')
  end
  when label-length == 0:
    raise('exploding-pie-chart: need at least one data')
  end
  for each(offset from offsets):
    when (offset < 0) or (offset > 1):
      raise('exploding-pie-chart: offset must be between 0 and 1')
    end
  end
  tab = to-table3(labels, values, offsets)
  default-pie-chart-series.{
    labels: labels ^ truncate,
    values: values ^ truncate,
    offsets: offsets ^ truncate,
    method get-data(self): self.{tab: tab} end,
  } ^ pie-chart-series
end

fun pie-chart-from-list(labels :: List<String>, values :: List<Number>) -> DataSeries block:
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
  tab = to-table3(labels, values, labels.map({(_): 0}))
  default-pie-chart-series.{
    labels: labels ^ truncate,
    values: values ^ truncate,
    method get-data(self): self.{tab: tab} end,
  } ^ pie-chart-series
end

fun bar-chart-from-list(labels :: List<String>, values :: List<Number>) -> DataSeries block:
  doc: ```
       Consume labels, a list of string, and values, a list of numbers
       and construct a bar chart
       ```
  label-length = labels.length()
  value-length = values.length()
  when label-length <> value-length:
    raise('bar-chart: labels and values should have the same length')
  end
  value-lists = values.map({(v): [list: v]})
  shadow value-lists = value-lists.map(builtins.list-to-raw-array)
  tab = to-table2(labels, value-lists)
  default-bar-chart-series.{
    labels: labels ^ truncate,
    value-lists: value-lists ^ truncate,
    method get-data(self):
      self.{
        tab: tab,
        legends: [raw-array: ''],
        has-legend: false,
      }
    end,
  } ^ bar-chart-series
end

fun grouped-bar-chart-from-list(
  labels :: List<String>,
  value-lists :: List<List<Number>>,
  legends :: List<String>
) -> DataSeries block:
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
  shadow value-lists = value-lists.map(builtins.list-to-raw-array)
  tab = to-table2(labels, value-lists)
  legends-arr = legends ^ builtins.list-to-raw-array
  default-bar-chart-series.{
    labels: labels ^ truncate,
    value-lists: value-lists ^ truncate,
    legends: legends ^ truncate,
    method get-data(self):
      {
        tab: tab,
        legends: legends-arr,
        has-legend: true,
      }
    end,
  } ^ bar-chart-series
end

fun freq-bar-chart-from-list(label :: List<String>) -> DataSeries block:
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
  bar-chart-from-list(ls.reverse(), vs.reverse())
end

fun histogram-from-list(values :: List<Number>) -> DataSeries block:
  doc: ```
       Consume a list of numbers and construct a histogram
       ```
  tab = to-table2(values.map({(_): ''}), values)
  default-histogram-series.{
    values: values ^ truncate,
    method get-data(self): self.{tab: tab} end,
  } ^ histogram-series
end

fun labeled-histogram-from-list(labels :: List<String>, values :: List<Number>) -> DataSeries block:
  doc: ```
       Consume a list of strings and a list of numbers and construct a histogram
       ```
  label-length = labels.length()
  value-length = values.length()
  when label-length <> value-length:
    raise('labeled-histogram: labels and values should have the same length')
  end
  tab = to-table2(labels, values)
  default-histogram-series.{
    labels: labels ^ truncate,
    values: values ^ truncate,
    method get-data(self): self.{tab: tab} end,
  } ^ histogram-series
end

from-list = {
  line-plot: line-plot-from-list,
  labeled-scatter-plot: labeled-scatter-plot-from-list,
  scatter-plot: scatter-plot-from-list,
  function-plot: function-plot-from-list,

  histogram: histogram-from-list,
  labeled-histogram: labeled-histogram-from-list,
  pie-chart: pie-chart-from-list,
  exploding-pie-chart: exploding-pie-chart-from-list,
  bar-chart: bar-chart-from-list,
  grouped-bar-chart: grouped-bar-chart-from-list,
}

################################################################################
# PLOTS
################################################################################

fun plot(s :: DataSeries) -> ChartWindow:
  doc: 'Plot it!'
  cases (DataSeries) s:
    | line-plot-series(_) => plots([list: s])
    | function-plot-series(_) => plots([list: s])
    | scatter-plot-series(_) => plots([list: s])
    | pie-chart-series(obj) =>
      default-chart-window-object.{
        method render(self): P.pie-chart(self, obj.get-data()) end
      } ^ pie-chart-window
    | bar-chart-series(obj) =>
      obj-data = obj.get-data()
      default-chart-window-object.{
        method render(self): P.bar-chart(self, obj.get-data()) end
      } ^ bar-chart-window
    | histogram-series(obj) =>
      default-chart-window-object.{
        method render(self): P.histogram(self, obj.get-data()) end
      } ^ histogram-chart-window
  end
where:
  plot-now = {(x): plot(x).get-image()}

  plot-now(from-list.exploding-pie-chart(
      [list: 'asd', 'dsa', 'qwe'],
      [list: 1, 2, 3],
      [list: 0, 0.1, 0.2])) does-not-raise
  plot-now(from-list.pie-chart([list: 'asd', 'dsa', 'qwe'], [list: 1, 2, 3])) does-not-raise
  plot-now(from-list.histogram([list: 1, 1.2, 2, 3, 10, 3, 6, -1])) does-not-raise
  plot-now(from-list.labeled-histogram(
      [list: 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      [list: 1, 1.2, 2, 3, 10, 3, 6, -1])) does-not-raise
  plot-now(from-list.grouped-bar-chart(
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
  plot-now(from-list.function-plot(num-sin)) does-not-raise
  plot-now(from-list.scatter-plot(
      [list: 1, 1, 4, 7, 4, 2],
      [list: 2, 3.1, 1, 3, 6, 5])) does-not-raise
  plot-now(from-list.line-plot(
      [list: 1, 1, 4, 7, 4, 2],
      [list: 2, 3.1, 1, 3, 6, 5])) does-not-raise
end

fun generate-xy(
    p :: FunctionPlotSeries,
    x-min :: Number,
    x-max :: Number,
    num-samples :: Number) -> ScatterPlotSeries:
  doc: 'Generate a scatter-plot from an function-plot'
  fraction = (x-max - x-min) / (num-samples - 1)

  ps = for filter-map(i from range(0, num-samples)):
    x = x-min + (fraction * i)
    cases (E.Either) run-task({(): p.f(x)}):
      | left(y) => some([raw-array: x, y, ''])
      | right(_) => none
    end
  end
  default-scatter-plot-series.{
    method get-data(self): self.{ps: ps} end,
    point-size: FUNCTION-POINT-SIZE,
    color: p.color,
    legend: p.legend,
  }
where:
  generate-xy(from-list.function-plot(_ + 1).obj, 0, 100, 6).get-data().ps
    is=~ [list:
    posn(0, 1, ''),
    posn(20, 21, ''),
    posn(40, 41, ''),
    posn(60, 61, ''),
    posn(80, 81, ''),
    posn(100, 101, '') # out of bound, will be filtered later
  ]
end

fun widen-range(min :: Number, max :: Number) -> {Number; Number}:
  offset = num-min((max - min) / 40, 1)
  shadow offset = if unsafe-equal(offset, 0): 1 else: offset end
  {min - offset; max + offset}
end

fun ps-to-arr(obj): obj.{ps: obj.ps ^ builtins.list-to-raw-array} end

fun in-bound-x(p :: Posn, self) -> Boolean:
  (self.x-min <= fst(p)) and (fst(p) <= self.x-max)
end

fun in-bound-y(p :: Posn, self) -> Boolean:
  (self.y-min <= snd(p)) and (snd(p) <= self.y-max)
end

fun in-bound-xy(p :: Posn, self) -> Boolean:
  in-bound-x(p, self) and in-bound-y(p, self)
end

fun dist(a :: Posn, b :: Posn) -> Number:
  num-sqr(fst(a) - fst(b)) + num-sqr(snd(a) - snd(b))
end

fun nearest(lst :: List<Posn>, p :: Posn) -> Option<Posn>:
  cases (List<Posn>) lst:
    | empty => none
    | link(f, r) =>
      {_; sol} = for fold({best; sol} from {dist(p, f); f}, e from lst):
        new-dist = dist(p, e)
        if new-dist < best:
          {new-dist; e}
        else:
          {best; sol}
        end
      end
      some(sol)
  end
end

fun find-pt-on-edge(in :: Posn, out :: Posn, self) -> Option<Posn>:
  px-max = num-min(num-max(fst(in), fst(out)), self.x-max)
  px-min = num-max(num-min(fst(in), fst(out)), self.x-min)
  py-max = num-min(num-max(snd(in), snd(out)), self.y-max)
  py-min = num-max(num-min(snd(in), snd(out)), self.y-min)

  candidates = if unsafe-equal(fst(in), fst(out)):
    [list: posn(fst(in), self.y-min, ''), posn(fst(in), self.y-max, '')]
  else:
    #|
    y = m * x + c           [3]
    y2 = m * x2 + c         [3.1]
    y - y2 = m * (x - x2)   [5]   [by 3 - 3.1]
    m = (y - y2) / (x - x2) [1]   [rewrite 5]
    c = y - m * x           [2]   [rewrite 3]
    x = (y - c) / m         [4]   [rewrite 3]
    |#
    m = (snd(in) - snd(out)) / (fst(in) - fst(out))
    c = snd(in) - (m * fst(in))

    # find y from x
    f = {(x): (m * x) + c}

    # find x from y
    g = {(y): (y - c) / m}

    [list:
      posn(self.x-min, f(self.x-min), ''),
      posn(self.x-max, f(self.x-max), '')] +
    if unsafe-equal(m, 0):
      empty
    else:
      [list:
        posn(g(self.y-min), self.y-min, ''),
        posn(g(self.y-max), self.y-max, '')]
    end
  end
  candidates.filter({(p): (px-min <= fst(p)) and (fst(p) <= px-max) and
                          (py-min <= snd(p)) and (snd(p) <= py-max)})
    ^ nearest(_, in)
end

fun line-plot-edge-cut(pts :: List<Posn>, self) -> List<Posn>:
  segments = cases (List<Posn>) pts:
    | empty => empty
    | link(f, r) =>
      {segments; _} = for fold({segments; start} from {empty; f}, stop from r):
        segment = ask:
          | in-bound-xy(start, self) and in-bound-xy(stop, self) then:
            [list: start, stop]
          | in-bound-xy(start, self) then:
            [list: start, find-pt-on-edge(start, stop, self).value]
          | in-bound-xy(stop, self) then:
            [list: find-pt-on-edge(start, stop, self).value, stop]
          | otherwise:
            cases (Option) find-pt-on-edge(start, stop, self):
              | none => empty
              | some(result) =>
                result2 = find-pt-on-edge(stop, start, self).value
                [list: result, result2]
            end
        end
        cases (List) segment:
          | empty => {segments; stop}
          | link(_, _) => {link(segment, segments); stop}
        end
      end
      segments
  end

  cases (List) segments block:
    | empty => empty
    | link(f, r) =>
      {_; result} = for fold({prev; lst} from {f; f}, segment from r):
        pt-a = prev.get(0)
        pt-b = segment.get(1)
        new-lst = if unsafe-equal(fst(pt-a), fst(pt-b)) and unsafe-equal(snd(pt-a), snd(pt-b)):
          link(segment.get(0), lst)
        else:
          segment + link(P.null, lst)
        end
        {segment; new-lst}
      end
      result
  end
end

fun plots(lst :: List<DataSeries>) -> ChartWindow block:
  doc: "Plot 'em all"
  cases (Option) find(_.is-single, lst):
    | some(v) => raise(
        [sprintf: "plots: can't plot ", v, " with `plots`. Use `plot` instead."])
    | else => nothing
  end
  cases (List<DataSeries>) lst:
    | empty => raise('plots: need at least one series to plot')
    | else => nothing
  end

  partitioned = partition(is-function-plot-series, lst)
  function-plots :: List<{f :: PlottableFunction, color :: I.Color}> =
    partitioned.is-true.map({(p :: DataSeries): p.obj.get-data()})
  shadow partitioned = partition(is-line-plot-series, partitioned.is-false)
  line-plots :: List<{ps :: List<Posn>, color :: I.Color}> =
    partitioned.is-true.map({(p :: DataSeries): p.obj.get-data()})
  scatter-plots :: List<{ps :: List<Posn>, color :: I.Color}> =
    partitioned.is-false.map({(p :: DataSeries): p.obj.get-data()})

  default-chart-window-object.{
    method render(self) block:
      is-infer-x = unsafe-equal(self.x-min, 0) and unsafe-equal(self.x-max, 0)
      is-infer-y = unsafe-equal(self.y-min, 0) and unsafe-equal(self.y-max, 0)

      combined-pts = if is-infer-x or is-infer-y:
        (line-plots.map(_.ps) + scatter-plots.map(_.ps)).foldl(_ + _, empty)
      else:
        empty
      end

      shadow combined-pts = if not(is-infer-x):
        combined-pts.filter(in-bound-x(_, self))
      else:
        combined-pts
      end

      shadow combined-pts = if not(is-infer-y):
        combined-pts.filter(in-bound-y(_, self))
      else:
        combined-pts
      end

      maybe-bbox = if is-infer-x or is-infer-y:
        some(get-bounding-box(combined-pts))
      else:
        none
      end

      shadow self = if is-infer-x:
        cases (Option) maybe-bbox:
          | none => raise('impossible')
          | some(bbox) =>
            {x-min; x-max} = if bbox.is-valid:
              widen-range(bbox.x-min, bbox.x-max)
            else:
              DEFAULT-RANGE
            end
            self.{x-min: x-min, x-max: x-max}
        end
      else:
        self
      end

      function-plots-data = function-plots
        .map(generate-xy(_, self.x-min, self.x-max, self.num-samples))
        .map(_.get-data())

      shadow self = if is-infer-y:
        cases (Option) maybe-bbox:
          | none => raise('impossible')
          | some(bbox) =>
            function-plots-pts = function-plots-data.map(_.ps).foldl(_ + _, empty)
            bbox2 = get-bounding-box(function-plots-pts)
            {y-min; y-max} = if bbox.is-valid or bbox2.is-valid:
              {y-min; y-max} = if bbox.is-valid and bbox2.is-valid:
                {num-min(bbox.y-min, bbox2.y-min); num-max(bbox.y-max, bbox2.y-max)}
                else if bbox.is-valid:
                {bbox.y-min; bbox.y-max}
                else:
                {bbox2.y-min; bbox2.y-max}
              end
              widen-range(y-min, y-max)
            else:
              DEFAULT-RANGE
            end
            self.{y-min: y-min, y-max: y-max}
        end
      else:
        self
      end

      fun helper(shadow self, shadow function-plots-data :: Option) -> IM.Image block:
        shadow function-plots-data = cases (Option) function-plots-data:
          | none => function-plots
              .map(generate-xy(_, self.x-min, self.x-max, self.num-samples))
              .map(_.get-data())
          | some(shadow function-plots-data) => function-plots-data
        end

        scatters-arr = for map(p from scatter-plots + function-plots-data):
          ps-to-arr(p.{ps: p.ps.filter(in-bound-xy(_, self))})
        end ^ reverse ^ builtins.list-to-raw-array

        # NOTE: lines-arr has JavaScript's null in it.
        # Don't try to inspect it from Pyret's side
        lines-arr = for map(p from line-plots):
          ps-to-arr(p.{ps: line-plot-edge-cut(p.ps, self)})
        end ^ reverse ^ builtins.list-to-raw-array

        ret = P.plot-multi(self, {scatters: scatters-arr, lines: lines-arr})
        cases (E.Either<Any, IM.Image>) ret:
          | left(new-self) => helper(new-self, none)
          | right(image) =>
            if self.interact:
              # can't use image here because it contains the side panel
              P.plot-multi(
                self.{interact: false},
                {scatters: scatters-arr, lines: lines-arr}).v
            else:
              image
            end
        end
      end
      helper(self, some(function-plots-data))
    end
  } ^ plot-chart-window
where:
  p1 = from-list.function-plot(lam(x): x * x end).color(I.red)
  p2 = from-list.line-plot([list: 1, 2, 3, 4], [list: 1, 4, 9, 16]).color(I.green)
  p3 = from-list.histogram([list: 1, 2, 3, 4])
  plots([list: p1, p2, p3]) raises ''
  plots([list: p1, p2])
    .title('quadratic function and a scatter plot')
    .x-range(0, 20)
    .y-range(0, 20)
    .get-image() does-not-raise
end

fun draw-plot(title :: String, series :: DataSeries) -> IM.Image:
  plot(series).title(title).display()
end

fun image-plot(title :: String, series :: DataSeries) -> IM.Image:
  plot(series).title(title).get-image()
end

fun draw-plots(title :: String, serieses :: List<DataSeries>) -> IM.Image:
  plots(serieses).title(title).display()
end

fun image-plots(title :: String, serieses :: List<DataSeries>) -> IM.Image:
  plots(serieses).title(title).get-image()
end
