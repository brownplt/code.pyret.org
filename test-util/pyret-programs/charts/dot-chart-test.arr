include chart
include image
import color as C
# include image-structs
include math

labels = [list: "cats", "dogs", "ants", "elephants"]
count = [list: 3, 7, 4, 9]
nlabels = [list: 2, 4, 3, 1]

zoo-series = from-list.dot-chart(labels, count)

n-zoo-series = from-list.num-dot-chart(nlabels, count)

just-red = [list: C.red]
rainbow-colors = [list: C.red, C.orange, C.yellow, C.green, C.blue, C.indigo, C.violet]
manual-colors =
  [list:
    C.color(51, 72, 252, 0.57), C.color(195, 180, 104, 0.87),
    C.color(115, 23, 159, 0.24), C.color(144, 12, 138, 0.13),
    C.color(31, 132, 224, 0.83), C.color(166, 16, 72, 0.59),
    C.color(58, 193, 241, 0.98)]
fewer-colors = [list: C.red, C.green, C.blue, C.orange, C.purple]
more-colors = [list: C.red, C.green, C.blue, C.orange, C.purple, C.yellow, C.indigo, C.violet]

fun render-image(series):
  render-chart(series).get-image()
end

zoo = render-image(zoo-series)
zoo-red = render-image(zoo-series.colors(just-red))
zoo-rainbow = render-image(zoo-series.colors(rainbow-colors))
zoo-manual = render-image(zoo-series.colors(manual-colors))
zoo-fewer = render-image(zoo-series.colors(fewer-colors))
zoo-more = render-image(zoo-series.colors(more-colors))

n-zoo = render-image(n-zoo-series)
n-zoo-red = render-image(n-zoo-series.colors(just-red))
n-zoo-rainbow = render-image(n-zoo-series.colors(rainbow-colors))
n-zoo-manual = render-image(n-zoo-series.colors(manual-colors))
n-zoo-fewer = render-image(n-zoo-series.colors(fewer-colors))
n-zoo-more = render-image(n-zoo-series.colors(more-colors))

check:
  zoo satisfies is-image
  zoo-red satisfies is-image
  zoo-rainbow satisfies is-image
  zoo-manual satisfies is-image
  zoo-fewer satisfies is-image
  zoo-more satisfies is-image

  n-zoo satisfies is-image
  n-zoo-red satisfies is-image
  n-zoo-rainbow satisfies is-image
  n-zoo-manual satisfies is-image
  n-zoo-fewer satisfies is-image
  n-zoo-more satisfies is-image
end
