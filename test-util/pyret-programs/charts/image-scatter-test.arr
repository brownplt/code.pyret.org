include chart
include image
include image-structs
include tables

# test for image-scatter-plot
fun image-scatter-plot(t, f, xs, ys):
  if not(is-number(t.column(xs).get(0)) and is-number(t.column(ys).get(0))):
    raise("Cannot make a scatter plot, because the 'xs' and 'ys' columns must both contain numeric data")
  else:
    images = t.all-rows().map(f)
    render-chart(from-list.image-scatter-plot(images, t.column(xs), t.column(ys)))
      .x-axis(xs)
      .y-axis(ys)
      .get-image()
  end
end

test = table: x, y, name
  row: 10, 10, "Joe"
  row: 20, 20, "emmanuel"
end

img = image-scatter-plot(test, lam(r): circle(string-length(r["name"]), "solid", "red") end, "x", "y" )

check:
  img satisfies is-image
  color-at-position(img, 610, 113) is red
end

