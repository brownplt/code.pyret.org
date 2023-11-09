include color
include chart
include image

# Constants

xs = [list: 1, 2, 3, 4, 5]
ys = [list: 1, 4, 9, 16, 25]
ress = [list: +1, -2, +3, -4, +5]

some-ys-rough = [list: 1, ~4.9, 9, 16, ~23.3]

all-ys-rough = [list: ~1.2, ~4.9, ~8.88, ~15.76, ~23.3]

some-ress-rough = [list: +1, ~-2.9, +3, -4, ~+5.67]

all-ress-rough = [list: ~+1.23, ~-2.9, ~+3.29, ~-4.02, ~+5.67]

too-few-ys = [list: 1, 4, 9, 16]

too-few-ress = [list: +1, -2, +3, -4]

# Various interval charts

ser-no-rough = from-list.interval-chart(xs, ys, ress)

ser-some-ys-rough = from-list.interval-chart(xs, some-ys-rough, ress)

ser-some-ress-rough = from-list.interval-chart(xs, ys, some-ress-rough)

ser-some-ys-some-ress-rough = from-list.interval-chart(xs, some-ys-rough, some-ress-rough)

ser-all-ys-some-ress-rough = from-list.interval-chart(xs, all-ys-rough, some-ress-rough)

ser-some-ys-all-ress-rough = from-list.interval-chart(xs, some-ys-rough, all-ress-rough)

ser-all-ys-all-ress-rough = from-list.interval-chart(xs, all-ys-rough, all-ress-rough)

# Helper function

fun render-image(series):
  render-chart(series).get-image()
end

# Actual testing

check "Different kinds of numbers":
  render-image(ser-no-rough) satisfies is-image
  render-image(ser-some-ys-rough) satisfies is-image
  render-image(ser-some-ress-rough) satisfies is-image
  render-image(ser-some-ys-some-ress-rough) satisfies is-image
  render-image(ser-all-ys-some-ress-rough) satisfies is-image
  render-image(ser-some-ys-all-ress-rough) satisfies is-image
  render-image(ser-all-ys-all-ress-rough) satisfies is-image
end

check "Colors":
  render-image(ser-no-rough.color(violet)) satisfies is-image
  render-image(ser-some-ys-rough.color(indigo)) satisfies is-image
  render-image(ser-some-ress-rough.color(blue)) satisfies is-image
  render-image(ser-some-ys-some-ress-rough.color(green)) satisfies is-image
  render-image(ser-all-ys-some-ress-rough.color(yellow)) satisfies is-image
  render-image(ser-some-ys-all-ress-rough.color(orange)) satisfies is-image
  render-image(ser-all-ys-all-ress-rough.color(red)) satisfies is-image
end

check "Different point sizes":
  render-image(ser-no-rough.point-size(10)) satisfies is-image
  render-image(ser-some-ys-rough.point-size(15)) satisfies is-image
  render-image(ser-some-ress-rough.point-size(20.5)) satisfies is-image
  render-image(ser-some-ys-some-ress-rough.point-size(~27.18281828)) satisfies is-image
  render-image(ser-all-ys-some-ress-rough.point-size(30)) satisfies is-image
  render-image(ser-some-ys-all-ress-rough.point-size(35)) satisfies is-image
  render-image(ser-all-ys-all-ress-rough.point-size(40.50)) satisfies is-image
end

check "Different line widths":
  render-image(ser-no-rough.lineWidth(1)) satisfies is-image
  render-image(ser-some-ys-rough.lineWidth(1.5)) satisfies is-image
  render-image(ser-some-ress-rough.lineWidth(~2.718281828)) satisfies is-image
  render-image(ser-some-ys-some-ress-rough.lineWidth(3.14)) satisfies is-image
  render-image(ser-all-ys-some-ress-rough.lineWidth(~3.14)) satisfies is-image
  render-image(ser-some-ys-all-ress-rough.lineWidth(6)) satisfies is-image
  render-image(ser-all-ys-all-ress-rough.lineWidth(7)) satisfies is-image
end

check "Mix and match":
  render-image(ser-no-rough.color(purple).point-size(10)) satisfies is-image
  render-image(ser-some-ys-rough.color(green).lineWidth(2)) satisfies is-image
  render-image(ser-some-ress-rough.point-size(20).lineWidth(3)) satisfies is-image
  render-image(ser-some-ys-some-ress-rough.color(blue).point-size(15).lineWidth(5)) satisfies is-image
  render-image(ser-all-ys-some-ress-rough.color(orange).lineWidth(3).point-size(9)) satisfies is-image
  render-image(ser-some-ys-all-ress-rough.lineWidth(2).point-size(2).color(indigo)) satisfies is-image
  render-image(ser-all-ys-all-ress-rough.lineWidth(3.3).color(yellow).point-size(~2.718281828)) satisfies is-image
end

check "Exceptions":
  from-list.interval-chart(empty, empty, empty) raises "need at least one datum"
  from-list.interval-chart(xs, too-few-ys, ress) raises "xs and ys should have the same length"
  from-list.interval-chart(xs, ys, too-few-ress) raises "deltas should have the same length as xs and ys"
end
