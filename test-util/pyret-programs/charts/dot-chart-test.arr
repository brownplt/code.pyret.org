include chart
include image
import color as C
# include image-structs
include math

labels = [list: "cats", "dogs", "ants", "elephants"]
count = [list: 3, 7, 4, 9]

series = from-list.dot-chart(
  labels,
  count)

img = render-chart(series).get-image()

check:
  img satisfies is-image
end
