use context essentials2021

import constants as C

E = C.E
shadow PI = C.PI

sqrt     = num-sqrt
expt     = num-expt
sqr      = num-sqr
abs      = num-abs
dilate   = scale
shadow translate = put-image
cos      = num-cos
sin      = num-sin
tan      = num-tan
negate  = lam(x): -1 * x end

img = text("Joe", 50, "purple")
img2 = rectangle(1000, 200, "outline", "black")

check:
  sqrt(1) is 1
  expt(2, 3) is 8
  sqr(2) is 4
  abs(-7) is 7
  dilate(2, img) is scale(2, img)
  translate(img, 100, 200, img2) is put-image(img, 100, 200, img2)
  cos(0) is 1
  sin(0) is 0
  tan(0) is 0
  negate(-8) is 8
  cos(PI) is-roughly ~-1
  sin(PI / 2) is-roughly ~1
  num-exp(1) is-roughly E
end
