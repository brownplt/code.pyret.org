include chart
include image
include image-structs
include math

fun f(r): star(50, "solid", "red") end
values = [list: 1,3,4]
labels = [list: "a","b","c"]

series = from-list.image-pie-chart(
  values.map(f),
  labels,
  values)
  
img = render-chart(series)
  .get-image()

check:
  img satisfies is-image
  color-at-position(img, 408, 252) is red
end
