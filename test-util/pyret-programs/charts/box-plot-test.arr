include chart
include image
include image-structs
include tables

# test for modified-box-plot
fun box-plot(t, vs):
  if not(is-number(t.column(vs).get(0))):
    raise("Cannot make a box plot, because the 'values' column does not contain numeric data")
  else:
    series = from-list.labeled-box-plot([list: vs], [list: t.column(vs)])
      .show-outliers(false).horizontal(true)
    render-chart(series).get-image()
  end
end
fun modified-box-plot(t, vs):
  if not(is-number(t.column(vs).get(0))):
    raise("Cannot make a box plot, because the 'values' column does not contain numeric data")
  else:
    series = from-list.labeled-box-plot([list: vs], [list: t.column(vs)])
      .horizontal(true)
    render-chart(series).get-image()
  end
end

test2 = table: pounds
row:  37/5
row:  81/10
row:  42/5
row:  46/5
row:  13/2
row:  16/5
row:  67/5
row:  48
row:  123
row:  92
row:  258/5
row:  761/10
row:  112
row:  289/10
row:  88
row:  264/5
row:  353/10
row:  161
row:  227/5
row:  172
row:  3/10
row:  6/5
row:  7/2
row:  43/10
row:  1/10
row:  68
row:  32
row:  44/5
row:  21/10
row:  17/10
end

img2 = box-plot(test2, "pounds")
img3 = modified-box-plot(test2, "pounds")

check:
  img2 satisfies is-image
  color-at-position(img2, 539, 264) is%(within-rel(0.02)) color(119, 119, 119, 1)
  img3 satisfies is-image
    color-at-position(img3, 539, 264) is color(129, 129, 129, 0.30196078431372548)
end
