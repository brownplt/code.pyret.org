include image
# The height the horizon should reach
HORIZON-HEIGHT = 100
# The height of the whole image
HEIGHT = 300
# The width of the whole image
WIDTH = 400
SUN = circle(25, "solid", "yellow")
GROUND = rectangle(400, 100, "solid", "brown")
BACKGROUND = rectangle(400, 300, "solid", "light blue")

check "regression for put-image comparison":

  si = put-image(
      GROUND,
      WIDTH / 2,
      HORIZON-HEIGHT / 2,
      put-image(
      circle(25, "solid", "yellow"),
        0,
        300,
        BACKGROUND))

  si2 = put-image(
      GROUND,
      WIDTH / 2,
      HORIZON-HEIGHT / 2,
      put-image(
      circle(25, "solid", "yellow"),
        0,
        300,
        BACKGROUND))

  si is si2


  si3 = put-image(
      circle(25, "solid", "yellow"),
      0,
      300,
      put-image(
        GROUND,
        WIDTH / 2,
        HORIZON-HEIGHT / 2,
        BACKGROUND))

  si is si3
end

