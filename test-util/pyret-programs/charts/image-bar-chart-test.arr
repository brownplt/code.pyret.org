include chart
include image
include image-structs
include math

fun f(r): star(50, "solid", "red") end
count = [list: 1,3]
labels = [list: "dog","cat"]

series = from-list.image-bar-chart(
  count.map(f),
  labels,
  count)
  
img = render-chart(series)
  .y-axis("species")
  .y-min(0)
  .get-image()

check:
  img satisfies is-image
  color-at-position(img, 504, 258) is red
end
