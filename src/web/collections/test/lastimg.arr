include world
include image

big-bang(10,
  [list:
    last-image(lam(x): text(num-to-string(75), 75, "red") end),
    to-draw(lam(x): text(num-to-string(x), x, "blue") end),
    on-tick(lam(x): x + 10 end),
    stop-when(lam(x): x > 90 end)])
