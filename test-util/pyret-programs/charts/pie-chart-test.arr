include color
include chart
include image

# csq "color square"
fun csq(c): square(20, "solid", c) end

image-pie-series = from-list.image-pie-chart(
  [list: csq("red"),  csq("blue"),  csq("green"), csq("pink"),csq("orange")],
  [list: "Pyret",     "OCaml",      "C",          "C++",      "Python"],
  [list: 10,          6,            1,            3,          5])

fun render-image(series):
  render-chart(series).get-image()
end

# invert the y coordinate, since CPO uses the top as 0 and every image editor uses the bottom
top = image-height(render-image(image-pie-series))

################################
# IMAGE PIE CHART TESTS
################################

check "Checking image-pie-chart":
  color-at-position(render-image(image-pie-series), 339, top - 334) is red
  color-at-position(render-image(image-pie-series), 293, top - 179) is blue
  color-at-position(render-image(image-pie-series), 212, top - 215) is green
  color-at-position(render-image(image-pie-series), 216, top - 264) is pink
  color-at-position(render-image(image-pie-series), 245, top - 317) is orange
end

